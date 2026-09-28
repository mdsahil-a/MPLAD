import React from 'react'
import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => localStorage.getItem('mplad_username') || 'Admin');
  
  // Settings collapsible menu state
  const isSettingsRoute = location.pathname.startsWith('/settings');
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  useEffect(() => {
    if (isSettingsRoute) {
      setSettingsOpen(true);
    }
  }, [isSettingsRoute]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUserName(localStorage.getItem('mplad_username') || 'Admin');
    };
    window.addEventListener('storage_username_updated', handleUserUpdate);
    return () => window.removeEventListener('storage_username_updated', handleUserUpdate);
  }, []);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'profile';

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">M</div>
        <span>MPLADS Monitor</span>
      </div>

      <nav>
        <div className="nav-category">Surveillance</div>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          <i className="fa-solid fa-chart-pie" style={{ width: 16 }}></i> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
          <i className="fa-solid fa-list-check" style={{ width: 16 }}></i> Projects List
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => (isActive ? 'active' : '')}>
          <i className="fa-solid fa-triangle-exclamation" style={{ width: 16 }}></i> Risk Alerts
        </NavLink>

        <div className="nav-category" style={{ marginTop: 10 }}>Reports &amp; Admin</div>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
          <i className="fa-solid fa-file-lines" style={{ width: 16 }}></i> Reports
        </NavLink>

        <div style={{ marginTop: 2 }}>
          <div
            onClick={() => {
              if (!isSettingsRoute) {
                navigate('/settings?tab=profile');
              }
              setSettingsOpen(prev => !prev);
            }}
            className={`nav-parent-item ${isSettingsRoute ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: isSettingsRoute ? 'var(--nav-active-text)' : 'var(--text-secondary)',
              background: isSettingsRoute ? 'var(--nav-active-bg)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-gear" style={{ width: 16 }}></i> Settings
            </div>
            <i className={`fa-solid fa-chevron-${settingsOpen ? 'up' : 'down'}`} style={{ fontSize: 10, color: 'var(--text-muted)' }}></i>
          </div>

          {settingsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, paddingLeft: 14 }}>
              <NavLink
                to="/settings?tab=profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: isSettingsRoute && currentTab === 'profile' ? 600 : 400,
                  color: isSettingsRoute && currentTab === 'profile' ? 'var(--blue-main)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  background: isSettingsRoute && currentTab === 'profile' ? 'var(--surface-subtle)' : 'transparent'
                }}
              >
                <i className="fa-regular fa-user" style={{ fontSize: 11, width: 14 }}></i> Profile &amp; Account
              </NavLink>

              <NavLink
                to="/settings?tab=notifications"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: isSettingsRoute && currentTab === 'notifications' ? 600 : 400,
                  color: isSettingsRoute && currentTab === 'notifications' ? 'var(--blue-main)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  background: isSettingsRoute && currentTab === 'notifications' ? 'var(--surface-subtle)' : 'transparent'
                }}
              >
                <i className="fa-regular fa-bell" style={{ fontSize: 11, width: 14 }}></i> Surveillance &amp; Alerts
              </NavLink>

              <NavLink
                to="/settings?tab=users"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: isSettingsRoute && currentTab === 'users' ? 600 : 400,
                  color: isSettingsRoute && currentTab === 'users' ? 'var(--blue-main)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  background: isSettingsRoute && currentTab === 'users' ? 'var(--surface-subtle)' : 'transparent'
                }}
              >
                <i className="fa-solid fa-users" style={{ fontSize: 11, width: 14 }}></i> User Access Control
              </NavLink>

              <NavLink
                to="/settings?tab=datasources"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: isSettingsRoute && currentTab === 'datasources' ? 600 : 400,
                  color: isSettingsRoute && currentTab === 'datasources' ? 'var(--blue-main)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  background: isSettingsRoute && currentTab === 'datasources' ? 'var(--surface-subtle)' : 'transparent'
                }}
              >
                <i className="fa-solid fa-database" style={{ fontSize: 11, width: 14 }}></i> ML &amp; Data Sources
              </NavLink>

              <NavLink
                to="/settings?tab=system"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: isSettingsRoute && currentTab === 'system' ? 600 : 400,
                  color: isSettingsRoute && currentTab === 'system' ? 'var(--blue-main)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  background: isSettingsRoute && currentTab === 'system' ? 'var(--surface-subtle)' : 'transparent'
                }}
              >
                <i className="fa-solid fa-sliders" style={{ fontSize: 11, width: 14 }}></i> System &amp; Theme
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{
          background: 'var(--surface-subtle)',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <i className="fa-solid fa-user-shield"></i> {userName}
        </div>
      </div>
    </aside>
  );
}
