export default function StatCard({ label, value, tone, change, sub }) {
  const badgeClass = tone === 'high' ? 'pill high' : tone === 'med' ? 'pill med' : 'pill low'
  
  return (
    <div className="card stat">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="l">{label}</div>
        {change && <span className={badgeClass}>{change}</span>}
      </div>
      <div className="n">{value}</div>
      <div className="sub">{sub || 'vs previous 14 days'}</div>
    </div>
  )
}
