import { getStats, projects } from '../../data/mockData.js'
import { Link, useNavigate } from 'react-router-dom'

function fmtINR(n){ return '₹'+(n/10000000).toFixed(2)+' Cr' }

export default function Dashboard(){
  const stats = getStats()
  const navigate = useNavigate()
  const recentAlerts = projects.slice(0, 3)

  // donut chart math
  const r = 42, c = 2 * Math.PI * r
  const highPct = stats.high / stats.total
  const medPct = stats.med / stats.total
  const lowPct = stats.low / stats.total
  const highLen = c * highPct
  const medLen = c * medPct
  const lowLen = c * lowPct

  return (
    <div>
      <div className="page-title">Overview</div>

      <div className="grid stat-grid">
        <div className="card stat"><div className="n">{stats.total.toLocaleString()}</div><div className="l">Total Projects</div></div>
        <div className="card stat"><div className="n" style={{color:'var(--red-600)'}}>{stats.high + stats.med}</div><div className="l">Flagged Projects</div></div>
        <div className="card stat"><div className="n" style={{color:'var(--red-600)'}}>{stats.high}</div><div className="l">High Risk</div></div>
        <div className="card stat"><div className="n">{fmtINR(stats.fundReleased)}</div><div className="l">Total Fund</div></div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',alignItems:'stretch'}}>

        <div className="card" style={{display:'flex',flexDirection:'column'}}>
  <strong style={{fontSize:14}}>Risk Distribution</strong>
  <div style={{display:'flex',alignItems:'center',gap:20,marginTop:14,flex:1,justifyContent:'center'}}>
            <svg width="110" height="110" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-0)" strokeWidth="14" />
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--red-600)" strokeWidth="14"
                strokeDasharray={`${highLen} ${c-highLen}`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--amber-600)" strokeWidth="14"
                strokeDasharray={`${medLen} ${c-medLen}`} strokeDashoffset={-highLen} transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--green-600)" strokeWidth="14"
                strokeDasharray={`${lowLen} ${c-lowLen}`} strokeDashoffset={-(highLen+medLen)} transform="rotate(-90 50 50)" />
            </svg>
            <div className="donut-legend">
              <span><i className="dot" style={{background:'var(--red-600)'}}></i>High ({stats.high})</span>
              <span><i className="dot" style={{background:'var(--amber-600)'}}></i>Medium ({stats.med})</span>
              <span><i className="dot" style={{background:'var(--green-600)'}}></i>Low ({stats.low})</span>
            </div>
          </div>
        </div>

        <div className="card">
          <strong style={{fontSize:14}}>Recent Alerts</strong>
          <div style={{marginTop:12}}>
            {recentAlerts.map(p => {
              const tone = p.risk>=65?{c:'var(--red-600)',bg:'var(--red-100)',l:'High'}:p.risk>=35?{c:'var(--amber-800)',bg:'var(--amber-100)',l:'Medium'}:{c:'var(--green-800)',bg:'var(--green-100)',l:'Low'}
              return (
                <div className="alert-row" key={p.id} style={{cursor:'pointer'}} onClick={()=>navigate(`/projects/${p.id}`)}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{color:tone.c}}>⚠</span>
                    <div>
                      <div style={{fontSize:13.5}}>{p.work}</div>
                      <div style={{fontSize:11.5,color:'var(--text-muted)'}}>{p.id}</div>
                    </div>
                  </div>
                  <span className="pill" style={{background:tone.bg,color:tone.c}}>{tone.l}</span>
                </div>
              )
            })}
          </div>
          <div style={{marginTop:10}}><Link to="/projects" style={{fontSize:12.5,color:'var(--navy-600)'}}>View all →</Link></div>
        </div>
      </div>
    </div>
  )
}