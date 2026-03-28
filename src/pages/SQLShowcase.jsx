import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { Database, BarChart2, Layers, Activity } from 'lucide-react'

const DS_OPTIONS = [
  { id:'titanic', label:'Titanic', icon: Activity },
  { id:'iris',    label:'Iris', icon: BarChart2 },
  { id:'housing', label:'Housing Prices', icon: Layers },
  { id:'sales',   label:'Global Sales', icon: Database },
]

function highlight(sql) {
  return sql
    .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT|RIGHT|INNER|ON|AS|WITH|CASE|WHEN|THEN|ELSE|END|DISTINCT|LIMIT|OFFSET|UNION|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|AND|OR|NOT|IN|IS|NULL|BY|DESC|ASC|PARTITION|OVER|RANK|ROW_NUMBER|NTILE|PERCENTILE_CONT|WITHIN|STDDEV|ROUND|COUNT|SUM|AVG|MIN|MAX)\b/g,
      m => `<span class="kw">${m}</span>`)
    .replace(/'([^']*)'/g, m => `<span class="str">${m}</span>`)
    .replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(\d+(\.\d+)?)\b/g, m => `<span style="color:#f97316">${m}</span>`)
}

export default function SQLShowcase() {
  const [dsId, setDsId] = useState('titanic')
  const { data, loading } = useFetch(() => api.getSQL(dsId), [dsId])
  const resultKeys = data?.result?.[0] ? Object.keys(data.result[0]) : []

  return (
    <div className="page">
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom:28 }}>
        <div>
          <div className="label-sm" style={{ marginBottom:8 }}>SQL Engineering</div>
          <h1 className="section-title">Query Showcase</h1>
        </div>

        {/* Dataset Buttons */}
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          {DS_OPTIONS.map(o => {
            const Icon = o.icon
            return (
              <button
                key={o.id}
                className={`btn btn-sm ${dsId===o.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDsId(o.id)}
                style={{ display:'flex', alignItems:'center', gap:6 }}
              >
                <Icon size={16} />
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid-2">
          <div className="card card-pad skeleton" style={{ height:400 }} />
          <div className="card card-pad skeleton" style={{ height:400 }} />
        </div>
      ) : (
        <>
          {/* Title Strip */}
          <div style={{
            background:'var(--bg-card)',
            border:'1px solid var(--border)',
            borderRadius:'var(--radius)',
            padding:'14px 20px',
            marginBottom:20,
            display:'flex',
            alignItems:'center',
            gap:14
          }}>
            <Database size={24} />
            <div>
              <div style={{ fontSize:14, fontWeight:600 }}>{data.title}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:2, fontFamily:'DM Mono,monospace' }}>
                PostgreSQL 15 · window functions · CTE
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom:20 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--muted)', marginBottom:10 }}>SQL Query</div>
              <div className="code-block" dangerouslySetInnerHTML={{ __html: highlight(data.sql) }} />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--muted)', marginBottom:10 }}>Query Result</div>
                <div className="card" style={{ overflow:'hidden' }}>
                  <div style={{ overflowX:'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>{resultKeys.map(k => <th key={k}>{k}</th>)}</tr>
                      </thead>
                      <tbody>
                        {data.result.map((row, i) => (
                          <tr key={i}>
                            {resultKeys.map(k => (
                              <td key={k} style={{ fontFamily:'DM Mono,monospace', fontSize:12 }}>{String(row[k])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding:'10px 14px', borderTop:'1px solid var(--border)', fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--muted)' }}>
                    {data.result.length} rows · 0.004s · PostgreSQL 15
                  </div>
                </div>
              </div>

              <div style={{ background:'var(--accent-light)', border:'1px solid rgba(26,86,219,0.2)', borderLeft:'3px solid var(--accent)', borderRadius:'var(--radius)', padding:'14px 18px' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--accent)', marginBottom:6 }}>Key Insight</div>
                <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.65 }}>{data.insight}</div>
              </div>
            </div>
          </div>

          <div className="section-header" style={{ marginBottom:16 }}>
            <div>
              <div className="label-sm" style={{ marginBottom:6 }}>Concepts demonstrated</div>
            </div>
          </div>

          <div className="grid-3">
            {[
              { icon:<BarChart2 size={24} />, title:'Window Functions', desc:'RANK(), NTILE(), PERCENTILE_CONT() - compute rankings and percentiles without collapsing rows.', tag:'Advanced SQL' },
              { icon:<Layers size={24} />, title:'Common Table Expressions', desc:'WITH clauses structure complex logic into readable, reusable named subqueries.', tag:'Readability' },
              { icon:<Database size={24} />, title:'Aggregation Pipelines', desc:'COUNT, SUM, AVG, STDDEV grouped by multiple dimensions for statistical profiling.', tag:'Analytics' },
            ].map(({ icon, title, desc, tag }) => (
              <div key={title} className="card card-pad">
                <div style={{ fontSize:24, marginBottom:12 }}>{icon}</div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>{title}</div>
                <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:12 }}>{desc}</div>
                <span className="pill pill-violet">{tag}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}