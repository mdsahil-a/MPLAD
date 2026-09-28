import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Topbar from '../Topbar/Topbar.jsx';

const titles = {
  '/dashboard': 'Surveillance Dashboard Overview',
  '/projects': 'Projects Portfolio & Financial Analytics',
  '/alerts': 'Risk Intelligence & Anomaly Alerts',
  '/reports': 'Audit & Compliance Reports Studio',
  '/settings': 'System Settings & Preferences',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = titles[pathname] || (pathname.startsWith('/projects/') ? 'Project Audit Inspection' : 'MPLADS Surveillance');

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Topbar title={title} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}