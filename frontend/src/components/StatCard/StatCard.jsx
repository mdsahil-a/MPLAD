export default function StatCard({ label, value, tone }){
  const color = tone === 'high' ? 'var(--red-600)' : tone === 'med' ? 'var(--amber-600)' : tone === 'low' ? 'var(--green-600)' : 'var(--text-primary)'
  return (
    <div className="card stat">
      <div className="n" style={{color}}>{value}</div>
      <div className="l">{label}</div>
    </div>
  )
}
