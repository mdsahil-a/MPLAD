import { tierOf } from '../../data/mockData.js'

export default function RiskBadge({ risk }){
  const t = tierOf(risk)
  const label = t === 'high' ? 'High' : t === 'med' ? 'Medium' : 'Low'
  return <span className={`pill ${t}`}>{risk} · {label}</span>
}
