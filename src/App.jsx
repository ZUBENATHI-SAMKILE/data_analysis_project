import { Routes, Route } from 'react-router-dom'
import Navbar     from './components/Navbar'
import Overview   from './pages/Overview'
import Explorer   from './pages/Explorer'
import MLModels   from './pages/MLModels'
import SQLShowcase from './pages/SQLShowcase'
import AIAnalyst  from './pages/AIAnalyst'
import Upload from './pages/Upload'

function Footer() {
  return (
    <footer style={{
      borderTop:'1px solid var(--border)', padding:'28px 40px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      color:'var(--muted)', fontSize:13, marginTop:40,
    }}>
      
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['Python','Pandas','Scikit-learn','SQL','React','Node.js','Chart.js','Kaggle API'].map(t => (
          <span key={t} style={{ fontFamily:'DM Mono,monospace', fontSize:19, padding:'3px 8px', borderRadius:4, background:'var(--danger-light)', color:'var(--ink)' }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize:19}}>Full-stack · React + Node.js</div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Overview />} />
        <Route path="/explore" element={<Explorer />} />
        <Route path="/ml"      element={<MLModels />} />
        <Route path="/sql"     element={<SQLShowcase />} />
        <Route path="/ai"      element={<AIAnalyst />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
      <Footer />
    </>
  )
}