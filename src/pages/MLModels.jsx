import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import ChartCard from '../components/ChartCard'

const DS_OPTIONS = [
  { id:'titanic', label:'Titanic - Classification' },
  { id:'iris',    label:'Iris - Multiclass'        },
  { id:'housing', label:'Housing - Regression'     },
  { id:'sales',   label:'Sales - Regression'       },
]

function safeVal(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return val
}
function safePct(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return `${Math.round(val * 100)}%`
}
function safeLocale(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return Number(val).toLocaleString()
}
function safeFixed(val, d = 3) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return Number(val).toFixed(d)
}

function MetricBar({ label, value, color = '#1a56db', isPercent = true }) {
  if (value === null || value === undefined) return null

  const pct = isPercent
    ? Math.round(value * 100)
    : Math.min(100, Math.round((value / 50000) * 100))

  const displayVal = isPercent
    ? `${Math.round(value * 100)}%`
    : Number(value).toLocaleString()

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <span style={{ fontSize:13, color:'var(--muted)', width:100, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:6, background:'var(--bg-2)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3, transition:'width 0.8s ease' }} />
      </div>
      <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:500, minWidth:60, textAlign:'right' }}>
        {displayVal}
      </span>
    </div>
  )
}

function ConfusionMatrix({ tp, fp, fn, tn }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
      {[
        { label:'True Positive',  val:tp, bg:'var(--accent-2-light)', color:'var(--accent-2)' },
        { label:'False Positive', val:fp, bg:'var(--warn-light)',      color:'var(--warn)'     },
        { label:'False Negative', val:fn, bg:'var(--warn-light)',      color:'var(--warn)'     },
        { label:'True Negative',  val:tn, bg:'var(--accent-light)',    color:'var(--accent)'   },
      ].map(({ label, val, bg, color }) => (
        <div key={label} style={{ background:bg, borderRadius:'var(--radius)', padding:'16px 12px', textAlign:'center' }}>
          <div style={{ fontFamily:'DM Serif Display,serif', fontSize:30, color }}>{val ?? '—'}</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

const ROC_PTS = [[0,0],[0.05,0.42],[0.1,0.62],[0.2,0.78],[0.35,0.88],[0.5,0.93],[0.7,0.96],[1,1]]

export default function MLModels() {
  const [dsId, setDsId]         = useState('titanic')
  const [modelIdx, setModelIdx] = useState(0)
  const { data, loading }       = useFetch(() => api.getML(dsId), [dsId])

  const model        = data?.models?.[modelIdx]
  const isRegression = dsId === 'housing' || dsId === 'sales'

  return (
    <div className="page">
      <div className="section-header" style={{ marginBottom:28 }}>
        <div>
          <div className="label-sm" style={{ marginBottom:8 }}>Machine Learning</div>
          <h1 className="section-title">Model Performance</h1>
        </div>
        <select
          className="select"
          value={dsId}
          onChange={e => { setDsId(e.target.value); setModelIdx(0) }}
        >
          {DS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>

      {loading || !data || !model ? (
        <div className="grid-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="card card-pad skeleton" style={{ height:260 }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ background:'var(--accent-light)', border:'1px solid rgba(26,86,219,0.2)', borderRadius:'var(--radius)', padding:'12px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:18 }}>🎯</span>
            <div>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--accent)' }}>Task: </span>
              <span style={{ fontSize:14, color:'var(--ink)' }}>{data.task}</span>
            </div>
          </div>

          <div className="tabs" style={{ marginBottom:24 }}>
            {data.models.map((m, i) => (
              <button
                key={i}
                className={`tab ${modelIdx === i ? 'active' : ''}`}
                onClick={() => setModelIdx(i)}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom:20 }}>

            <div className="card card-pad">
              <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{model.name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:20, fontFamily:'DM Mono,monospace' }}>
                {model.params}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {isRegression ? (
                  <>
                    <MetricBar label="R² Score" value={model.r2}   color="#1a56db" isPercent={false} />
                    <MetricBar label="RMSE"     value={model.rmse} color="#0e9f6e" isPercent={false} />
                    <MetricBar label="MAE"      value={model.mae}  color="#c27803" isPercent={false} />
                  </>
                ) : (
                  <>
                    <MetricBar label="Accuracy"  value={model.accuracy}  color="#1a56db" />
                    <MetricBar label="Precision" value={model.precision} color="#0e9f6e" />
                    <MetricBar label="Recall"    value={model.recall}    color="#c27803" />
                    <MetricBar label="F1 Score"  value={model.f1}        color="#7c3aed" />
                    {model.auc !== undefined && (
                      <MetricBar label="AUC-ROC" value={model.auc} color="#c81e1e" />
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="card card-pad">
              {!isRegression && model.tp !== undefined ? (
                <>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Confusion Matrix</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginBottom:14 }}>Test set predictions (179 samples)</div>
                  <ConfusionMatrix tp={model.tp} fp={model.fp} fn={model.fn} tn={model.tn} />
                </>
              ) : (
                <>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Regression Summary</div>
                  <div className="grid-2" style={{ gap:12 }}>
                    {[
                      { label:'R² Score', val: safeFixed(model.r2),            color:'var(--accent)'   },
                      { label:'RMSE',     val: safeLocale(model.rmse),          color:'var(--accent-2)' },
                      { label:'MAE',      val: safeLocale(model.mae),           color:'var(--warn)'     },
                      { label:'Model',    val: model.name?.split(' ')[0] ?? '—',color:'var(--violet)'   },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ background:'var(--bg-2)', borderRadius:'var(--radius)', padding:'14px 16px' }}>
                        <div style={{ fontSize:11, color:'var(--muted)' }}>{label}</div>
                        <div style={{ fontFamily:'DM Serif Display,serif', fontSize:22, color, marginTop:4 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="card card-pad">
              <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Feature Importances</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>SHAP mean absolute contribution</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(data.features || []).map((f, i) => {
                  const colors = ['#1a56db','#0e9f6e','#c27803','#7c3aed','#c81e1e','#0891b2']
                  const pct = Math.round((f.importance ?? 0) * 100)
                  return (
                    <div key={f.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:12, width:110, color:'var(--muted)', flexShrink:0 }}>{f.name}</span>
                      <div style={{ flex:1, height:8, background:'var(--bg-2)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:colors[i % colors.length], borderRadius:4 }} />
                      </div>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, minWidth:36, textAlign:'right' }}>
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {!isRegression ? (
              <ChartCard
                title="ROC Curve"
                subtitle={`AUC = ${model.auc !== undefined ? Math.round(model.auc * 100) + '%' : '—'}`}
                type="line"
                labels={ROC_PTS.map(p => p[0].toFixed(2))}
                datasets={[
                  { label:`${model.name}`, data: ROC_PTS.map(p => p[1]) },
                  { label:'Random baseline', data: ROC_PTS.map(p => p[0]) },
                ]}
                legend={[model.name, 'Random baseline']}
                height={240}
              />
            ) : (
              <div className="card card-pad">
                <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>R² Score comparison</div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {data.models.map((m, i) => {
                    const colors = ['#1a56db','#0e9f6e','#c27803']
                    const pct = Math.round((m.r2 ?? 0) * 100)
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <span style={{ fontSize:12, color:'var(--muted)', width:130, flexShrink:0 }}>{m.name}</span>
                        <div style={{ flex:1, height:8, background:'var(--bg-2)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:colors[i % colors.length], borderRadius:4 }} />
                        </div>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, minWidth:40, textAlign:'right' }}>
                          {safeFixed(m.r2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:14, fontWeight:600 }}>Model comparison</span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Parameters</th>
                    {isRegression ? (
                      <><th>R²</th><th>RMSE</th><th>MAE</th></>
                    ) : (
                      <><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th><th>AUC</th></>
                    )}
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {data.models.map((m, i) => {
                    const score = isRegression ? (m.r2 ?? 0) : (m.accuracy ?? 0)
                    const best  = Math.max(...data.models.map(x => isRegression ? (x.r2 ?? 0) : (x.accuracy ?? 0)))
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: modelIdx === i ? 600 : 400 }}>
                          {m.name}
                          {modelIdx === i && <span className="pill pill-blue" style={{ marginLeft:8 }}>selected</span>}
                        </td>
                        <td style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--muted)' }}>{m.params}</td>
                        {isRegression ? (
                          <>
                            <td><strong>{safeFixed(m.r2)}</strong></td>
                            <td>{safeLocale(m.rmse)}</td>
                            <td>{safeLocale(m.mae)}</td>
                          </>
                        ) : (
                          <>
                            <td><strong>{safePct(m.accuracy)}</strong></td>
                            <td>{safePct(m.precision)}</td>
                            <td>{safePct(m.recall)}</td>
                            <td>{safePct(m.f1)}</td>
                            <td>{m.auc !== undefined ? safePct(m.auc) : '—'}</td>
                          </>
                        )}
                        <td>
                          {score === best
                            ? <span className="pill pill-green">🥇 Best</span>
                            : <span className="pill pill-gray">#{i + 1}</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}