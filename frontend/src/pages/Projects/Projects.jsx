import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projects, tierOf } from '../../data/mockData.js'
import RiskBadge from '../../components/RiskBadge/RiskBadge.jsx'

function fmtINR(n){ return '₹'+(n/100000).toFixed(1)+'L' }

export default function ProjectsList(){
  const navigate = useNavigate()
  const [tier, setTier] = useState('all')
  const [q, setQ] = useState('')

  const rows = projects.filter(p => {
    const matchesTier = tier === 'all' || tierOf(p.risk) === tier
    const matchesQ = !q || p.work.toLowerCase().includes(q.toLowerCase()) || p.mp.toLowerCase().includes(q.toLowerCase())
    return matchesTier && matchesQ
  })

  return (
    <div style={{background:'#F3EEFA', margin:'-24px', padding:'24px', minHeight:'100%'}}>
      <div className="page-title">Projects</div>
      <div className="page-sub">All sanctioned works under MPLADS, ranked by risk score</div>

      <div className="tabs">
        {['all','high','med','low'].map(t => (
          <button key={t} className={`tab ${tier===t?'active':''}`} onClick={()=>setTier(t)}>
            {t === 'all' ? 'All' : t === 'high' ? 'High risk' : t === 'med' ? 'Medium risk' : 'Low risk'}
          </button>
        ))}
        <input className="input" style={{marginLeft:'auto',maxWidth:220}} placeholder="Search MP or work..."
          value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <div className="card" style={{padding:0}}>
        <table>
          <thead><tr><th>Work</th><th>MP / District</th><th>Sanctioned</th><th>Progress</th><th>Risk</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} onClick={()=>navigate(`/projects/${p.id}`)}>
                <td>{p.work}<div style={{fontSize:11,color:'var(--text-muted)'}}>{p.id}</div></td>
                <td>{p.mp}<div style={{fontSize:11,color:'var(--text-muted)'}}>{p.district}</div></td>
                <td>{fmtINR(p.sanctioned)}</td>
                <td>{p.progress}%</td>
                <td><RiskBadge risk={p.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
