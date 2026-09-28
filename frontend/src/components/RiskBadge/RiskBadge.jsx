import { tierOf } from '../../utils/risk.js'

export default function RiskBadge({ risk }){
  const numericRisk = typeof risk === 'number' ? risk : (parseInt(risk, 10) || 50)
  const t = typeof risk === 'string' && ['high','med','medium','low'].includes(risk.toLowerCase())
    ? (risk.toLowerCase() === 'medium' ? 'med' : risk.toLowerCase())
    : tierOf(numericRisk)
  const label = t === 'high' ? 'High' : t === 'med' ? 'Medium' : 'Low'
  const displayVal = typeof risk === 'number' ? `${risk} · ` : ''
  return <span className={`pill ${t}`}>{displayVal}{label}</span>
}


