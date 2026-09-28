import React from 'react'
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
  CartesianGrid,
  ComposedChart,
  Line
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Layers,
  Search,
  LayoutGrid,
  ListFilter,
  ArrowUpDown,
  ChevronRight,
  Download,
  RefreshCw,
  Building2,
  Activity
} from 'lucide-react';
import RiskBadge from '../../components/RiskBadge/RiskBadge.jsx';
import { fetchProjects } from '../../api/projectApi.js';
import { tierOf } from '../../utils/risk.js';

// Helper function to format INR currency neatly (Lakhs & Crores)
function fmtINR(n) {
  if (!n) return '₹0';
  if (n >= 10000000) {
    return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  }
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

// Format currency for chart tooltips (in Lakhs)
function fmtLakhs(n) {
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

export default function Projects() {
  const navigate = useNavigate();
  const [tier, setTier] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_desc');
  const [q, setQ] = useState('');
  const [viewMode, setViewMode] = useState('analytics'); // 'analytics', 'table', 'grid'
  
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all projects initially
  const loadData = () => {
    setLoading(true);
    fetchProjects({ tier: 'all' })
      .then(data => {
        if (Array.isArray(data)) {
          setAllProjects(data);
        }
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    const handleTopbarDistrict = (e) => {
      const selected = e.detail;
      if (selected === 'All Districts') {
        setDistrictFilter('all');
      } else {
        setDistrictFilter(selected);
      }
    };

    window.addEventListener('topbar_district_changed', handleTopbarDistrict);
    return () => window.removeEventListener('topbar_district_changed', handleTopbarDistrict);
  }, []);

  // Filter options derived from actual dataset
  const categories = useMemo(() => {
    const set = new Set();
    allProjects.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [allProjects]);

  const districts = useMemo(() => {
    const set = new Set();
    allProjects.forEach(p => { if (p.district) set.add(p.district); });
    return Array.from(set);
  }, [allProjects]);

  // Filtered and Sorted Projects List
  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      // Risk Tier filter
      const pTier = tierOf(p.risk);
      if (tier !== 'all' && pTier !== tier) return false;

      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      // District filter
      if (districtFilter !== 'all' && p.district !== districtFilter) return false;

      // Search query
      if (q) {
        const query = q.toLowerCase();
        const matchWork = p.work?.toLowerCase().includes(query);
        const matchMp = p.mp?.toLowerCase().includes(query);
        const matchId = p.id?.toLowerCase().includes(query);
        const matchDist = p.district?.toLowerCase().includes(query);
        const matchCat = p.category?.toLowerCase().includes(query);
        if (!matchWork && !matchMp && !matchId && !matchDist && !matchCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'risk_desc') return (b.risk || 0) - (a.risk || 0);
      if (sortBy === 'risk_asc') return (a.risk || 0) - (b.risk || 0);
      if (sortBy === 'sanctioned_desc') return (b.sanctioned || 0) - (a.sanctioned || 0);
      if (sortBy === 'progress_asc') return (a.progress || 0) - (b.progress || 0);
      if (sortBy === 'work_asc') return (a.work || '').localeCompare(b.work || '');
      return 0;
    });
  }, [allProjects, tier, categoryFilter, districtFilter, q, sortBy]);

  // Global Executive Summary Metrics (Computed across active dataset)
  const stats = useMemo(() => {
    const dataset = filteredProjects;
    const totalCount = dataset.length;
    const totalSanctioned = dataset.reduce((acc, p) => acc + (p.sanctioned || 0), 0);
    const totalSpent = dataset.reduce((acc, p) => acc + (p.spent || 0), 0);
    const utilizationRate = totalSanctioned > 0 ? ((totalSpent / totalSanctioned) * 100).toFixed(1) : 0;

    const highRiskProjects = dataset.filter(p => tierOf(p.risk) === 'high');
    const medRiskProjects = dataset.filter(p => tierOf(p.risk) === 'med');
    const lowRiskProjects = dataset.filter(p => tierOf(p.risk) === 'low');

    const highRiskCapital = highRiskProjects.reduce((acc, p) => acc + (p.sanctioned || 0), 0);
    const avgProgress = totalCount > 0 ? (dataset.reduce((acc, p) => acc + (p.progress || 0), 0) / totalCount).toFixed(1) : 0;

    return {
      totalCount,
      totalSanctioned,
      totalSpent,
      utilizationRate,
      highRiskCount: highRiskProjects.length,
      medRiskCount: medRiskProjects.length,
      lowRiskCount: lowRiskProjects.length,
      highRiskCapital,
      avgProgress
    };
  }, [filteredProjects]);

  // Chart 1 Data: Risk Exposure & Capital Allocation (Donut Chart)
  const riskChartData = useMemo(() => {
    let highVal = 0, medVal = 0, lowVal = 0;
    let highCap = 0, medCap = 0, lowCap = 0;

    filteredProjects.forEach(p => {
      const t = tierOf(p.risk);
      if (t === 'high') { highVal++; highCap += (p.sanctioned || 0); }
      else if (t === 'med') { medVal++; medCap += (p.sanctioned || 0); }
      else { lowVal++; lowCap += (p.sanctioned || 0); }
    });

    return [
      { name: 'High Risk', count: highVal, capital: highCap, color: '#EF4444' },
      { name: 'Medium Risk', count: medVal, capital: medCap, color: '#F59E0B' },
      { name: 'Low Risk', count: lowVal, capital: lowCap, color: '#10B981' }
    ];
  }, [filteredProjects]);

  // Chart 2 Data: Sanctioned vs Spent by Sector / Category (Bar Chart)
  const categoryChartData = useMemo(() => {
    const map = {};
    filteredProjects.forEach(p => {
      const cat = p.category || 'General';
      if (!map[cat]) {
        map[cat] = { category: cat, sanctioned: 0, spent: 0, count: 0 };
      }
      map[cat].sanctioned += (p.sanctioned || 0);
      map[cat].spent += (p.spent || 0);
      map[cat].count += 1;
    });

    return Object.values(map).map(item => ({
      category: item.category.length > 18 ? item.category.substring(0, 16) + '...' : item.category,
      fullCategory: item.category,
      sanctionedLakhs: parseFloat((item.sanctioned / 100000).toFixed(1)),
      spentLakhs: parseFloat((item.spent / 100000).toFixed(1)),
      count: item.count
    })).sort((a, b) => b.sanctionedLakhs - a.sanctionedLakhs);
  }, [filteredProjects]);

  // Chart 3 Data: Anomaly Risk Score vs Physical Completion % Correlation Matrix
  const correlationChartData = useMemo(() => {
    return filteredProjects.slice(0, 10).map(p => ({
      name: p.id,
      workTitle: p.work,
      riskScore: p.risk || 0,
      progress: p.progress || 0,
      sanctioned: parseFloat(((p.sanctioned || 0) / 100000).toFixed(1))
    }));
  }, [filteredProjects]);

  // Chart 4 Data: District Capital Allocation Breakdown
  const districtChartData = useMemo(() => {
    const map = {};
    filteredProjects.forEach(p => {
      const d = p.district || 'Other';
      if (!map[d]) {
        map[d] = { district: d, capital: 0, highRiskCount: 0, count: 0 };
      }
      map[d].capital += (p.sanctioned || 0);
      map[d].count += 1;
      if (tierOf(p.risk) === 'high') map[d].highRiskCount += 1;
    });

    return Object.values(map).map(item => ({
      district: item.district,
      capitalCr: parseFloat((item.capital / 10000000).toFixed(2)),
      count: item.count,
      highRiskCount: item.highRiskCount
    })).sort((a, b) => b.capitalCr - a.capitalCr);
  }, [filteredProjects]);

  // Export dataset as CSV file
  const exportCSV = () => {
    const headers = ['ID,Work,MP,District,Category,Sanctioned,Spent,Progress,Risk,Status\n'];
    const rows = filteredProjects.map(p => 
      `"${p.id}","${p.work?.replace(/"/g, '""')}","${p.mp}","${p.district}","${p.category || ''}",${p.sanctioned},${p.spent},${p.progress},${p.risk},"${p.status || ''}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mplads_projects_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 style={{ color: 'var(--blue-main)' }} size={26} />
            <span>Projects Analytics & Portfolio</span>
          </div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Sanctioned MPLADS works, financial utilization, anomaly risk distribution, and progress metrics
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadData} title="Refresh Data" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Summary Cards */}
      <div className="grid stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">Total Sanctioned Capital</div>
            <DollarSign size={18} style={{ color: 'var(--blue-main)' }} />
          </div>
          <div className="n" style={{ color: 'var(--text-primary)' }}>{fmtINR(stats.totalSanctioned)}</div>
          <div className="sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{stats.totalCount} Sanctioned Works</span>
            <span style={{ color: 'var(--emerald-main)', fontWeight: 600 }}>Active</span>
          </div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">Fund Utilization</div>
            <TrendingUp size={18} style={{ color: 'var(--emerald-main)' }} />
          </div>
          <div className="n">{fmtINR(stats.totalSpent)}</div>
          <div className="sub">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Spent vs Sanctioned</span>
              <span style={{ fontWeight: 700, color: 'var(--emerald-main)' }}>{stats.utilizationRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(stats.utilizationRate, 100)}%`, background: 'var(--emerald-main)' }}></div>
            </div>
          </div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">High Risk Capital</div>
            <AlertTriangle size={18} style={{ color: 'var(--red-main)' }} />
          </div>
          <div className="n" style={{ color: 'var(--red-main)' }}>{fmtINR(stats.highRiskCapital)}</div>
          <div className="sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="pill high">{stats.highRiskCount} High-Risk Projects</span>
            <span style={{ color: 'var(--text-muted)' }}>Flagged</span>
          </div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="l">Avg Physical Completion</div>
            <CheckCircle2 size={18} style={{ color: 'var(--blue-main)' }} />
          </div>
          <div className="n">{stats.avgProgress}%</div>
          <div className="sub">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Portfolio Execution</span>
              <span>{stats.avgProgress}% Complete</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${stats.avgProgress}%`, background: 'var(--blue-main)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations Section (Charts Grid) */}
      {(viewMode === 'analytics' || viewMode === 'grid') && (
        <div className="projects-analytics-grid">
          {/* Chart 1: Capital & Risk Allocation Donut Chart */}
          <div className="card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">
                  <PieChartIcon size={18} style={{ color: 'var(--blue-main)' }} />
                  <span>Risk Exposure & Capital Distribution</span>
                </div>
                <div className="chart-card-sub">Fund allocation grouped by AI Anomaly Risk Tier</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ width: 180, height: 180, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      dataKey="capital"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {riskChartData.map((entry, index) => (
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
                              <div>Projects: {data.count}</div>
                              <div>Sanctioned: {fmtINR(data.capital)}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
                {riskChartData.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{fmtINR(item.capital)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.count} projects</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Sanctioned vs Spent Funds by Sector (Bar Chart) */}
          <div className="card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">
                  <BarChart3 size={18} style={{ color: 'var(--emerald-main)' }} />
                  <span>Sanctioned vs Spent by Sector (₹ Lakhs)</span>
                </div>
                <div className="chart-card-sub">Comparison of allocated budget vs actual expenditure per sector</div>
              </div>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="var(--text-muted)" fontSize={11} unit="L" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="custom-recharts-tooltip">
                            <p>{d.fullCategory}</p>
                            <div style={{ color: '#3B82F6' }}>Sanctioned: ₹{d.sanctionedLakhs}L</div>
                            <div style={{ color: '#10B981' }}>Spent: ₹{d.spentLakhs}L</div>
                            <div style={{ color: '#94A3B8' }}>Projects: {d.count}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="sanctionedLakhs" name="Sanctioned (₹L)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spentLakhs" name="Spent (₹L)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Anomaly Risk vs Physical Completion Matrix */}
          <div className="card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">
                  <Activity size={18} style={{ color: 'var(--amber-main)' }} />
                  <span>Risk Score vs Progress % Matrix</span>
                </div>
                <div className="chart-card-sub">Projects with high risk but low completion highlight potential bottlenecks</div>
              </div>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={correlationChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="custom-recharts-tooltip">
                            <p>{d.name} - {d.workTitle}</p>
                            <div style={{ color: '#EF4444' }}>Risk Score: {d.riskScore}</div>
                            <div style={{ color: '#3B82F6' }}>Physical Progress: {d.progress}%</div>
                            <div style={{ color: '#F59E0B' }}>Sanctioned: ₹{d.sanctioned}L</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="riskScore" name="Risk Score (0-100)" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={22} />
                  <Line type="monotone" dataKey="progress" name="Progress %" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: District Allocation Breakdown */}
          <div className="card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">
                  <Layers size={18} style={{ color: '#8B5CF6' }} />
                  <span>District Capital & Risk Allocation</span>
                </div>
                <div className="chart-card-sub">Total funds sanctioned per constituency district</div>
              </div>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} unit=" Cr" />
                  <YAxis type="category" dataKey="district" stroke="var(--text-muted)" fontSize={11} width={100} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="custom-recharts-tooltip">
                            <p>{d.district}</p>
                            <div style={{ color: '#8B5CF6' }}>Capital Allocated: ₹{d.capitalCr} Cr</div>
                            <div>Total Works: {d.count}</div>
                            <div style={{ color: '#EF4444' }}>High Risk Works: {d.highRiskCount}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="capitalCr" name="Sanctioned (₹ Cr)" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Control Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-toolbar-group">
          {/* Risk Tier Tabs */}
          <div className="tabs" style={{ margin: 0 }}>
            {['all', 'high', 'med', 'low'].map(t => (
              <button key={t} className={`tab ${tier === t ? 'active' : ''}`} onClick={() => setTier(t)}>
                {t === 'all' ? 'All Risk' : t === 'high' ? 'High Risk' : t === 'med' ? 'Med Risk' : 'Low Risk'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select className="select-input" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Sectors ({categories.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* District Filter */}
          <select className="select-input" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
            <option value="all">All Districts ({districts.length})</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="filter-toolbar-group">
          {/* Search Box */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 30 }}
              placeholder="Search MP, Work, ID..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
            <select className="select-input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="risk_desc">Sort: Highest Risk</option>
              <option value="risk_asc">Sort: Lowest Risk</option>
              <option value="sanctioned_desc">Sort: Highest Sanctioned</option>
              <option value="progress_asc">Sort: Lowest Progress</option>
              <option value="work_asc">Sort: Title (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setViewMode('analytics')}
              title="Analytics & Table"
            >
              <BarChart3 size={14} />
              <span>Full</span>
            </button>
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

      {/* Main Content Display: Table or Card Grid */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="projects-grid-container">
          {filteredProjects.map(p => {
            const spentPercent = p.sanctioned ? Math.round(((p.spent || 0) / p.sanctioned) * 100) : 0;
            return (
              <div key={p.id} className="project-grid-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="project-category-pill">{p.category || 'General'}</span>
                    <RiskBadge risk={p.risk} />
                  </div>

                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                    {p.work}
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    ID: {p.id} • {p.mp} ({p.district})
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sanctioned / Spent:</span>
                    <span style={{ fontWeight: 700 }}>{fmtINR(p.sanctioned)} ({spentPercent}%)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Physical Completion:</span>
                    <span style={{ fontWeight: 700, color: 'var(--blue-main)' }}>{p.progress}%</span>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.progress > 75 ? 'var(--emerald-main)' : p.progress > 40 ? 'var(--blue-main)' : 'var(--amber-main)' }}></div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-light)', fontSize: 12 }}>
                    <span style={{ fontSize: 11, color: p.status === 'Delayed' || p.status === 'Under Review' ? 'var(--red-text)' : 'var(--text-secondary)' }}>
                      Status: {p.status || 'Active'}
                    </span>
                    <span style={{ color: 'var(--blue-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      Details <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Showing {filteredProjects.length} of {allProjects.length} Sanctioned Works
            </span>
            {tier !== 'all' || categoryFilter !== 'all' || districtFilter !== 'all' || q ? (
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => { setTier('all'); setCategoryFilter('all'); setDistrictFilter('all'); setQ(''); }}
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Work Title & Category</th>
                  <th>MP & District</th>
                  <th>Sanctioned / Spent</th>
                  <th>Physical Progress</th>
                  <th>Risk Score & Tier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      No projects matched your selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(p => {
                    const spentPercent = p.sanctioned ? Math.round(((p.spent || 0) / p.sanctioned) * 100) : 0;
                    return (
                      <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.work}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.id}</span>
                            <span className="project-category-pill">{p.category || 'General'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.mp}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.district}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{fmtINR(p.sanctioned)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Spent: {fmtINR(p.spent)} ({spentPercent}%)
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140 }}>
                            <span style={{ fontWeight: 600, fontSize: 12, minWidth: 32 }}>{p.progress}%</span>
                            <div className="progress-track" style={{ margin: 0, flex: 1 }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${p.progress}%`,
                                  background: p.progress >= 80 ? 'var(--emerald-main)' : p.progress >= 40 ? 'var(--blue-main)' : 'var(--amber-main)'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <RiskBadge risk={p.risk} />
                        </td>
                        <td>
                          <span className={`pill ${p.status === 'Completed' ? 'low' : p.status === 'Delayed' || p.status === 'Under Review' ? 'high' : 'med'}`}>
                            {p.status || 'Active'}
                          </span>
                        </td>
                        <td onClick={e => { e.stopPropagation(); navigate(`/projects/${p.id}`); }}>
                          <span style={{ color: 'var(--blue-main)', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            View <ChevronRight size={14} />
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
