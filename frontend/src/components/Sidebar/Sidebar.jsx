import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '◧' },
  { to: '/projects', label: 'Projects List', icon: '☰' },
  { to: '/alerts', label: 'Alerts / Risk', icon: '⚠' },
  { to: '/reports', label: 'Reports', icon: '▤' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="brand">MPLADS Monitor</div>
      <nav>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({isActive}) => isActive ? 'active' : ''}>
            <span>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
