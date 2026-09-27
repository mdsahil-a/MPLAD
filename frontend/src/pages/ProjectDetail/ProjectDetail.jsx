import { useParams, Link } from 'react-router-dom'
import { projects, tierOf } from '../../data/mockData.js'
import RiskBadge from '../../components/RiskBadge/RiskBadge.jsx'

function fmtINR(n){ return '₹'+(n/100000).toFixed(1)+'L' }

export default function ProjectDetail(){
  const { id } = useParams()
  const p = projects.find(x => x.id === id)
  if(!p) return <div>Project not found. <Link to="/projects">Back to list</Link></div>

  const t = tierOf(p.risk)
  const signals = [
    { l: 'Financial anomaly', v: p.finSignal, d: 'Cost vs baseline, spend-vs-progress mismatch' },
    { l: 'Delay / execution', v: p.netSignal, d: `${p.delayDays} days behind schedule` },
    { l: 'Duplicate work similarity', v: p.dupSignal, d: 'Semantic match with another sanctioned work' },
    { l: 'Geo-photo mismatch', v: p.photoSignal, d: 'Claimed progress vs geotagged evidence' },
  ]
  const recommend = t === 'high'
    ? 'Recommend priority field verification and hold on next payment tranche.'
    : t === 'med'
    ? 'Recommend adding to district watchlist; re-check at next progress update.'
    : 'No action needed. Continue routine monitoring.'

  return (
    <div>
      <div className="page-title">Project Detail</div>
      <div className="page-sub">{p.work} · {p.id} · {p.mp}, {p.district}</div>

      <Link to="/projects" style={{fontSize:12,color:'var(--text-secondary)',display:'inline-block',marginBottom:16}}>← Back to projects</Link>

      <div className="grid stat-grid">
        <div className="card stat"><div className="n">{fmtINR(p.sanctioned)}</div><div className="l">Sanctioned</div></div>
        <div className="card stat"><div className="n">{fmtINR(p.spent)}</div><div className="l">Spent</div></div>
        <div className="card stat"><div className="n">{p.progress}%</div><div className="l">Progress</div></div>
        <div className="card stat"><RiskBadge risk={p.risk} /><div className="l" style={{marginTop:6}}>Composite risk</div></div>
      </div>

      <div className="card">
        <strong style={{fontSize:14}}>Risk signal breakdown</strong>
        <div style={{marginTop:14}}>
          {signals.map(s => (
            <div className="signal-row" key={s.l}>
              <div className="signal-lbl"><span>{s.l}</span><b>{s.v}/100</b></div>
              <div className="signal-track"><div className="signal-fill" style={{width:`${s.v}%`}} /></div>
              <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:4}}>{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,padding:'10px 14px',background:'var(--surface-1)',borderLeft:'3px solid var(--amber-600)',fontSize:13,color:'var(--text-secondary)'}}>
          <b style={{color:'var(--text-primary)'}}>Recommendation:</b> {recommend}
        </div>
      </div>
    </div>
  )
}