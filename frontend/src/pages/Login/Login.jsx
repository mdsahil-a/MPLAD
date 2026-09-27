import { useNavigate } from 'react-router-dom'

export default function Login(){
  const navigate = useNavigate()
  function handleSubmit(e){
    e.preventDefault()
    navigate('/dashboard')
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#d1dff2'}}>
      <div style={{display:'flex',width:'100%',maxWidth:760,borderRadius:16,overflow:'hidden',boxShadow:'0 10px 40px rgba(27, 75, 187, 0.15)'}}>

        <div style={{flex:1,background:'var(--navy-900)',color:'#fff',padding:'48px 36px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
            <path d="M12 2 3 7v2h18V7l-9-5Z" fill="#fff" stroke="none"/>
            <path d="M5 10v9M9 10v9M15 10v9M19 10v9" strokeLinecap="round"/>
            <path d="M3 22h18" strokeLinecap="round"/>
          </svg>
          <h2 style={{fontFamily:'var(--font-serif)',fontWeight:400,fontSize:22,marginTop:16}}>MPLAD<br/>Monitoring System</h2>
          <p style={{fontSize:13,opacity:.75,marginTop:10,lineHeight:1.6}}>Transparent projects,<br/>stronger communities.</p>
        </div>

        <form onSubmit={handleSubmit} style={{flex:1,background:'var(--surface-2)',padding:'48px 40px'}}>
          <h1 style={{fontFamily:'var(--font-serif)',fontWeight:400,fontSize:22,marginBottom:4}}>Welcome back</h1>
          <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:26}}>Login to your account</p>

          <div className="field">
            <label>Email / Username</label>
            <input className="input" type="text" placeholder="you@mospi.gov.in" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" placeholder="••••••••" required />
          </div>

          <button className="btn" style={{width:'100%',marginTop:6}} type="submit">Login</button>
          <p style={{textAlign:'center',fontSize:12.5,marginTop:16}}>
            <a href="#" style={{color:'var(--navy-600)'}}>Forgot Password?</a>
          </p>
        </form>

      </div>
    </div>
  )
}