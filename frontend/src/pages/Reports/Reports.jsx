import { useState } from 'react'
import { getStats, projects } from '../../data/mockData.js'

export default function Reports(){
  const stats = getStats()
  const [tab, setTab] = useState('overview')

  const byDistrict = {}
  projects.forEach(p => { byDistrict[p.district] = (byDistrict[p.district]||0) + 1 })
  const topDistricts = Object.entries(byDistrict).sort((a,b)=>b[1]-a[1])
  const maxCount = Math.max(...topDistricts.map(([,c])=>c))

  const r = 42, c = 2*Math.PI*r
  const submitted = 0.42, progress = 0.31, denied = 0.14, others = 1 - 0.42 - 0.31 - 0.14
  const segs = [
    { pct: submitted, color: 'var(--navy-600)' },
    { pct: progress, color: 'var(--amber-600)' },
    { pct: denied, color: 'var(--red-600)' },
    { pct: others, color: 'var(--green-600)' },
  ]
  let offset = 0
  const arcs = segs.map(s => { const len = c*s.pct; const a = { ...s, len, offset }; offset -= len; return a })

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div className="page-title">Reports &amp; Analytics</div>
          <div className="page-sub">Aggregate view of fund utilization and risk across districts</div>
        </div>
        <button className="btn">↓ Export</button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='overview'?'active':''}`} onClick={()=>setTab('overview')}>Overview</button>
        <button className={`tab ${tab==='detailed'?'active':''}`} onClick={()=>setTab('detailed')}>Detailed</button>
        <button className={`tab ${tab==='custom'?'active':''}`} onClick={()=>setTab('custom')}>Custom</button>
        <select className="input" style={{marginLeft:'auto',maxWidth:160}}>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
      </div>

      <div className="grid stat-grid">
        <div className="card stat">
          <div className="n">{stats.total.toLocaleString()}</div>
          <div className="l">Total Projects</div>
          <div style={{fontSize:11,color:'var(--green-600)',marginTop:4}}>+3% from last month</div>
        </div>
        <div className="card stat">
          <div className="n">{stats.high+stats.med}</div>
          <div className="l">Flagged Projects</div>
          <div style={{fontSize:11,color:'var(--red-600)',marginTop:4}}>+15% from last month</div>
        </div>
        <div className="card stat">
          <div className="n">{stats.high}</div>
          <div className="l">High Risk Projects</div>
          <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>+0% from last month</div>
        </div>
        <div className="card stat">
          <div className="n">₹{(stats.fundReleased/10000000).toFixed(2)} Cr</div>
          <div className="l">Total Fund Utilized</div>
          <div style={{fontSize:11,color:'var(--green-600)',marginTop:4}}>+2% from last month</div>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',alignItems:'stretch'}}>
        <div className="card">
          <strong style={{fontSize:14}}>Project Status</strong>
          <div style={{display:'flex',alignItems:'center',gap:20,marginTop:14,justifyContent:'center'}}>
            <svg width="110" height="110" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-0)" strokeWidth="14" />
              {arcs.map((a,i) => (
                <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={a.color} strokeWidth="14"
                  strokeDasharray={`${a.len} ${c-a.len}`} strokeDashoffset={a.offset} transform="rotate(-90 50 50)" />
              ))}
            </svg>
            <div className="donut-legend">
              <span><i className="dot" style={{background:'var(--navy-600)'}}></i>Submitted ({Math.round(submitted*100)}%)</span>
              <span><i className="dot" style={{background:'var(--amber-600)'}}></i>In progress ({Math.round(progress*100)}%)</span>
              <span><i className="dot" style={{background:'var(--red-600)'}}></i>Denied ({Math.round(denied*100)}%)</span>
              <span><i className="dot" style={{background:'var(--green-600)'}}></i>Others ({Math.round(others*100)}%)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <strong style={{fontSize:14}}>Top Risk Districts</strong>
          <div style={{marginTop:14}}>
            {topDistricts.map(([d, count]) => (
              <div key={d} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:90,fontSize:12,color:'var(--text-secondary)'}}>{d}</div>
                <div style={{flex:1,background:'var(--surface-0)',borderRadius:4,height:10}}>
                  <div style={{width:`${count/maxCount*100}%`,background:'var(--navy-600)',height:'100%',borderRadius:4}} />
                </div>
                <div style={{fontSize:12,width:18,textAlign:'right'}}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}