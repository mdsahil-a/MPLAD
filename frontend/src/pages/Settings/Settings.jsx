import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchSettings, updateSettings } from '../../api/settingsApi.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  User,
  Bell,
  Users,
  Database,
  Sliders,
  Check,
  Save,
  Shield,
  Server,
  RefreshCw,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Form state - initialized from localStorage, defaulting to "Admin"
  const [name, setName] = useState(() => localStorage.getItem('mplad_username') || 'Admin');
  const [email, setEmail] = useState(() => localStorage.getItem('mplad_email') || 'admin@mplad.gov.in');
  const [department, setDepartment] = useState(() => localStorage.getItem('mplad_dept') || 'MoSPI Audit & Surveillance Division');
  const [title, setTitle] = useState(() => localStorage.getItem('mplad_title') || 'Senior Systems Administrator');

  // Notification Preferences state
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyMlOutliers, setNotifyMlOutliers] = useState(true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState('65');

  // ML Service Health Ping state
  const [mlPingStatus, setMlPingStatus] = useState('checking');

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { theme, toggleTheme } = useTheme();

  // Test ML service connectivity
  const testMlConnection = async () => {
    setMlPingStatus('checking');
    try {
      const res = await fetch('http://127.0.0.1:8000/health');
      if (res.ok) {
        setMlPingStatus('online');
      } else {
        setMlPingStatus('offline');
      }
    } catch (err) {
      setMlPingStatus('offline');
    }
  };

  useEffect(() => {
    testMlConnection();
  }, []);

  // Save Profile Handler - Updates localStorage & dispatches event for Topbar / Sidebar
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToastMessage('');

    try {
      // 1. Save to localStorage
      localStorage.setItem('mplad_username', name.trim() || 'Admin');
      localStorage.setItem('mplad_email', email.trim());
      localStorage.setItem('mplad_dept', department.trim());
      localStorage.setItem('mplad_title', title.trim());

      // 2. Dispatch custom event so Topbar and Sidebar immediately update user initials & name
      window.dispatchEvent(new Event('storage_username_updated'));

      // 3. Optional backend update
      await updateSettings({ name, email }).catch(() => {});

      setToastMessage('Profile settings saved successfully! Display name updated across system.');
    } catch (err) {
      console.error('Save error:', err);
      setToastMessage('Saved locally to browser storage.');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const initials = name
    .trim()
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon size={24} style={{ color: 'var(--blue-main)' }} />
          <span>System Settings &amp; Configuration</span>
        </div>
        <div className="page-sub" style={{ marginBottom: 0 }}>
          Manage user profile, notification thresholds, team permissions, ML service connectivity, and theme preferences
        </div>
      </div>

      {toastMessage && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--emerald-bg)',
          color: 'var(--emerald-text)',
          border: '1px solid var(--emerald-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Full-Width Content Card */}
      <div className="card" style={{ padding: 24 }}>

        {/* SUB-SECTION 1: PROFILE & ACCOUNT */}
        {activeTab === 'profile' && (
          <div>
            {/* User Avatar & Header Summary Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: 20,
              background: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              marginBottom: 24
            }}>
              <div style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'var(--brand-icon-bg)',
                color: 'var(--brand-icon-color)',
                fontSize: 22,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                flexShrink: 0
              }}>
                {initials}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h3>
                  <span className="pill low" style={{ fontSize: 11 }}>
                    <Shield size={12} style={{ marginRight: 4 }} /> System Administrator
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {email} • {department}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block', marginBottom: 16 }}>
                User Account Information
              </strong>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div className="field">
                  <label>Full Display Name (Stored in localStorage)</label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Admin or Aarav Nair"
                    required
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Default is <strong>Admin</strong>. Saved locally to browser storage.
                  </div>
                </div>

                <div className="field">
                  <label>Official Email Address</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@mplad.gov.in"
                    required
                  />
                </div>

                <div className="field">
                  <label>Government Division / Ministry</label>
                  <input
                    className="input"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. MoSPI Audit & Surveillance Division"
                  />
                </div>

                <div className="field">
                  <label>Official Title / Designation</label>
                  <input
                    className="input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Senior Systems Auditor"
                  />
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn" type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
                  <Save size={15} />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB-SECTION 2: SURVEILLANCE & ALERTS PREFERENCES */}
        {activeTab === 'notifications' && (
          <div>
            <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              Surveillance &amp; Risk Alert Preferences
            </strong>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              Configure automated email alerts and ML anomaly threshold triggers
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 650 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>High-Risk Anomaly Email Alerts</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Send instant alert when a project exceeds risk score threshold</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHighRisk}
                  onChange={e => setNotifyHighRisk(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>ML Isolation Forest Outlier Notifications</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Notify when machine learning identifies new statistical outliers</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMlOutliers}
                  onChange={e => setNotifyMlOutliers(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Weekly Executive PDF Digest</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automated weekly PDF audit summary delivered every Monday</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWeeklyReport}
                  onChange={e => setNotifyWeeklyReport(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>High Risk Trigger Threshold (0 - 100 Score)</label>
                <select className="select-input" value={riskThreshold} onChange={e => setRiskThreshold(e.target.value)} style={{ width: '100%' }}>
                  <option value="60">Strict: Trigger Alert at Risk Score &ge; 60</option>
                  <option value="65">Default: Trigger Alert at Risk Score &ge; 65</option>
                  <option value="75">Relaxed: Trigger Alert at Risk Score &ge; 75</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SECTION 3: USER ACCESS CONTROL */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block' }}>Authorized System Users</strong>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Team members with access to the MPLADS Audit Portal</div>
              </div>
              <button className="btn" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> Add System User
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{name} (You)</td>
                    <td>{email}</td>
                    <td><span className="pill low">System Administrator</span></td>
                    <td><span style={{ color: 'var(--emerald-main)', fontWeight: 600, fontSize: 12 }}>Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Aarav Nair</td>
                    <td>aarav@mplad.gov.in</td>
                    <td><span className="pill med">Senior Systems Analyst</span></td>
                    <td><span style={{ color: 'var(--emerald-main)', fontWeight: 600, fontSize: 12 }}>Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Priya Sharma</td>
                    <td>priya@mplad.gov.in</td>
                    <td><span className="pill low">Field Audit Inspector</span></td>
                    <td><span style={{ color: 'var(--emerald-main)', fontWeight: 600, fontSize: 12 }}>Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Rajesh Verma</td>
                    <td>verma@mplad.gov.in</td>
                    <td><span className="pill low">Regional Compliance Officer</span></td>
                    <td><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Invited</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-SECTION 4: ML & DATA SOURCES */}
        {activeTab === 'datasources' && (
          <div>
            <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              ML Service &amp; Backend Infrastructure Status
            </strong>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              Live connectivity status for Python FastAPI Isolation Forest service and API endpoints
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                    <Server size={18} style={{ color: 'var(--blue-main)' }} />
                    Python ML Service (FastAPI)
                  </div>
                  <span className={`pill ${mlPingStatus === 'online' ? 'low' : 'high'}`}>
                    {mlPingStatus === 'online' ? 'Online • 200 OK' : 'Checking...'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Endpoint: <code>http://127.0.0.1:8000/analyze</code><br />
                  Model: <strong>scikit-learn Isolation Forest</strong><br />
                  Text Matching: TF-IDF Cosine Similarity
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={testMlConnection}
                  style={{ marginTop: 12, width: '100%', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <RefreshCw size={13} className={mlPingStatus === 'checking' ? 'spin' : ''} /> Test ML Connection
                </button>
              </div>

              <div style={{ padding: 16, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                    <Database size={18} style={{ color: 'var(--emerald-main)' }} />
                    Node.js Express Backend API
                  </div>
                  <span className="pill low">Active</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Base Endpoint: <code>http://localhost:5000/api</code><br />
                  Storage Engine: <code>database.json</code><br />
                  Dataset: 12 Sanctioned MPLAD Projects
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SECTION 5: SYSTEM & THEME */}
        {activeTab === 'system' && (
          <div>
            <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              Interface Theme &amp; System Preferences
            </strong>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              Customize visual theme and workspace view settings
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 600 }}>
              <div
                onClick={() => theme === 'dark' && toggleTheme()}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-lg)',
                  border: theme === 'light' ? '2px solid var(--blue-main)' : '1px solid var(--border)',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sun size={16} /> Light Mode
                  </span>
                  {theme === 'light' && <Check size={16} style={{ color: 'var(--blue-main)' }} />}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Crisp high-contrast workspace theme</div>
              </div>

              <div
                onClick={() => theme === 'light' && toggleTheme()}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-lg)',
                  border: theme === 'dark' ? '2px solid var(--blue-main)' : '1px solid var(--border)',
                  background: '#0D1117',
                  color: '#F3F4F6',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Moon size={16} /> Dark Mode
                  </span>
                  {theme === 'dark' && <Check size={16} style={{ color: 'var(--blue-main)' }} />}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Sleek dark navy surveillance theme</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}