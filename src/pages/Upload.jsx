import { useState, useCallback, useRef } from 'react'
import { api } from '../services/api'
import DataTable from '../components/DataTable'
import ChartCard from '../components/ChartCard'
import {
  UploadCloud, FileText, Trash2, BarChart2,
  CheckCircle, AlertCircle, Table, Info, X
} from 'lucide-react'

async function uploadCSV(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}

async function deleteUpload(id) {
  const res = await fetch(`/api/upload/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
}

function StatCard({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-val" style={{ color }}>{value}</div>
      {sub && <div className="metric-delta" style={{ color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

function ColumnStats({ stats, columns }) {
  const [selected, setSelected] = useState(columns[0]?.key || '')
  const col = stats[selected]
  if (!col) return null

  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Column Inspector</div>
        <select
          className="select"
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ fontSize: 13 }}
        >
          {columns.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span className={`pill ${col.type === 'numeric' ? 'pill-blue' : 'pill-green'}`}>
          {col.type}
        </span>
        <span className="pill pill-gray">{col.count} values</span>
        {col.missing > 0 && <span className="pill pill-warn">{col.missing} missing</span>}
      </div>

      {col.type === 'numeric' ? (
        <div className="grid-2" style={{ gap: 10 }}>
          {[
            { label: 'Min',    value: col.min },
            { label: 'Max',    value: col.max },
            { label: 'Mean',   value: col.mean },
            { label: 'Median', value: col.median },
            { label: 'Std Dev',value: col.std },
            { label: 'Missing',value: col.missing },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
            {col.unique} unique values, top 10:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {col.topValues?.map(({ value, count }) => {
              const pct = Math.round((count / col.count) * 100)
              return (
                <div key={value} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, width: 120, flexShrink: 0, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(value)}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-2)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Upload() {
  const [dragging, setDragging]     = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [error, setError]           = useState(null)
  const [result, setResult]         = useState(null)   
  const [uploaded, setUploaded]     = useState([])     
  const [activeTab, setActiveTab]   = useState('preview')
  const fileRef = useRef(null)

  function buildCharts() {
    if (!result) return null
    const numericCols = result.columns.filter(c => c.type === 'float' || c.type === 'integer').slice(0, 4)
    if (numericCols.length < 2) return null

    const means = numericCols.map(c => result.stats[c.key]?.mean ?? 0)
    return {
      bar: {
        labels: numericCols.map(c => c.key),
        datasets: [{ label: 'Mean value', data: means }],
      }
    }
  }

  async function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }
    setError(null)
    setUploading(true)
    setResult(null)
    try {
      const data = await uploadCSV(file)
      setResult(data)
      setUploaded(prev => [{ id: data.id, name: data.name, rows: data.rows, cols: data.cols, uploadedAt: new Date().toLocaleTimeString() }, ...prev])
      setActiveTab('preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [])

  const onDragOver = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const tableCols = result?.columns?.map(c => ({ key: c.key, label: c.key })) || []
  const charts = buildCharts()

  return (
    <div className="page">
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <div className="label-sm" style={{ marginBottom: 8 }}>Custom Data</div>
          <h1 className="section-title">Upload CSV Dataset</h1>
        </div>
        {uploaded.length > 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {uploaded.length} file{uploaded.length > 1 ? 's' : ''} uploaded this session
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr' : '1fr', gap: 24 }}>

        {!result && (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-lg)',
              background: dragging ? 'var(--accent-light)' : 'var(--bg-card)',
              padding: '64px 40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: dragging ? '0 0 0 4px rgba(26,86,219,0.08)' : 'var(--shadow)',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: dragging ? 'var(--accent)' : 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <UploadCloud size={32} strokeWidth={1.5} style={{ color: dragging ? '#fff' : 'var(--muted)' }} />
              </div>
            </div>

            {uploading ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>Parsing CSV…</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Analysing columns and computing statistics</div>
                <div style={{ width: 200, height: 4, background: 'var(--bg-2)', borderRadius: 2, margin: '20px auto 0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, animation: 'progress 1.5s ease-in-out infinite' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                  {dragging ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                  or click to browse - up to 10MB
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['Any CSV format', 'Auto type detection', 'Instant statistics', 'Interactive charts'].map(f => (
                    <span key={f} className="pill pill-gray">{f}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--danger-light)', border: '1px solid rgba(200,30,30,0.2)', borderRadius: 'var(--radius)', color: 'var(--danger)' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: 14, flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {result && (
          <>
            <div style={{ background: 'var(--accent-2-light)', border: '1px solid rgba(14,159,110,0.2)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
              <CheckCircle size={20} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-2)' }}>{result.name}.csv uploaded successfully</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{result.rows.toLocaleString()} rows · {result.cols} columns · auto-detected types</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setResult(null); setError(null) }}
              >
                <UploadCloud size={14} /> Upload another
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none' }}
                onClick={async () => {
                  await deleteUpload(result.id).catch(() => {})
                  setResult(null)
                  setUploaded(prev => prev.filter(u => u.id !== result.id))
                }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>

            <div className="grid-4">
              <StatCard label="Total rows"     value={result.rows.toLocaleString()} sub="records parsed" />
              <StatCard label="Columns"        value={result.cols} sub="fields detected" color="var(--accent-2)" />
              <StatCard label="Numeric cols"   value={result.columns.filter(c => c.type === 'float' || c.type === 'integer').length} sub="auto-detected" color="var(--warn)" />
              <StatCard label="Text cols"      value={result.columns.filter(c => c.type === 'string' || c.type === 'date').length} sub="categorical" color="var(--violet)" />
            </div>

            <div className="tabs">
              <button className={`tab ${activeTab === 'preview' ? 'active' : ''}`}   onClick={() => setActiveTab('preview')}>
                <Table size={14} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }} />Preview
              </button>
              <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`}     onClick={() => setActiveTab('stats')}>
                <Info size={14} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }} />Column Stats
              </button>
              <button className={`tab ${activeTab === 'charts' ? 'active' : ''}`}    onClick={() => setActiveTab('charts')}>
                <BarChart2 size={14} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }} />Charts
              </button>
            </div>

            {activeTab === 'preview' && (
              <DataTable
                rows={result.preview || []}
                columns={tableCols}
                title={`${result.name} — preview`}
                showSearch={false}
                pageSize={10}
              />
            )}

            {activeTab === 'stats' && (
              <div className="grid-2">
                <ColumnStats stats={result.stats} columns={result.columns} />
                <div className="card card-pad">
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Schema overview</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.columns.map(col => {
                      const s = result.stats[col.key]
                      return (
                        <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                          <FileText size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 13, flex: 1 }}>{col.key}</span>
                          <span className={`pill ${col.type === 'float' || col.type === 'integer' ? 'pill-blue' : col.type === 'date' ? 'pill-violet' : 'pill-green'}`} style={{ fontSize: 11 }}>{col.type}</span>
                          {s?.missing > 0 && <span className="pill pill-warn" style={{ fontSize: 11 }}>{s.missing} null</span>}
                          {s?.type === 'categorical' && <span className="pill pill-gray" style={{ fontSize: 11 }}>{s.unique} unique</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'charts' && (
              charts ? (
                <div className="grid-2">
                  <ChartCard
                    title="Mean values — numeric columns"
                    subtitle="Auto-generated from uploaded data"
                    type="bar"
                    labels={charts.bar.labels}
                    datasets={charts.bar.datasets}
                    height={260}
                  />
                  <div className="card card-pad">
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Numeric column ranges</div>
                    {result.columns.filter(c => c.type === 'float' || c.type === 'integer').slice(0, 6).map(col => {
                      const s = result.stats[col.key]
                      if (!s) return null
                      const range = s.max - s.min || 1
                      const meanPct = Math.round(((s.mean - s.min) / range) * 100)
                      return (
                        <div key={col.key} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                            <span style={{ fontFamily: 'DM Mono,monospace', color: 'var(--ink)' }}>{col.key}</span>
                            <span style={{ color: 'var(--muted)' }}>{s.min} → {s.max}</span>
                          </div>
                          <div style={{ position: 'relative', height: 8, background: 'var(--bg-2)', borderRadius: 4 }}>
                            <div style={{ position: 'absolute', left: `${meanPct}%`, top: -3, width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', border: '2px solid #fff', transform: 'translateX(-50%)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>mean: {s.mean} · std: {s.std}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="card card-pad" style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
                  <BarChart2 size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontSize: 15, fontWeight: 500 }}>Need at least 2 numeric columns to generate charts</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Try uploading a dataset with numeric data.</div>
                </div>
              )
            )}
          </>
        )}

        {uploaded.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600 }}>
              Session uploads
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>File name</th><th>Rows</th><th>Columns</th><th>Uploaded</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploaded.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={14} style={{ color: 'var(--muted)' }} />
                        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 13 }}>{u.name}.csv</span>
                      </div>
                    </td>
                    <td>{u.rows.toLocaleString()}</td>
                    <td>{u.cols}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{u.uploadedAt}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 12, padding: '4px 10px', color: 'var(--danger)', borderColor: 'rgba(200,30,30,0.2)' }}
                        onClick={async () => {
                          await deleteUpload(u.id).catch(() => {})
                          setUploaded(prev => prev.filter(x => x.id !== u.id))
                          if (result?.id === u.id) setResult(null)
                        }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes progress {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}