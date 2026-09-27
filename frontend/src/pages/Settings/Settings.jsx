import { useState } from 'react'

const sections = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'datasources', label: 'Data Sources', icon: '🗄' },
  { id: 'system', label: 'System', icon: '⚙' },
]

export default function Settings(){
  const [active, setActive] = useState('profile')

  return (
    <div style={{background:'#EAF7EF', margin:'-24px', padding:'32px', minHeight:'100%'}}>
      <div className="page-title">Settings</div>
      <div className="page-sub" style={{marginBottom:28}}>Profile and notification preferences</div>

      <div style={{display:'flex',gap:24,alignItems:'stretch',maxWidth:900}}>
        <div className="card" style={{width:220,padding:'10px 0',flexShrink:0,boxShadow:'0 1px 3px rgba(14,24,48,.06)'}}>
          {sections.map(s => (
            <div key={s.id} onClick={()=>setActive(s.id)}
                 style={{display:'flex',alignItems:'center',gap:10,padding:'12px 18px',cursor:'pointer',fontSize:13.5,
                          color: active===s.id ? 'var(--navy-800)' : 'var(--text-secondary)',
                          background: active===s.id ? 'var(--navy-50)' : 'transparent',
                          borderLeft: active===s.id ? '3px solid var(--navy-800)' : '3px solid transparent'}}>
              <span>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>

        <div className="card" style={{flex:1,padding:'28px 32px',boxShadow:'0 1px 3px rgba(14,24,48,.06)'}}>
          {active === 'profile' && (
            <>
              <strong style={{fontSize:15}}>Profile Settings</strong>
              <div style={{marginTop:20,maxWidth:400}}>
                <div className="field">
                  <label>Name</label>
                  <input className="input" defaultValue="Aarav Nair" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="input" defaultValue="aarav@mplad.gov.in" />
                </div>
                <div className="field">
                  <label>Role</label>
                  <input className="input" defaultValue="System Administrator" disabled />
                </div>
                <button className="btn" style={{marginTop:6}}>Save Changes</button>
              </div>
            </>
          )}
          {active === 'notifications' && (
            <>
              <strong style={{fontSize:15}}>Notification Preferences</strong>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:14}}>Choose which alerts you want emailed to you.</p>
            </>
          )}
          {active === 'users' && (
            <>
              <strong style={{fontSize:15}}>User Management</strong>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:14}}>Manage who has access to this dashboard.</p>
            </>
          )}
          {active === 'datasources' && (
            <>
              <strong style={{fontSize:15}}>Data Sources</strong>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:14}}>Connect the MPLADS dataset or backend API here.</p>
            </>
          )}
          {active === 'system' && (
            <>
              <strong style={{fontSize:15}}>System</strong>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:14}}>General system configuration.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}