import React from 'react'
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Download,
  ShieldAlert
} from 'lucide-react';
import RiskBadge from '../../components/RiskBadge/RiskBadge.jsx';
import { fetchProjectById } from '../../api/projectApi.js';
import { tierOf } from '../../utils/risk.js';

function fmtINR(n) {
  if (!n) return '₹0';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProjectById(id)
      .then(data => {
        if (data && data.id) {
          setProject(data);
        }
      })
      .catch(err => {
        console.error('Error fetching project detail:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const p = project;

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner spin" style={{ fontSize: 24, marginBottom: 12 }}></i>
        <div>Loading project audit details...</div>
      </div>
    );
  }

  if (!p) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Project Not Found</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>The requested project ID "{id}" could not be located in database records.</p>
        <Link to="/projects" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Projects List
        </Link>
      </div>
    );
  }

  const t = tierOf(p.risk || 0);
  const spentPercent = p.sanctioned ? Math.round(((p.spent || 0) / p.sanctioned) * 100) : 0;

  // Signal metrics for charts
  const signalsData = [
    { name: 'Financial', score: p.finSignal || 0, color: '#EF4444' },
    { name: 'Delay/Exec', score: p.netSignal || 0, color: '#F59E0B' },
    { name: 'Duplicate', score: p.dupSignal || 0, color: '#3B82F6' },
    { name: 'Geo-Photo', score: p.photoSignal || 0, color: '#8B5CF6' }
  ];

  // Financial chart data (in ₹ Lakhs)
  const financialData = [
    { name: 'Estimated', amount: parseFloat(((p.estimatedCost || p.sanctioned || 0) / 100000).toFixed(1)), color: '#3B82F6' },
    { name: 'Sanctioned', amount: parseFloat(((p.sanctioned || 0) / 100000).toFixed(1)), color: '#6366F1' },
    { name: 'Actual Spent', amount: parseFloat(((p.spent || p.actualCost || 0) / 100000).toFixed(1)), color: p.spent > p.sanctioned ? '#EF4444' : '#10B981' }
  ];

  const recommend = t === 'high'
    ? 'Recommend immediate field audit, site geotag re-verification, and payment hold on remaining tranches.'
    : t === 'med'
    ? 'Recommend adding to district high-surveillance watchlist; re-verify progress at next disbursement.'
    : 'All indicators within normal operational parameters. Continue routine monitoring.';

  return (
    <div>
      {/* Header & Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <Link to="/projects" style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 500 }}>
            <ArrowLeft size={14} /> Back to Projects List
          </Link>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{p.work}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--blue-main)' }}>{p.id}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={13} /> {p.mp}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {p.district}</span>
            <span>•</span>
            <span className="project-category-pill">{p.category || 'Infrastructure'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiskBadge risk={p.risk} />
          <span className={`pill ${p.status === 'Completed' ? 'low' : p.status === 'Delayed' || p.status === 'Under Review' ? 'high' : 'med'}`}>
            {p.status || 'Active'}
          </span>
        </div>
      </div>

      {/* Metric Stat Summary Cards */}
      <div className="grid stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 16 }}>
        <div className="card stat">
          <div className="l">Sanctioned Amount</div>
          <div className="n">{fmtINR(p.sanctioned)}</div>
          <div className="sub">Allocated Budget</div>
        </div>

        <div className="card stat">
          <div className="l">Spent Amount</div>
          <div className="n" style={{ color: p.spent > p.sanctioned ? 'var(--red-main)' : 'var(--text-primary)' }}>{fmtINR(p.spent)}</div>
          <div className="sub">{spentPercent}% Utilization</div>
        </div>

        <div className="card stat">
          <div className="l">Physical Completion</div>
          <div className="n" style={{ color: 'var(--blue-main)' }}>{p.progress}%</div>
          <div className="sub">
            <div className="progress-track" style={{ margin: '4px 0 0 0' }}>
              <div className="progress-fill" style={{ width: `${p.progress}%`, background: 'var(--blue-main)' }}></div>
            </div>
          </div>
        </div>

        <div className="card stat">
          <div className="l">Composite Risk Score</div>
          <div className="n" style={{ color: t === 'high' ? 'var(--red-main)' : t === 'med' ? 'var(--amber-main)' : 'var(--emerald-main)' }}>
            {p.risk}/100
          </div>
          <div className="sub">Tier: {t.toUpperCase()}</div>
        </div>
      </div>

      {/* Machine Learning (Isolation Forest) Anomaly Insights Box */}
      <div className="card" style={{ marginBottom: 16, borderLeft: p.mlAnomaly ? '4px solid var(--red-main)' : '4px solid var(--emerald-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <strong style={{ fontSize: 14.5, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} style={{ color: p.mlAnomaly ? 'var(--red-main)' : 'var(--emerald-main)' }} />
            Machine Learning (Isolation Forest) Anomaly Analysis
          </strong>
          <span className={`pill ${p.mlAnomaly ? 'high' : 'low'}`}>
            {p.mlAnomaly ? 'ML Anomaly Flagged' : 'Normal Pattern'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Isolation Forest Decision Score</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: p.mlAnomaly ? 'var(--red-main)' : 'var(--emerald-main)', marginTop: 2 }}>
              {p.mlScore !== undefined ? p.mlScore : -0.15}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              {p.mlAnomaly ? 'Outlier / Anomaly (< 0.0)' : 'Normal Data Cluster'}
            </div>
          </div>

          <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TF-IDF Work Similarity</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: p.possibleDuplicate ? 'var(--amber-text)' : 'var(--text-primary)', marginTop: 2 }}>
              {p.similarity !== undefined ? `${Math.round(p.similarity * 100)}%` : '75%'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              {p.possibleDuplicate ? 'Potential Duplicate Flagged' : 'Unique Project Work'}
            </div>
          </div>

          <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Execution Delay Days</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: p.delayDays > 60 ? 'var(--red-main)' : 'var(--text-primary)', marginTop: 2 }}>
              {p.delayDays || 0} Days
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              {p.delayDays > 60 ? 'Behind Schedule' : 'On Schedule'}
            </div>
          </div>
        </div>

        {p.riskReasons && p.riskReasons.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} style={{ color: 'var(--red-main)' }} />
              AI Flagged Explanations &amp; Anomaly Drivers:
            </div>
            <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {p.riskReasons.map((reason, idx) => (
                <li key={idx} style={{ color: p.mlAnomaly ? 'var(--red-text)' : 'var(--text-primary)' }}>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Visual Charts Grid: Signal Radar vs Financial Breakdown */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Chart A: Anomaly Signal Breakdown */}
        <div className="card">
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Risk Signal Intensity (0 - 100)
          </strong>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
            Breakdown of key anomaly signals triggering project flag
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signalsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-recharts-tooltip">
                          <p>{d.name} Signal</p>
                          <div style={{ color: d.color }}>Score: {d.score}/100</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" name="Signal Score" radius={[4, 4, 0, 0]} barSize={32}>
                  {signalsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Budget vs Expenditure Comparison */}
        <div className="card">
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Budget vs Actual Spent (₹ Lakhs)
          </strong>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
            Comparison of estimated cost, sanctioned funds, and actual expenditure
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit="L" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-recharts-tooltip">
                          <p>{d.name}</p>
                          <div style={{ color: d.color }}>Amount: ₹{d.amount} Lakhs</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" name="Amount (₹L)" radius={[4, 4, 0, 0]} barSize={38}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Overview, Timeline & Attached Documents */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {/* Audit Timeline */}
        <div className="card">
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={16} style={{ color: 'var(--blue-main)' }} />
            Project Audit &amp; Milestone Timeline
          </strong>

          {p.timeline && p.timeline.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 8 }}>
              {p.timeline.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-main)', marginTop: 5, flexShrink: 0 }}></div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.event}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Project sanctioned and work order issued. Initial milestone verification pending.</div>
          )}

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-light)', background: 'var(--surface-subtle)', padding: 12, borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>System Audit Recommendation:</strong>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{recommend}</p>
          </div>
        </div>

        {/* Official Attachments & Documents */}
        <div className="card">
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FileText size={16} style={{ color: 'var(--blue-main)' }} />
            Attached Sanction Documents &amp; Reports
          </strong>

          {p.documents && p.documents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {p.documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="fa-solid fa-file-pdf" style={{ color: 'var(--red-main)', fontSize: 18 }}></i>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.size || '1.2 MB'} • Verified Document</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No digital sanction letters attached.</div>
          )}

          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>Description:</strong> {p.description || 'Sanctioned MPLADS work for public infrastructure development.'}
          </div>
        </div>
      </div>
    </div>
  );
}