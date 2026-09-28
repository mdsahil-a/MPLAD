import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  AlertTriangle,
  Brain,
  ShieldAlert,
  Search,
  LayoutGrid,
  ListFilter,
  ArrowUpDown,
  ChevronRight,
  Download,
  RefreshCw,
  DollarSign,
  Clock,
  Activity,
  Layers,
  Filter
} from 'lucide-react';
import RiskBadge from '../../components/RiskBadge/RiskBadge.jsx';
import { fetchAlerts } from '../../api/alertApi.js';
import { tierOf } from '../../utils/risk.js';

const toneMap = {
  high: { badgeBg: 'var(--red-bg)', badgeText: 'var(--red-text)', icon: 'var(--red-text)', iconBg: 'var(--red-bg)', label: 'High' },
  med: { badgeBg: 'var(--amber-bg)', badgeText: 'var(--amber-text)', icon: 'var(--amber-text)', iconBg: 'var(--amber-bg)', label: 'Medium' },
  low: { badgeBg: 'var(--green-bg)', badgeText: 'var(--green-text)', icon: 'var(--green-text)', iconBg: 'var(--green-bg)', label: 'Low' },
};

function fmtINR(n) {
  if (!n) return '₹0';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

function reasonFor(p) {
  if (p.type) return p.type;
  if (p.finSignal > 60) return 'Cost anomaly detected';
  if (p.netSignal > 60) return `Project delayed ${p.delayDays || 0} days`;
  if (p.dupSignal > 60 || p.possibleDuplicate) return 'Possible duplicate project';
  if (p.photoSignal > 60) return 'Progress-photo mismatch';
  return 'Flagged for review';
}

export default function Alerts() {
  const navigate = useNavigate();
  const [tier, setTier] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState(() => localStorage.getItem('topbar_district') || 'All Districts');
  const [sortBy, setSortBy] = useState('urgency_desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [alertsList, setAlertsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    fetchAlerts({ tier: 'all' })
      .then(data => {
        if (Array.isArray(data)) {
          setAlertsList(data);
        }
      })
      .catch(err => {
        console.error('Error fetching alerts:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();

    const handleTopbarDistrict = (e) => {
      setDistrictFilter(e.detail || 'All Districts');
    };
    window.addEventListener('topbar_district_changed', handleTopbarDistrict);
    return () => window.removeEventListener('topbar_district_changed', handleTopbarDistrict);
  }, []);

  const allAlerts = useMemo(() => {
    return alertsList.map(p => ({
      ...p,
      tier: p.tier || tierOf(p.risk || 0),
      reasonText: reasonFor(p)
    }));
  }, [alertsList]);

  // Filtered and sorted alerts
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      // Urgency / Risk Tier filter
      if (tier !== 'all' && a.tier !== tier) return false;

      // Anomaly Type Filter
      if (typeFilter === 'ml' && !a.mlAnomaly) return false;
      if (typeFilter === 'cost' && !a.reasonText.toLowerCase().includes('cost')) return false;
      if (typeFilter === 'delay' && !a.reasonText.toLowerCase().includes('delay')) return false;
      if (typeFilter === 'duplicate' && !a.reasonText.toLowerCase().includes('duplicate')) return false;

      // District Filter
      if (districtFilter !== 'All Districts' && a.district !== districtFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency_desc') return (b.risk || 0) - (a.risk || 0);
      if (sortBy === 'urgency_asc') return (a.risk || 0) - (b.risk || 0);
      if (sortBy === 'work_asc') return (a.work || '').localeCompare(b.work || '');
      return 0;
    });
  }, [allAlerts, tier, typeFilter, districtFilter, sortBy]);

  // KPI Metrics Summary
  const stats = useMemo(() => {
    const total = filteredAlerts.length;
    const highCount = filteredAlerts.filter(a => a.tier === 'high').length;
    const medCount = filteredAlerts.filter(a => a.tier === 'med').length;
    const lowCount = filteredAlerts.filter(a => a.tier === 'low').length;
    const mlAnomaliesCount = filteredAlerts.filter(a => a.mlAnomaly).length;

    return {
      total,
      highCount,
      medCount,
      lowCount,
      mlAnomaliesCount
    };
  }, [filteredAlerts]);

  // Chart 1: Anomaly Drivers Distribution (Donut Chart)
  const anomalyCategoryData = useMemo(() => {
    let mlCount = 0, costCount = 0, delayCount = 0, dupCount = 0, photoCount = 0;

    filteredAlerts.forEach(a => {
      if (a.mlAnomaly) mlCount++;
      else if (a.reasonText.toLowerCase().includes('cost')) costCount++;
      else if (a.reasonText.toLowerCase().includes('delay')) delayCount++;
      else if (a.reasonText.toLowerCase().includes('duplicate')) dupCount++;
      else photoCount++;
    });

    return [
      { name: 'ML Outlier', count: mlCount, color: '#EF4444' },
      { name: 'Cost Anomaly', count: costCount, color: '#F59E0B' },
      { name: 'Execution Delay', count: delayCount, color: '#3B82F6' },
      { name: 'Duplicate Work', count: dupCount, color: '#8B5CF6' },
      { name: 'Geo-Photo Mismatch', count: photoCount, color: '#10B981' }
    ].filter(item => item.count > 0);
  }, [filteredAlerts]);

  // Chart 2: District Alert Concentration (Bar Chart)
  const districtAlertData = useMemo(() => {
    const map = {};
    filteredAlerts.forEach(a => {
      const d = a.district || 'Unassigned';
      if (!map[d]) map[d] = { district: d, high: 0, med: 0, low: 0, total: 0 };
      map[d].total += 1;
      if (a.tier === 'high') map[d].high += 1;
      else if (a.tier === 'med') map[d].med += 1;
      else map[d].low += 1;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredAlerts]);

  // Export alerts as CSV
  const exportAlertsCSV = () => {
    const headers = ['Project ID,Work,District,Urgency,Anomaly Driver,ML Outlier,Risk Score\n'];
    const rows = filteredAlerts.map(a =>
      `"${a.projectId || a.id}","${a.work?.replace(/"/g, '""')}","${a.district}","${a.tier}",${a.reasonText},${Boolean(a.mlAnomaly)},${a.risk}`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk_alerts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={26} style={{ color: 'var(--red-main)' }} />
            <span>Risk Intelligence &amp; Anomaly Alerts</span>
          </div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Surveillance audit of ML Isolation Forest outliers, cost overrun flags, and execution delays
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadAlerts} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn" onClick={exportAlertsCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Stat Summary Cards Grid */}
      <div className="grid stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">High Urgency Alerts</div>
            <AlertTriangle size={18} style={{ color: 'var(--red-main)' }} />
          </div>
          <div className="n" style={{ color: 'var(--red-main)' }}>{stats.highCount}</div>
          <div className="sub">Immediate Field Verification Required</div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">ML Outliers Detected</div>
            <Brain size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="n" style={{ color: '#8B5CF6' }}>{stats.mlAnomaliesCount}</div>
          <div className="sub">Isolation Forest Score &lt; 0.0</div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">Medium Risk Alerts</div>
            <Activity size={18} style={{ color: 'var(--amber-main)' }} />
          </div>
          <div className="n" style={{ color: 'var(--amber-main)' }}>{stats.medCount}</div>
          <div className="sub">District Watchlist Monitoring</div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">Low Risk / Routine</div>
            <Layers size={18} style={{ color: 'var(--emerald-main)' }} />
          </div>
          <div className="n" style={{ color: 'var(--emerald-main)' }}>{stats.lowCount}</div>
          <div className="sub">Standard Execution Parameters</div>
        </div>
      </div>

      {/* Visual Analytics Grid: Anomaly Category Breakdown vs District Concentration */}
      <div className="projects-analytics-grid">
        {/* Chart 1: Anomaly Category Distribution */}
        <div className="card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <Brain size={18} style={{ color: 'var(--red-main)' }} />
                <span>Anomaly Type Distribution</span>
              </div>
              <div className="chart-card-sub">Breakdown of primary anomaly triggers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ width: 170, height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anomalyCategoryData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {anomalyCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="custom-recharts-tooltip">
                            <p style={{ color: data.color }}>{data.name}</p>
                            <div>Alerts Count: {data.count}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
              {anomalyCategoryData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: District Risk Concentration */}
        <div className="card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <Layers size={18} style={{ color: 'var(--blue-main)' }} />
                <span>District Alert Concentration</span>
              </div>
              <div className="chart-card-sub">High &amp; Medium urgency flags per district</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtAlertData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="district" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-recharts-tooltip">
                          <p>{d.district}</p>
                          <div style={{ color: '#EF4444' }}>High Urgency: {d.high}</div>
                          <div style={{ color: '#F59E0B' }}>Medium Urgency: {d.med}</div>
                          <div>Total Alerts: {d.total}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="high" name="High Urgency" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="med" name="Medium Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-toolbar-group">
          {/* Urgency Tabs */}
          <div className="tabs" style={{ margin: 0 }}>
            <button className={`tab ${tier === 'all' ? 'active' : ''}`} onClick={() => setTier('all')}>
              All ({allAlerts.length})
            </button>
            <button className={`tab ${tier === 'high' ? 'active' : ''}`} onClick={() => setTier('high')}>
              High Urgency ({allAlerts.filter(a => a.tier === 'high').length})
            </button>
            <button className={`tab ${tier === 'med' ? 'active' : ''}`} onClick={() => setTier('med')}>
              Medium ({allAlerts.filter(a => a.tier === 'med').length})
            </button>
            <button className={`tab ${tier === 'low' ? 'active' : ''}`} onClick={() => setTier('low')}>
              Low ({allAlerts.filter(a => a.tier === 'low').length})
            </button>
          </div>

          {/* Anomaly Type Dropdown Filter */}
          <select className="select-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Anomaly Triggers</option>
            <option value="ml">ML Outliers (Isolation Forest)</option>
            <option value="cost">Cost Overrun</option>
            <option value="delay">Execution Delay</option>
            <option value="duplicate">Possible Duplicate</option>
          </select>
        </div>

        <div className="filter-toolbar-group">

          {/* Sort Dropdown */}
          <select className="select-input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="urgency_desc">Sort: Highest Urgency</option>
            <option value="urgency_asc">Sort: Lowest Urgency</option>
            <option value="work_asc">Sort: Title (A-Z)</option>
          </select>

          {/* View Toggle */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListFilter size={14} />
              <span>Table</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Alert Items View (Table or Cards Grid) */}
      {viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div className="projects-grid-container">
          {filteredAlerts.map(p => {
            const t = toneMap[p.tier];
            return (
              <div
                key={p.alertId || p.id}
                className="project-grid-card"
                onClick={() => navigate(`/projects/${p.projectId || p.id}`)}
                style={{ borderLeft: `4px solid ${p.tier === 'high' ? 'var(--red-main)' : p.tier === 'med' ? 'var(--amber-main)' : 'var(--emerald-main)'}` }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="pill" style={{ background: t.badgeBg, color: t.badgeText }}>{t.label} Urgency</span>
                    {p.mlAnomaly && (
                      <span className="pill high" style={{ fontSize: 10, padding: '2px 7px' }}>
                        <Brain size={11} style={{ marginRight: 3 }} /> ML Anomaly
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                    {p.work}
                  </h3>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                    ID: {p.projectId || p.id} • {p.district}
                  </div>
                </div>

                <div>
                  <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.badgeText, marginBottom: 2 }}>
                      {p.reasonText}
                    </div>
                    {p.riskReasons?.[0] && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{p.riskReasons[0]}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-light)', fontSize: 12 }}>
                    <RiskBadge risk={p.risk} />
                    <span style={{ color: 'var(--blue-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      Inspect Audit <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STRUCTURED TABLE VIEW */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Showing {filteredAlerts.length} Flagged Risk Alerts
            </span>
            {tier !== 'all' || typeFilter !== 'all' || q ? (
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => { setTier('all'); setTypeFilter('all'); setQ(''); }}
              >
              
                Clear Filters
              </button>
            ) : null}
          </div>
temp
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Urgency</th>
                  <th>Flagged Work Title &amp; ID</th>
                  <th>District Location</th>
                  <th>Primary Anomaly Driver</th>
                  <th>ML Status</th>
                  <th>Risk Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      No risk alerts matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map(p => {
                    const t = toneMap[p.tier];
                    return (
                      <tr key={p.alertId || p.id} onClick={() => navigate(`/projects/${p.projectId || p.id}`)}>
                        <td>
                          <span className="pill" style={{ background: t.badgeBg, color: t.badgeText }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.badgeText, display: 'inline-block', marginRight: 4 }}></span>
                            {t.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.work}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.projectId || p.id}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.district}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: t.badgeText }}>{p.reasonText}</div>
                          {p.riskReasons?.[0] && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {p.riskReasons[0]}
                            </div>
                          )}
                        </td>
                        <td>
                          {p.mlAnomaly ? (
                            <span className="pill high" style={{ fontSize: 10, padding: '2px 7px' }}>
                              <i className="fa-solid fa-brain" style={{ marginRight: 4 }}></i> ML Outlier ({p.mlScore !== undefined ? p.mlScore : -0.15})
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Standard Rule Flag</span>
                          )}
                        </td>
                        <td>
                          <RiskBadge risk={p.risk} />
                        </td>
                        <td onClick={e => { e.stopPropagation(); navigate(`/projects/${p.projectId || p.id}`); }}>
                          <span style={{ color: 'var(--blue-main)', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            Inspect Audit <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}