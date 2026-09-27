export default function Topbar({ title }){
  return (
    <header className="topbar">
      <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
        <span style={{color:'var(--text-muted)'}}>🔍</span>
        <input className="input" placeholder="Search projects..." style={{maxWidth:320,border:'none',background:'var(--surface-1)'}} />
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,fontSize:13}}>
        <span>Admin</span>
        <div style={{width:30,height:30,borderRadius:'50%',background:'var(--navy-600)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>A</div>
      </div>
    </header>
  )
}