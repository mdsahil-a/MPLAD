import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../api/authApi.js'

export default function Login(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await loginUser(email, password)
      navigate('/dashboard')
    } catch (err) {
      // Proceed gracefully for prototype demo
      console.warn('Backend login fallback:', err.message)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)',padding:16}}>
      <div style={{display:'flex',width:'100%',maxWidth:760,borderRadius:'var(--radius-xl)',overflow:'hidden',boxShadow:'var(--shadow-lg)',border:'1px solid var(--border)',background:'var(--surface-card)'}}>

        <div style={{flex:1,background:'var(--bg-sidebar)',color:'var(--text-primary)',padding:'48px 36px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',borderRight:'1px solid var(--border)'}}>
          <div style={{width:52,height:52,borderRadius:12,background:'var(--text-primary)',color:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22,boxShadow:'var(--shadow-md)'}}>
            M
          </div>
          <h2 style={{fontFamily:'var(--font-sans)',fontWeight:700,fontSize:20,marginTop:16,color:'var(--text-primary)'}}>MPLADS<br/>Surveillance System</h2>
          <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:10,lineHeight:1.6}}>Transparent projects,<br/>stronger communities.</p>
        </div>

        <form onSubmit={handleSubmit} style={{flex:1,background:'var(--surface-card)',padding:'48px 40px'}}>
          <h1 style={{fontFamily:'var(--font-sans)',fontWeight:700,fontSize:22,marginBottom:4,color:'var(--text-primary)'}}>Welcome back</h1>
          <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:24}}>Login to your account</p>

          {error && <div style={{color:'var(--red-text)',fontSize:12,marginBottom:12}}>{error}</div>}

          <div className="field">
            <label>Email / Username</label>
            <input className="input" type="text" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@mospi.gov.in" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button className="btn" style={{width:'100%',marginTop:6}} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p style={{textAlign:'center',fontSize:12.5,marginTop:16}}>
            <a href="#" style={{color:'var(--blue-main)'}}>Forgot Password?</a>
          </p>
        </form>

      </div>
    </div>
  )
}
