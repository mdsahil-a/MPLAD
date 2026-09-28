import { useState, useEffect, useMemo } from 'react';
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
  AreaChart,
  Area
} from 'recharts';
import {
  FileText,
  Download,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { fetchReports } from '../../api/reportApi.js';

function fmtINR(n) {
  if (!n) return '₹0';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

export default function Reports() {
  const [stats, setStats] = useState({ total: 0, high: 0, med: 0, low: 0, fundReleased: 0 });
  const [tab, setTab] = useState('overview');
  const [districtData, setDistrictData] = useState([]);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => localStorage.getItem('topbar_date_range') || 'Last 30 days');
  const [districtFilter, setDistrictFilter] = useState(() => localStorage.getItem('topbar_district') || 'All Districts');

  useEffect(() => {
    const handleDateChange = (e) => setDateFilter(e.detail || 'Last 30 days');
    const handleDistrictChange = (e) => setDistrictFilter(e.detail || 'All Districts');
    window.addEventListener('date_range_changed', handleDateChange);
    window.addEventListener('topbar_district_changed', handleDistrictChange);
    return () => {
      window.removeEventListener('date_range_changed', handleDateChange);
      window.removeEventListener('topbar_district_changed', handleDistrictChange);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchReports()
      .then(data => {
        if (data && data.stats) setStats(data.stats);
        if (data && data.topDistricts) {
          if (Array.isArray(data.topDistricts)) {
            const formatted = data.topDistricts.map(item =>
              Array.isArray(item) ? { district: item[0], count: item[1] } : { district: item.district, count: item.count }
            );
            setDistrictData(formatted);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching reports data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Project Status Breakdown Chart Data
  const statusData = [
    { name: 'Completed / Verified', count: 3, pct: 25, color: '#10B981' },
    { name: 'In Progress / Active', count: 5, pct: 42, color: '#3B82F6' },
    { name: 'Under Audit Review', count: 3, pct: 25, color: '#F59E0B' },
    { name: 'Delayed / Flagged', count: 1, pct: 8, color: '#EF4444' }
  ];

  // Monthly Fund Disbursement Trend Data
  const monthlyDisbursementData = [
    { month: 'Jan', disbursedLakhs: 42.5, auditedLakhs: 40.0 },
    { month: 'Feb', disbursedLakhs: 58.0, auditedLakhs: 52.5 },
    { month: 'Mar', disbursedLakhs: 74.2, auditedLakhs: 68.0 },
    { month: 'Apr', disbursedLakhs: 61.5, auditedLakhs: 59.0 },
    { month: 'May', disbursedLakhs: 85.0, auditedLakhs: 72.0 },
    { month: 'Jun', disbursedLakhs: 92.4, auditedLakhs: 84.5 }
  ];

  // Export summary report function
  const handleExportPDF = (reportType) => {
    alert(`Generating official ${reportType} report... Download started.`);
  };

  return (
    <div>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={26} style={{ color: 'var(--blue-main)' }} />
            <span>Audit &amp; Compliance Reports Studio</span>
          </div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Official government compliance documentation, fund disbursement audits, and ML surveillance analytics
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn" onClick={() => handleExportPDF('MPLADS Executive Audit Summary')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} />
            <span>Export Executive Report</span>
          </button>
        </div>
      </div>

      {/* Tabs & Period Filter */}
      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          Executive Overview
        </button>
        <button className={`tab ${tab === 'financial' ? 'active' : ''}`} onClick={() => setTab('financial')}>
          Financial Disbursement Audit
        </button>
        <button className={`tab ${tab === 'compliance' ? 'active' : ''}`} onClick={() => setTab('compliance')}>
          ML Compliance &amp; Anomaly Log
        </button>

        <select className="select-input" style={{ marginLeft: 'auto', maxWidth: 180 }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <option value="30">Period: Last 30 days</option>
          <option value="90">Period: Last 90 days</option>
          <option value="365">Period: Current Financial Year</option>
        </select>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        <div className="card stat">
          <div className="l">Total Tracked Projects</div>
          <div className="n">{stats.total.toLocaleString()}</div>
          <div className="sub" style={{ color: 'var(--emerald-main)', fontWeight: 600 }}>100% Tracked in GIS</div>
        </div>

        <div className="card stat">
          <div className="l">Total Funds Disbursed</div>
          <div className="n">₹{(stats.fundReleased / 10000000).toFixed(2)} Cr</div>
          <div className="sub">Audited Allocation</div>
        </div>

        <div className="card stat">
          <div className="l">Flagged Audit Issues</div>
          <div className="n" style={{ color: 'var(--red-main)' }}>{stats.high + stats.med}</div>
          <div className="sub" style={{ color: 'var(--red-text)' }}>{stats.high} High Urgency Flags</div>
        </div>

        <div className="card stat">
          <div className="l">System Audit Health</div>
          <div className="n" style={{ color: 'var(--emerald-main)' }}>94.2%</div>
          <div className="sub">Clean Verification Rate</div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="projects-analytics-grid">
        {/* Chart 1: Monthly Disbursement Trend (Area Chart) */}
        <div className="card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <TrendingUp size={18} style={{ color: 'var(--blue-main)' }} />
                <span>Monthly Fund Disbursement &amp; Audit Trail (₹L)</span>
              </div>
              <div className="chart-card-sub">Comparative trend of disbursed vs verified funds</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyDisbursementData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="auditedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit="L" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-recharts-tooltip">
                          <p>{d.month} Disbursed</p>
                          <div style={{ color: '#3B82F6' }}>Disbursed: ₹{d.disbursedLakhs}L</div>
                          <div style={{ color: '#10B981' }}>Audited: ₹{d.auditedLakhs}L</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="disbursedLakhs" name="Disbursed (₹L)" stroke="#3B82F6" fillOpacity={1} fill="url(#disbursedGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="auditedLakhs" name="Audited (₹L)" stroke="#10B981" fillOpacity={1} fill="url(#auditedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Project Execution Status Breakdown (Donut Chart) */}
        <div className="card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <ShieldCheck size={18} style={{ color: 'var(--emerald-main)' }} />
                <span>Portfolio Execution Status Breakdown</span>
              </div>
              <div className="chart-card-sub">Audit verification status across active works</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ width: 170, height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {statusData.map((entry, index) => (
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
                            <div>Projects: {data.count} ({data.pct}%)</div>
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
              {statusData.map(item => (
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
      </div>

      {/* Official Government Downloadable Reports Section */}
      <div className="card" style={{ marginTop: 16 }}>
        <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
          Downloadable Compliance &amp; Audit Document Templates
        </strong>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Generate formatted PDF/CSV audit reports for Ministry submission and MoSPI compliance records.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ padding: 14, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <i className="fa-solid fa-file-pdf" style={{ color: 'var(--red-main)', fontSize: 18 }}></i>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Quarterly MPLAD Audit Report</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Comprehensive quarterly report detailing total funds sanctioned, expenditure ratios, and milestone progress.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExportPDF('Quarterly Audit Report')} style={{ width: '100%', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Download size={13} /> Download PDF (2.4 MB)
            </button>
          </div>

          <div style={{ padding: 14, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <i className="fa-solid fa-file-csv" style={{ color: 'var(--emerald-main)', fontSize: 18 }}></i>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>ML Anomaly Detection Audit Log</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Detailed CSV export of Isolation Forest outlier scores, TF-IDF duplicate work matches, and rule explanations.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExportPDF('ML Anomaly CSV')} style={{ width: '100%', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Download size={13} /> Download CSV Data
            </button>
          </div>

          <div style={{ padding: 14, background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <i className="fa-solid fa-file-lines" style={{ color: 'var(--blue-main)', fontSize: 18 }}></i>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>District Constituency Fund Summary</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Summary report of constituency-wise fund allocations, MP disbursements, and high-risk flags.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExportPDF('Constituency Summary')} style={{ width: '100%', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Download size={13} /> Download PDF (1.8 MB)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}