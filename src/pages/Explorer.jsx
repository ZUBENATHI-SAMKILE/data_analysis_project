import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'

const DS_COLORS = { titanic:'#1a56db', iris:'#0e9f6e', housing:'#c27803', sales:'#7c3aed' }

const TABLE_COLS = {
  titanic: [
    { key:'Name',     label:'Name'      },
    { key:'Pclass',   label:'Class'     },
    { key:'Sex',      label:'Sex'       },
    { key:'Age',      label:'Age'       },
    { key:'Fare',     label:'Fare ($)'  },
    { key:'Embarked', label:'Port'      },
    { key:'Survived', label:'Survived'  },
  ],
  iris: [
    { key:'Id',            label:'ID'      },
    { key:'SepalLengthCm', label:'Sepal L' },
    { key:'SepalWidthCm',  label:'Sepal W' },
    { key:'PetalLengthCm', label:'Petal L' },
    { key:'PetalWidthCm',  label:'Petal W' },
    { key:'Species',       label:'Species' },
  ],
  housing: [
    { key:'Id',           label:'ID'          },
    { key:'Neighborhood', label:'Neighborhood' },
    { key:'OverallQual',  label:'Quality'      },
    { key:'YearBuilt',    label:'Built'        },
    { key:'GrLivArea',    label:'Area (sqft)'  },
    { key:'GarageCars',   label:'Garage'       },
    { key:'SalePrice',    label:'Price ($)'    },
  ],
  sales: [
    { key:'OrderId',   label:'Order ID'   },
    { key:'OrderDate', label:'Date'       },
    { key:'Segment',   label:'Segment'    },
    { key:'Region',    label:'Region'     },
    { key:'Category',  label:'Category'   },
    { key:'Sales',     label:'Sales ($)'  },
    { key:'Profit',    label:'Profit ($)' },
  ],
}

const GROUP_OPTIONS = {
  titanic: [
    { value:'Pclass',   label:'Passenger Class' },
    { value:'Sex',      label:'Sex'             },
    { value:'Embarked', label:'Port'            },
  ],
  iris: [], housing: [], sales: [],
}

function safeNum(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return val
}
function safeLocale(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return Number(val).toLocaleString()
}
function safeMoney(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return `$${Number(val).toLocaleString()}`
}
function safePct(val) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return `${val}%`
}
function safeFixed(val, d = 1) {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—'
  return Number(val).toFixed(d)
}

function fmt(val) {
  if (val === null || val === undefined) return <span style={{ color:'var(--muted)' }}>—</span>
  if (typeof val === 'number' && !isFinite(val)) return <span style={{ color:'var(--muted)' }}>—</span>
  if (typeof val === 'number' && !Number.isInteger(val)) return val.toFixed(2)
  if (typeof val === 'number') return val.toLocaleString()
  return String(val)
}

const SUMMARY_FIELDS = {
  titanic: [
    { key:'totalRows',    label:'Total rows',     fmt: v => safeLocale(v) },
    { key:'survivalRate', label:'Survival rate',  fmt: v => safePct(v),          delta:'↑ 342 survived', up:true },
    { key:'avgAge',       label:'Mean age',       fmt: v => safeFixed(v),        delta:'years' },
    { key:'avgFare',      label:'Mean fare',      fmt: v => safeMoney(v),        delta:'per ticket' },
  ],
  iris: [
    { key:'totalRows',      label:'Total rows',      fmt: v => safeLocale(v) },
    { key:'species',        label:'Species',          fmt: v => safeNum(v) },
    { key:'avgSepalLength', label:'Avg sepal length', fmt: v => `${safeFixed(v)} cm` },
    { key:'modelAccuracy',  label:'Best accuracy',    fmt: v => safePct(v), delta:'RF classifier', up:true },
  ],
  housing: [
    { key:'totalRows',   label:'Total rows',     fmt: v => safeLocale(v) },
    { key:'avgPrice',    label:'Avg sale price', fmt: v => safeMoney(v) },
    { key:'medianPrice', label:'Median price',   fmt: v => safeMoney(v) },
    { key:'avgQuality',  label:'Avg quality',    fmt: v => `${safeFixed(v)}/10` },
  ],
  sales: [
    { key:'totalRows',    label:'Transactions',  fmt: v => safeLocale(v) },
    { key:'totalSales',   label:'Total sales',   fmt: v => safeMoney(v) },
    { key:'totalProfit',  label:'Total profit',  fmt: v => safeMoney(v) },
    { key:'profitMargin', label:'Profit margin', fmt: v => safePct(v), up:true },
  ],
}

export default function Explorer() {
  const [params, setParams]   = useSearchParams()
  const [dsId, setDsId]       = useState(params.get('ds') || 'titanic')
  const [groupBy, setGroupBy] = useState('Pclass')

  const { data: dsList }                           = useFetch(() => api.listDatasets(), [])
  const { data: summary,   loading: sumLoading }   = useFetch(() => api.getSummary(dsId), [dsId])
  const { data: chartData, loading: chartLoading } = useFetch(() => api.getCharts(dsId, { groupBy }), [dsId, groupBy])
  const { data: rowData,   loading: rowLoading }   = useFetch(() => api.getDataset(dsId, { limit: 50 }), [dsId])

  useEffect(() => { setParams({ ds: dsId }) }, [dsId])
  useEffect(() => { setGroupBy('Pclass') }, [dsId])

  const summaryFields = SUMMARY_FIELDS[dsId] || []
  const tableCols     = TABLE_COLS[dsId]     || []

  function renderCharts() {
    if (chartLoading || !chartData?.charts) return (
      <div className="grid-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="card card-pad skeleton" style={{ height:260 }} />
        ))}
      </div>
    )
    const c = chartData.charts

    if (dsId === 'titanic') return (
      <>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <ChartCard
            title={`Survival by ${groupBy}`}
            subtitle="Grouped bar chart"
            type="bar"
            labels={c.survival_by_group?.labels || []}
            datasets={c.survival_by_group?.datasets || []}
            legend={['Survived', 'Did not survive']}
            height={220}
          />
          <ChartCard
            title="Age distribution"
            subtitle="10-year histogram bins"
            type="bar"
            labels={c.age_histogram?.labels || []}
            datasets={c.age_histogram?.datasets || []}
            height={220}
          />
        </div>
        <ChartCard
          title="Fare vs age — survival scatter"
          subtitle="Colour encodes survival outcome"
          type="scatter"
          datasets={c.scatter?.datasets || []}
          legend={['Survived', 'Did not survive']}
          height={240}
        />
      </>
    )

    if (dsId === 'iris') return (
      <>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <ChartCard
            title="Sepal scatter"
            subtitle="Length vs Width by species"
            type="scatter"
            datasets={c.sepal_scatter?.datasets || []}
            legend={['Setosa', 'Versicolor', 'Virginica']}
            height={220}
          />
          <ChartCard
            title="Petal scatter"
            subtitle="Length vs Width by species"
            type="scatter"
            datasets={c.petal_scatter?.datasets || []}
            legend={['Setosa', 'Versicolor', 'Virginica']}
            height={220}
          />
        </div>
        <ChartCard
          title="Species distribution"
          subtitle="Equal 50-sample split"
          type="doughnut"
          labels={c.species_distribution?.labels || []}
          datasets={c.species_distribution?.datasets || []}
          height={220}
        />
      </>
    )

    if (dsId === 'housing') return (
      <>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <ChartCard
            title="Price distribution"
            subtitle="Sale price histogram"
            type="bar"
            labels={c.price_histogram?.labels || []}
            datasets={c.price_histogram?.datasets || []}
            height={220}
          />
          <ChartCard
            title="Quality vs avg price"
            subtitle="Overall quality score 1–10"
            type="bar"
            labels={c.quality_vs_price?.labels || []}
            datasets={c.quality_vs_price?.datasets || []}
            height={220}
          />
        </div>
        <ChartCard
          title="Price vs living area"
          subtitle="Above-grade sq ft vs sale price"
          type="scatter"
          datasets={c.price_vs_area?.datasets || []}
          height={240}
        />
      </>
    )

    if (dsId === 'sales') return (
      <>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <ChartCard
            title="Sales & profit by category"
            subtitle="Grouped comparison"
            type="bar"
            labels={c.sales_by_category?.labels || []}
            datasets={c.sales_by_category?.datasets || []}
            legend={['Sales ($)', 'Profit ($)']}
            height={220}
          />
          <ChartCard
            title="Sales by region"
            subtitle="Revenue share doughnut"
            type="doughnut"
            labels={c.region_performance?.labels || []}
            datasets={c.region_performance?.datasets || []}
            height={220}
          />
        </div>
        <ChartCard
          title="Profit by segment"
          subtitle="Consumer / Corporate / Home Office"
          type="bar"
          labels={c.segment_profit?.labels || []}
          datasets={c.segment_profit?.datasets || []}
          height={220}
        />
      </>
    )

    return null
  }

  return (
    <div className="page">

      <div className="section-header" style={{ marginBottom:24 }}>
        <div>
          <div className="label-sm" style={{ marginBottom:8 }}>Exploratory Data Analysis</div>
          <h1 className="section-title">Dataset Explorer</h1>
        </div>
        {dsId === 'titanic' && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:14, color:'var(--muted)' }}>Group by</span>
            <select className="select" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              {GROUP_OPTIONS.titanic.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24, alignItems:'start' }}>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card card-pad">
            <div className="label-sm" style={{ marginBottom:12 }}>Datasets</div>
            {(dsList?.datasets || []).map(ds => (
              <button
                key={ds.id}
                onClick={() => setDsId(ds.id)}
                style={{
                  width:'100%', textAlign:'left', padding:'10px 12px',
                  borderRadius:'var(--radius)',
                  border: dsId === ds.id ? '1px solid rgba(26,86,219,0.25)' : '1px solid transparent',
                  background: dsId === ds.id ? 'var(--accent-light)' : 'transparent',
                  cursor:'pointer', fontFamily:'inherit', marginBottom:4,
                  display:'flex', alignItems:'center', gap:10, transition:'all 0.15s',
                }}
              >
                <div style={{ width:8, height:8, borderRadius:'50%', background: DS_COLORS[ds.id] || '#888', flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:14, fontWeight:500, color: dsId === ds.id ? 'var(--accent)' : 'var(--ink)' }}>
                    {ds.name.split('—')[0].trim()}
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>
                    {(ds.rows || 0).toLocaleString()} rows · {ds.cols} cols
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="card card-pad">
            <div className="label-sm" style={{ marginBottom:12 }}>Columns</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {(rowData?.meta?.columns || []).slice(0, 10).map(col => (
                <div key={col.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, fontFamily:'DM Mono,monospace', color:'var(--ink)' }}>{col.key}</span>
                  <span
                    className={`pill ${
                      col.type === 'float' || col.type === 'integer' ? 'pill-blue'
                      : col.type === 'string' ? 'pill-green'
                      : 'pill-gray'
                    }`}
                    style={{ fontSize:10 }}
                  >
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          <div className="grid-4">
            {summaryFields.map(({ key, label, fmt: fieldFmt, delta, up }) => (
              <div key={key} className="metric-card">
                <div className="metric-label">{label}</div>
                <div className="metric-val">
                  {sumLoading
                    ? <div className="skeleton" style={{ height:32, width:80, borderRadius:6 }} />
                    : (summary !== null && summary !== undefined && summary[key] !== null && summary[key] !== undefined)
                      ? fieldFmt(summary[key])
                      : '—'
                  }
                </div>
                {delta && (
                  <div className="metric-delta" style={{ color: up ? 'var(--accent-2)' : 'var(--muted)' }}>
                    {delta}
                  </div>
                )}
              </div>
            ))}
          </div>

          {renderCharts()}

          {rowLoading
            ? <div className="card card-pad skeleton" style={{ height:300 }} />
            : (
              <DataTable
                rows={Array.isArray(rowData?.rows) ? rowData.rows : []}
                columns={tableCols}
                title={`${dsId.charAt(0).toUpperCase() + dsId.slice(1)} rows`}
              />
            )
          }
        </div>
      </div>
    </div>
  )
}