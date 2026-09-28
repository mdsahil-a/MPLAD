import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Topbar({ title }) {
  const [range, setRange] = useState(() => localStorage.getItem('mplad_date_range') || 'Last 14 days');
  const [district, setDistrict] = useState(() => localStorage.getItem('mplad_district_filter') || 'All Districts');
  const [userName, setUserName] = useState(() => localStorage.getItem('mplad_username') || 'Admin');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleUserUpdate = () => {
      setUserName(localStorage.getItem('mplad_username') || 'Admin');
    };
    window.addEventListener('storage_username_updated', handleUserUpdate);
    return () => window.removeEventListener('storage_username_updated', handleUserUpdate);
  }, []);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    localStorage.setItem('mplad_date_range', newRange);
    window.dispatchEvent(new CustomEvent('date_range_changed', { detail: newRange }));
  };

  const handleDistrictChange = (newDist) => {
    setDistrict(newDist);
    localStorage.setItem('mplad_district_filter', newDist);
    window.dispatchEvent(new CustomEvent('topbar_district_changed', { detail: newDist }));
  };

  const initials = userName
    .trim()
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {title || 'Surveillance Dashboard'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="theme-switch-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} style={{ fontSize: 13 }}></i>
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <i className="fa-regular fa-calendar-days" style={{ position: 'absolute', left: 10, fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
          <select
            className="select-input"
            value={range}
            onChange={e => handleRangeChange(e.target.value)}
            style={{ paddingLeft: 28, paddingRight: 24, fontSize: 12, fontWeight: 500, height: 32 }}
          >
            <option value="Last 14 days">Last 14 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
            <option value="FY 2024-25">FY 2024-25</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            className="select-input"
            value={district}
            onChange={e => handleDistrictChange(e.target.value)}
            style={{ paddingLeft: 12, paddingRight: 24, fontSize: 12, fontWeight: 500, height: 32 }}
          >
            <option value="All Districts">All Districts</option>
            <option value="North district">North district</option>
            <option value="Riverside constituency">Riverside constituency</option>
            <option value="Hill block">Hill block</option>
            <option value="Central ward">Central ward</option>
          </select>
        </div>

        {/* Notification Bell */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          fontSize: 13,
          color: 'var(--text-secondary)'
        }} title="Notifications">
          <i className="fa-regular fa-bell"></i>
        </div>

        {/* User Initials Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--brand-icon-bg)',
            color: 'var(--brand-icon-color)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12
          }} title={userName}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}