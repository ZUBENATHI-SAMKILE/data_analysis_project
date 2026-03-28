import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'
import {
  Ship, Flower, Home, Package, MessageCircle
} from 'lucide-react'

const DS_OPTIONS = [
  { id:'titanic', label:'Titanic',        icon: Ship },
  { id:'iris',    label:'Iris',           icon: Flower },
  { id:'housing', label:'Housing Prices', icon: Home },
  { id:'sales',   label:'Global Sales',   icon: Package },
]

const PROMPTS = {
  titanic: [
    'What are the main predictors of survival on the Titanic?',
    'Compare survival rates by sex and passenger class combined.',
    'What does the age distribution reveal about who survived?',
    'How did fare paid correlate with survival outcomes?',
  ],
  iris: [
    'Which features best separate the three iris species?',
    'Why does petal length perform better than sepal length for classification?',
    'Describe the statistical differences between Iris-setosa and Iris-virginica.',
    'How would you choose between KNN, SVM and Random Forest for this dataset?',
  ],
  housing: [
    'Which features have the strongest impact on sale price?',
    'How does overall quality score affect property value?',
    'What neighbourhoods offer the best value for money?',
    'Why does Gradient Boosting outperform linear regression here?',
  ],
  sales: [
    'Which product category and region combination is most profitable?',
    'How do discounts affect profitability?',
    'Which customer segment drives the most revenue?',
    'What SQL window function would you use to rank regions by profit?',
  ],
}

function Message({ role, content, streaming }) {
  return (
    <div style={{
      display:'flex', gap:14, padding:'18px 0',
      borderBottom:'1px solid var(--border)',
    }}>
      <div style={{
        width:34, height:34, borderRadius:'50%', flexShrink:0,
        background: role==='user' ? 'var(--ink)' : 'var(--accent-light)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color: role==='user' ? '#fff' : 'var(--accent)',
      }}>
        {role === 'user' ? 'U' : <MessageCircle size={16} />}
      </div>

      <div style={{ flex:1, paddingTop:6 }}>
        <div style={{
          fontSize:12, fontWeight:600, color:'var(--muted)',
          marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em'
        }}>
          {role==='user' ? 'You' : 'DataSphere AI'}
        </div>

        <div style={{
          fontSize: role==='assistant' ? 13 : 14,
          lineHeight:1.75,
          color:'var(--ink)',
          whiteSpace:'pre-wrap',
        }}>
          {content}
          {streaming && (
            <span style={{
              display:'inline-block',
              width:2,
              height:14,
              background:'var(--accent)',
              marginLeft:2,
              verticalAlign:'middle',
              animation:'blink 1s infinite'
            }} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function AIAnalyst() {
  const [dsId, setDsId] = useState('titanic')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  async function send(q = question) {
    const text = q.trim()
    if (!text || streaming) return

    setMessages(m => [...m, { role:'user', content:text }])
    setQuestion('')
    setStreaming(true)

    let assistantContent = ''
    setMessages(m => [...m, { role:'assistant', content:'', streaming:true }])

    await api.streamAnalysis(
      text,
      dsId,
      chunk => {
        assistantContent += chunk
        setMessages(m => {
          const updated = [...m]
          updated[updated.length - 1] = {
            role:'assistant',
            content:assistantContent,
            streaming:true
          }
          return updated
        })
      },
      () => {
        setStreaming(false)
        setMessages(m => {
          const updated = [...m]
          updated[updated.length - 1] = {
            role:'assistant',
            content:assistantContent,
            streaming:false
          }
          return updated
        })
      },
      err => {
        setStreaming(false)
        setMessages(m => {
          const updated = [...m]
          updated[updated.length - 1] = {
            role:'assistant',
            content:`⚠ Error: ${err}`,
            streaming:false
          }
          return updated
        })
      }
    )
  }

  function clearChat() {
    setMessages([])
    setQuestion('')
  }

  return (
    <div className="page">
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div className="section-header" style={{ marginBottom:24 }}>
        <div>
          <div className="label-sm" style={{ marginBottom:8 }}>AI Analyst</div>
          <h1 className="section-title">Ask the Data</h1>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>
            Clear chat
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24 }}>
        
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card card-pad">
            <div className="label-sm" style={{ marginBottom:12 }}>Dataset context</div>

            {DS_OPTIONS.map(o => {
              const Icon = o.icon
              return (
                <button
                  key={o.id}
                  onClick={() => { setDsId(o.id); clearChat() }}
                  style={{
                    width:'100%',
                    textAlign:'left',
                    padding:'9px 12px',
                    borderRadius:'var(--radius)',
                    border: dsId===o.id ? '1px solid rgba(26,86,219,0.25)' : '1px solid transparent',
                    background: dsId===o.id ? 'var(--accent-light)' : 'transparent',
                    display:'flex',
                    alignItems:'center',
                    gap:10,
                    fontSize:13,
                    fontWeight:500,
                    cursor:'pointer'
                  }}
                >
                  <Icon size={16} />
                  {o.label}
                </button>
              )
            })}
          </div>

          <div className="card card-pad">
            <div className="label-sm" style={{ marginBottom:12 }}>Suggested questions</div>
            {(PROMPTS[dsId] || []).map((p, i) => (
              <button key={i} onClick={() => send(p)} disabled={streaming} style={{
                  textAlign:'left', padding:'8px 10px', borderRadius:'var(--radius)',
                  border:'1px solid var(--border)', background:'var(--bg)',
                  cursor: streaming ? 'default' : 'pointer', fontFamily:'inherit',
                  fontSize:16, color:'var(--ink)', lineHeight:1.5,
                  transition:'all 0.15s', opacity: streaming ? 0.5 : 1,
                }}>
                  {p}
                </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ display:'flex', flexDirection:'column', minHeight:560 }}>
          <div style={{ flex:1, padding:'8px 24px', overflowY:'auto' }}>
            
            {messages.length === 0 ? (
              <div style={{ textAlign:'center', marginTop:220 }}>
                <MessageCircle size={40} />
                <p>Ask anything about the dataset</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <Message key={i} {...m} />
              ))
            )}

            <div ref={bottomRef} />
          </div>

          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
            <input
              className="input"
              style={{ flex:1 }}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key==='Enter' && send()}
            />
            <button className="btn btn-accent" onClick={() => send()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}