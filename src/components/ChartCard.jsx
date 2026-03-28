import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,LineElement, ArcElement, Tooltip, Legend, Filler,} from 'chart.js'
import { Bar, Scatter, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const PALETTE = ['#1a56db','#0e9f6e','#c27803','#7c3aed','#c81e1e','#0891b2','#d97706']
const PALE    = ['rgba(26,86,219,0.18)','rgba(14,159,110,0.18)','rgba(194,120,3,0.18)','rgba(124,58,237,0.18)']

function applyColors(datasets, type) {
  return datasets.map((ds, i) => {
    const base = PALETTE[i % PALETTE.length]
    if (type === 'doughnut') return { ...ds, backgroundColor: PALETTE.slice(0, datasets[0]?.data?.length || 4) }
    if (type === 'scatter')  return { ...ds, backgroundColor: PALETTE[i % PALETTE.length].replace(')',', 0.6)').replace('rgb','rgba'), pointRadius: 5 }
    if (type === 'line')     return { ...ds, borderColor: base, backgroundColor: PALE[i % PALE.length], fill: true, tension: 0.4, pointRadius: 3 }
    return { ...ds, backgroundColor: base, borderRadius: 4, hoverBackgroundColor: PALETTE[(i+1) % PALETTE.length] }
  })
}

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' } },
  },
}

export default function ChartCard({ title, subtitle, type = 'bar', labels, datasets = [], height = 220, legend }) {
  const colored = applyColors(datasets, type)
  const data = { labels, datasets: colored }

  const opts = type === 'doughnut'
    ? { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    : type === 'scatter'
    ? { ...BASE_OPTS, scales: { x: { ...BASE_OPTS.scales.x, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { ...BASE_OPTS.scales.y } } }
    : BASE_OPTS

  const Chart = { bar: Bar, scatter: Scatter, line: Line, doughnut: Doughnut }[type] || Bar

  return (
    <div className="card card-pad" style={{ display:'flex', flexDirection:'column', gap:0 }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>{title}</div>
        {subtitle && <div style={{ fontSize:16, color:'var(--muted)', marginTop:2 }}>{subtitle}</div>}
      </div>
      {legend && (
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', margin:'8px 0' }}>
          {legend.map((l, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:15, color:'var(--muted)' }}>
              <div style={{ width:10, height:10, borderRadius:2, background: PALETTE[i % PALETTE.length] }} />
              {l}
            </div>
          ))}
        </div>
      )}
      <div style={{ position:'relative', width:'100%', height }}>
        <Chart data={data} options={opts} />
      </div>
    </div>
  )
}