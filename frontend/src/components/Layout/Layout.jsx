import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Topbar from '../Topbar/Topbar.jsx'

const titles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects List',
  '/alerts': 'Alerts / Risk',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function Layout(){
  const { pathname } = useLocation()
  const title = titles[pathname] || (pathname.startsWith('/projects/') ? 'Project Detail' : 'MPLADS Monitor')
  const showTopbar = pathname === '/dashboard' || pathname.startsWith('/projects')

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        {showTopbar && <Topbar title={title} />}
        <div className="content"><Outlet /></div>
      </div>
    </div>
  )
}