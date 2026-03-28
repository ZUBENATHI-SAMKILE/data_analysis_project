import { useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import {
  TrendingUp, Brain, Database, BarChart2,
  Layers, GitBranch, ArrowRight, Sparkles,
  Code, Atom
} from 'lucide-react'

const SKILLS = [
  { icon: Code,      label:'Python / Pandas',      bg:'#fef3c7' },
  { icon: Atom,      label:'React / JavaScript',   bg:'#dbeafe' },
  { icon: BarChart2, label:'Data Visualisation',   bg:'#dcfce7' },
  { icon: Brain,     label:'Machine Learning',     bg:'#ede9fe' },
  { icon: Database,  label:'SQL',                  bg:'#fce7f3' },
  { icon: Layers,    label:'Kaggle API',           bg:'#e0f2fe' },
]

const FEATURE_CARDS = [
  { Icon: TrendingUp, bg:'#dbeafe', title:'Exploratory Analysis',  desc:'Statistical profiling, distribution analysis, correlation heatmaps and outlier detection on real Kaggle datasets.', tag:'Pandas · Seaborn',      tagClass:'pill-blue'   },
  { Icon: Brain,      bg:'#dcfce7', title:'Predictive Modelling',  desc:'Random Forest, Logistic Regression and XGBoost pipelines with cross-validation and SHAP feature importances.',  tag:'Scikit-learn · XGBoost', tagClass:'pill-green'  },
  { Icon: Database,   bg:'#fef3c7', title:'SQL Engineering',        desc:'Window functions, CTEs, complex joins and aggregation pipelines for large-scale data warehousing workflows.',    tag:'PostgreSQL · BigQuery',  tagClass:'pill-warn'   },
]

export default function Overview() {
  const navigate = useNavigate()
  const { data } = useFetch(() => api.listDatasets(), [])

  return (
    <div className="page">
      
      <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:60, alignItems:'center', marginBottom:64 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div style={{ width:28, height:1, background:'#1a56db' }} />
            <span style={{ fontFamily:'Arial, sans-serif', fontSize:13, color:'#1a56db', letterSpacing:'0.12em', textTransform:'uppercase' }}>
              Data Analysis &amp; Engineering Portfolio
            </span>
          </div>
          <h1 className="display" style={{ fontSize:56, lineHeight:1.08, marginBottom:20 }}>
            Turning raw data<br />into{' '}
            <em style={{ color:'#1a56db' }}>clear decisions</em>
          </h1>
          <p style={{ fontSize:17, color:'var(--muted)', lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
            A full-stack analytics platform built to explore, model, and visualise complex datasets - powered by Python, SQL, machine learning and real-time Kaggle integration.
          </p>
          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>
              <BarChart2 size={17} /> Explore Datasets
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/ai')}>
              <Sparkles size={17} /> Ask the AI
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <div className="live-badge" style={{ marginBottom:14 }}>
            <div className="live-dot" />Live Metrics
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:14 }}>
            Platform snapshot
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { val: data?.total ?? '…', label:'Datasets loaded' },
              { val:'94.2%', label:'Best model accuracy' },
              { val:'1.4M+', label:'Rows available' },
              { val:'5',     label:'Tech stacks' },
            ].map(({ val, label }) => (
              <div key={label} style={{ background:'var(--bg-2)', borderRadius:'var(--radius)', padding:'16px' }}>
                <div className="display" style={{ fontSize:30 }}>{val}</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:40 }}>
        {SKILLS.map(({ icon, label, bg }) => {
          const Icon = icon;
          return (
            <div key={label} style={{
              display:'flex',
              alignItems:'center',
              gap:8,
              padding:'9px 18px',
              background:'var(--bg-card)',
              border:'1px solid var(--border)',
              borderRadius:40,
              fontSize:16,
              fontWeight:500
            }}>
              <div style={{
                width:22,
                height:22,
                borderRadius:5,
                background:bg,
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
              }}>
                <Icon size={14} />
              </div>
              {label}
            </div>
          );
        })}
      </div>

      <div className="grid-3" style={{ marginBottom:56 }}>
        {FEATURE_CARDS.map(({ Icon, bg, title, desc, tag, tagClass }) => (
          <div key={title} className="card card-pad card-hover">
            <div style={{ width:44, height:44, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
              <Icon size={22} strokeWidth={1.8} style={{ color: bg === '#dbeafe' ? '#1a56db' : bg === '#dcfce7' ? '#0e9f6e' : '#c27803' }} />
            </div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:7 }}>{title}</div>
            <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65, marginBottom:14 }}>{desc}</div>
            <span className={`pill ${tagClass}`}>{tag}</span>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div>
          <div className="label-sm" style={{ marginBottom:8 }}>Pre-loaded datasets</div>
          <h2 className="section-title">Kaggle catalogue</h2>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>
          View all <ArrowRight size={15} />
        </button>
      </div>

      <div className="grid-2">
        {(data?.datasets || Array(4).fill(null)).map((ds, i) => (
          <div
            key={ds?.id ?? i}
            className="card card-pad card-hover"
            style={{ cursor:'pointer' }}
            onClick={() => ds && navigate(`/explore?ds=${ds.id}`)}
          >
            {ds ? (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ fontSize:16, fontWeight:600 }}>
                    {ds.name.split('—')[0].trim()}
                  </div>
                  <span className="pill pill-blue">{ds.source}</span>
                </div>
                <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65, marginBottom:12 }}>
                  {ds.description}
                </div>
                <div style={{ display:'flex', gap:14, marginBottom:10 }}>
                  <span className="label-sm">{ds.rows.toLocaleString()} rows</span>
                  <span className="label-sm">{ds.cols} cols</span>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {ds.tags.map(t => (
                    <span key={t} className="pill pill-gray">{t}</span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height:100 }} className="skeleton" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}