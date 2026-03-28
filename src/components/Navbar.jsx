import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { BarChart2, Map, Brain, Database, MessageSquare} from 'lucide-react'
import { UploadCloud } from 'lucide-react'

const links = [
  { to:'/',        label:'Overview',   icon: BarChart2    },
  { to:'/explore', label:'Explorer',   icon: Map          },
  { to:'/ml',      label:'ML Models',  icon: Brain        },
  { to:'/sql',     label:'SQL',        icon: Database     },
  { to:'/ai',      label:'AI Analyst', icon: MessageSquare},
  { to:'/upload', label:'Upload CSV', icon: UploadCloud },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav style={{
      position:'sticky', top:0, zIndex:100,
      background: scrolled ? 'rgba(248,247,244,0.94)' : 'rgba(248,247,244,0.98)',
      backdropFilter:'blur(12px)',
      borderBottom:'1px solid rgba(0,0,0,0.08)',
      padding:'0 40px',
      display:'flex', alignItems:'center', gap:32, height:62,
      transition:'background 0.2s',
    }}>
      <NavLink to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <div style={{ width:9, height:9, borderRadius:'50%', background:'#1a56db' }} />
        <span style={{ fontFamily:'DM Serif Display,serif', fontSize:21, color:'#0d1117', letterSpacing:'-0.02em' }}>
          DataSphere
        </span>
      </NavLink>

      <div style={{ display:'flex', gap:2, marginLeft:'auto' }}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:7,
            padding:'7px 14px', fontSize:14, fontWeight:500,
            color: isActive ? '#0d1117' : '#6b7280',
            background: isActive ? '#f1f0ec' : 'transparent',
            borderRadius:7, textDecoration:'none', transition:'all 0.15s',
          })}>
            <Icon size={15} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>

      <a href="https://github.com/ZUBENATHI-SAMKILE" target="_blank" rel="noreferrer" style={{
        display:'flex', alignItems:'center', gap:7,
        padding:'7px 16px', fontSize:14, fontWeight:600,
        background:'#0d1117', color:'#fff',
        borderRadius:7, textDecoration:'none',
        fontFamily:'Instrument Sans,sans-serif',
      }}>
        
        GitHub
      </a>
    </nav>
  )
}