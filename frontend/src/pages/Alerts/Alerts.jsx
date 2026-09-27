import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projects, tierOf } from '../../data/mockData.js'

const toneMap = {
  high:   { badgeBg:'var(--red-100)',   badgeText:'var(--red-800)',   icon:'#fff', iconBg:'var(--red-600)',   label:'High' },
  med:    { badgeBg:'var(--amber-100)', badgeText:'var(--amber-800)', icon:'#fff', iconBg:'var(--amber-600)', label:'Medium' },
  low:    { badgeBg:'var(--green-100)', badgeText:'var(--green-800)', icon:'#fff', iconBg:'var(--green-600)', label:'Low' },
}

function reasonFor(p){
  if (p.finSignal > 60) return 'Cost anomaly detected'
  if (p.netSignal > 60) return `Project delayed ${p.delayDays} days`
  if (p.dupSignal > 60) return 'Possible duplicate project'
  if (p.photoSignal > 60) return 'Progress-photo mismatch'
  return 'Flagged for review'
}

export default function Alerts(){
  const navigate = useNavigate()
  const [tier, setTier] = useState('all')

  const allAlerts = projects.filter(p => tierOf(p.risk) !== 'low' || true).map(p => ({ ...p, tier: tierOf(p.risk) }))
  const counts = {
    all: allAlerts.length,
    high: allAlerts.filter(a=>a.tier==='high').length,
    med: allAlerts.filter(a=>a.tier==='med').length,
    low: allAlerts.filter(a=>a.tier==='low').length,
  }
  const rows = tier === 'all' ? allAlerts : allAlerts.filter(a => a.tier === tier)

  return (
    <div style={{background:'#FDF1F1', margin:'-24px', padding:'24px', minHeight:'100%'}}>
      <div className="page-title">Alerts &amp; Risk Issues</div>
      <div className="page-sub">Works flagged for review, sorted by urgency</div>

      <div className="tabs">
        <button className={`tab ${tier==='all'?'active':''}`} onClick={()=>setTier('all')}>All ({counts.all})</button>
        <button className={`tab ${tier==='high'?'active':''}`} onClick={()=>setTier('high')}>High ({counts.high})</button>
        <button className={`tab ${tier==='med'?'active':''}`} onClick={()=>setTier('med')}>Medium ({counts.med})</button>
        <button className={`tab ${tier==='low'?'active':''}`} onClick={()=>setTier('low')}>Low ({counts.low})</button>
      </div>

      <div className="card" style={{padding:'6px 0'}}>
        {rows.map((p, i) => {
          const t = toneMap[p.tier]
          return (
            <div key={p.id}
                 onClick={()=>navigate(`/projects/${p.id}`)}
                 style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',
                          borderBottom: i < rows.length-1 ? '1px solid var(--border)' : 'none', cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:t.iconBg,color:t.icon,
                             display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>⚠</div>
                <div>
                  <div style={{fontSize:13.5,fontWeight:500}}>{reasonFor(p)}</div>
                  <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2}}>Project {p.id} · {p.district}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <span className="pill" style={{background:t.badgeBg,color:t.badgeText}}>{t.label}</span>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5}}>{(i+1)*2}h ago</div>
              </div>
            </div>
          )
        })}
        {rows.length === 0 && <div style={{padding:20,textAlign:'center',color:'var(--text-muted)'}}>No alerts in this category.</div>}
      </div>
    </div>
  )
}