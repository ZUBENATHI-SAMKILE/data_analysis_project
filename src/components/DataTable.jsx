import { useState, useMemo } from 'react'

const PILL_MAP = {
  Survived: v => v === 1 ? <span className="pill pill-green">Yes</span> : <span className="pill pill-gray">No</span>,
  Pclass:   v => v === 1 ? <span className="pill pill-blue">1st</span> : v === 2 ? <span className="pill pill-warn">2nd</span> : <span className="pill pill-gray">3rd</span>,
  Species: v => {
    const map = { 'Iris-setosa':'pill-blue','Iris-versicolor':'pill-green','Iris-virginica':'pill-violet' }
    return <span className={`pill ${map[v] || 'pill-gray'}`}>{String(v).replace('Iris-','')}</span>
  },
}

function fmt(val) {
  if (val === null || val === undefined) return <span style={{ color:'var(--muted)' }}>—</span>
  if (typeof val === 'number' && !isFinite(val)) return <span style={{ color:'var(--muted)' }}>—</span>
  if (typeof val === 'number' && !Number.isInteger(val)) return val.toFixed(2)
  if (typeof val === 'number') return val.toLocaleString()
  return String(val)
}

export default function DataTable({ rows = [], columns = [], title = 'Data', showSearch = true, pageSize = 20 }) {
  const [search, setSearch]     = useState('')
  const [sortCol, setSortCol]   = useState(null)
  const [sortDir, setSortDir]   = useState(1)
  const [page, setPage]         = useState(1)

  const filtered = useMemo(() => {
    let data = [...rows]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r => columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)))
    }
    if (sortCol) {
      data.sort((a, b) => {
        const va = a[sortCol], vb = b[sortCol]
        if (va === null || va === undefined) return 1
        if (vb === null || vb === undefined) return -1
        return sortDir * (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb)))
      })
    }
    return data
  }, [rows, search, sortCol, sortDir, columns])

  const pages  = Math.ceil(filtered.length / pageSize)
  const paged  = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key) {
    if (sortCol === key) setSortDir(d => d * -1)
    else { setSortCol(key); setSortDir(1) }
    setPage(1)
  }

  return (
    <div className="card" style={{ overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <span style={{ fontSize:14, fontWeight:600, marginRight:'auto' }}>
          {title} <span style={{ color:'var(--muted)', fontWeight:400, fontSize:12 }}>({filtered.length} rows)</span>
        </span>
        {showSearch && (
          <input
            className="input mono"
            style={{ width:200, fontSize:16 }}
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        )}
      </div>
      <div style={{ overflowX:'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label || c.key}
                  {sortCol === c.key ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i}>
                {columns.map(c => (
                  <td key={c.key}>
                    {PILL_MAP[c.key] ? PILL_MAP[c.key](row[c.key]) : fmt(row[c.key])}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={columns.length} style={{ textAlign:'center', padding:32, color:'var(--muted)' }}>No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ padding:'10px 20px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
          <span style={{ fontSize:16, color:'var(--muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={() => setPage(p=>p-1)}>←</button>
          <button className="btn btn-ghost btn-sm" disabled={page>=pages} onClick={() => setPage(p=>p+1)}>→</button>
        </div>
      )}
    </div>
  )
}