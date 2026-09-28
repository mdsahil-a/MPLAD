import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../../api/dashboardApi.js';
import { fetchMapData } from '../../api/mapApi.js';
import RiskBadge from '../../components/RiskBadge/RiskBadge.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function fmtINR(n) { return '₹' + ((n || 0) / 10000000).toFixed(2) + ' Cr'; }

export default function Dashboard() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  const [stats, setStats] = useState({ total: 0, high: 0, med: 0, low: 0, fundReleased: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
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

  // Fetch Dashboard Stats and GIS Map Data concurrently
  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchMapData()])
      .then(([dashRes, mapRes]) => {
        if (dashRes && dashRes.stats) setStats(dashRes.stats);
        if (dashRes && dashRes.recentAlerts) setRecentAlerts(dashRes.recentAlerts);

        if (mapRes && mapRes.zones) {
          setMapData(mapRes);
          setSelectedZone(mapRes.zones[0]);
        }
      })
      .catch(err => {
        console.error('Dashboard data fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Initialize embedded Leaflet GIS Map in the right column
  useEffect(() => {
    if (!mapData || !mapRef.current) return;

    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    // Initialize Leaflet map centered on Madhya Pradesh, India
    const map = L.map(mapRef.current, {
      center: [23.5, 77.8],
      zoom: 7,
      zoomControl: true,
      attributionControl: false
    });

    leafletInstance.current = map;

    // Standard OpenStreetMap tile provider
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const { zones, connections } = mapData;
    const zoneCoordMap = {};

    zones.forEach(z => {
      if (!z.lat || !z.lng) return;
      zoneCoordMap[z.id] = [z.lat, z.lng];

      const badgeColor = z.riskTier === 'high' ? '#EF4444' : z.riskTier === 'med' ? '#F59E0B' : '#10B981';
      const badgeBg = z.riskTier === 'high' ? '#FEE2E2' : z.riskTier === 'med' ? '#FEF3C7' : '#D1FAE5';
      const badgeText = z.riskTier === 'high' ? '#B91C1C' : z.riskTier === 'med' ? '#B45309' : '#047857';

      const customIcon = L.divIcon({
        className: 'custom-dashboard-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 999px;
            background: ${badgeBg};
            border: 1px solid ${badgeColor};
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
            color: ${badgeText};
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${badgeColor}; display: inline-block;"></span>
            <span>${z.name}</span>
            <span style="opacity: 0.85;">(${z.riskScore})</span>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 14]
      });

      const marker = L.marker([z.lat, z.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; padding: 2px;">
          <strong style="font-size: 12.5px; display: block; margin-bottom: 2px; color: #0F172A;">${z.name}</strong>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 3px;">${z.constituency}</div>
          <div style="font-size: 11px;"><b>Sanctioned:</b> ₹${(z.totalSanctioned / 100000).toFixed(1)}L</div>
          <div style="font-size: 11px; color: ${z.flaggedAnomalies > 0 ? '#DC2626' : '#059669'}; marginTop: 2px;">
            <b>Anomalies:</b> ${z.flaggedAnomalies} Flagged
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => setSelectedZone(z));
    });

    // Draw connecting lines between HQ and zones
    connections.forEach(c => {
      const p1 = zoneCoordMap[c.from];
      const p2 = zoneCoordMap[c.to];
      if (!p1 || !p2) return;

      const strokeColor = c.risk === 'high' ? '#EF4444' : c.risk === 'med' ? '#F59E0B' : '#10B981';
      L.polyline([p1, p2], {
        color: strokeColor,
        weight: c.risk === 'high' ? 2 : 1.5,
        dashArray: c.risk === 'high' ? null : '4, 4',
        opacity: 0.7
      }).addTo(map);
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [mapData]);

  // Donut chart math
  const r = 38, c = 2 * Math.PI * r;
  const totalVal = stats.total || 1;
  const highPct = stats.high / totalVal;
  const medPct = stats.med / totalVal;
  const lowPct = stats.low / totalVal;
  const highLen = c * highPct;
  const medLen = c * medPct;
  const lowLen = c * lowPct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1600, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Real-time MPLADS anomaly surveillance, risk distribution &amp; GIS geospatial radar
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: 999,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            fontSize: 11.5,
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            📅 {dateFilter} {districtFilter !== 'All Districts' ? `• 📍 ${districtFilter}` : ''}
          </div>
          <div style={{
            padding: '4px 12px',
            borderRadius: 999,
            background: 'var(--emerald-bg)',
            border: '1px solid var(--emerald-border)',
            fontSize: 11.5,
            color: 'var(--emerald-text)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald-main)' }}></span>
            System Operational
          </div>
        </div>
      </div>

      <div className="grid stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 0 }}>
        <StatCard
          label="Total Sanctioned"
          value={stats.total.toLocaleString()}
          tone="low"
          change="+3%"
          sub="vs previous 30 days"
        />

        <StatCard
          label="Flagged Projects"
          value={(stats.high + stats.med).toLocaleString()}
          tone="high"
          change="Review"
          sub={`${stats.high} High · ${stats.med} Medium`}
        />

        <StatCard
          label="High Risk Hotspots"
          value={stats.high.toLocaleString()}
          tone="high"
          change="Audit"
          sub="Priority field audit required"
        />

        <StatCard
          label="Total Outlay Fund"
          value={fmtINR(stats.fundReleased)}
          tone="low"
          change="100%"
          sub="Fully tracked in surveillance"
        />
      </div>

      {/* Main Grid: Left Analytics Cards (Donut & Alerts) | Right GIS Map Widget */}
      <div className="grid" style={{ gridTemplateColumns: '380px 1fr', gap: 14, alignItems: 'stretch' }}>
        
        {/* Left Column: Donut Risk Chart + Priority Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Risk Distribution Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>Risk Distribution Breakdown</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 14, justifyContent: 'center' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="12" />
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--red-main)" strokeWidth="12"
                  strokeDasharray={`${highLen} ${c - highLen}`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--amber-main)" strokeWidth="12"
                  strokeDasharray={`${medLen} ${c - medLen}`} strokeDashoffset={-highLen} transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--emerald-main)" strokeWidth="12"
                  strokeDasharray={`${lowLen} ${c - lowLen}`} strokeDashoffset={-(highLen + medLen)} transform="rotate(-90 50 50)" />
              </svg>
              <div className="donut-legend">
                <span><i className="dot" style={{ background: 'var(--red-main)' }}></i>High Risk ({stats.high})</span>
                <span><i className="dot" style={{ background: 'var(--amber-main)' }}></i>Medium Risk ({stats.med})</span>
                <span><i className="dot" style={{ background: 'var(--emerald-main)' }}></i>Low Risk ({stats.low})</span>
              </div>
            </div>
          </div>

          {/* Priority Alerts Card */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>Priority Flagged Alerts</strong>
                <Link to="/alerts" style={{ fontSize: 12, color: 'var(--blue-main)', fontWeight: 600 }}>View all →</Link>
              </div>

              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentAlerts.slice(0, 3).map(p => {
                  const tone = p.risk >= 65 ? { c: 'var(--red-text)', bg: 'var(--red-bg)', border: 'var(--red-border)', l: 'High' }
                    : p.risk >= 35 ? { c: 'var(--amber-text)', bg: 'var(--amber-bg)', border: 'var(--amber-border)', l: 'Medium' }
                    : { c: 'var(--green-text)', bg: 'var(--green-bg)', border: 'var(--green-border)', l: 'Low' };

                  return (
                    <div
                      className="alert-row"
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: tone.c, fontSize: 13 }}><i className="fa-solid fa-triangle-exclamation"></i></span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{p.work}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.id} · {p.district}</div>
                        </div>
                      </div>
                      <span className="pill" style={{ background: tone.bg, color: tone.c, borderColor: tone.border }}>{tone.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Embedded Leaflet GIS Zone Risk Map Container */}
        <div className="card" style={{ position: 'relative', height: 440, padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          
          {/* Map Header Overlay */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>GIS Zone Risk Radar</span>
            <span className="pill low" style={{ fontSize: 10, padding: '1px 6px' }}>OpenStreetMap GIS</span>
          </div>

          {/* Leaflet Map Div Container */}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating Selected Zone Inspector Modal Overlay */}
          {selectedZone && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              width: 290,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              zIndex: 1000,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedZone.name}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--red-main)', marginRight: 4 }}></i>
                    {selectedZone.lat ? `${selectedZone.lat}, ${selectedZone.lng}` : selectedZone.constituency}
                  </div>
                </div>
                <RiskBadge risk={selectedZone.riskScore} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '8px 0', fontSize: 11 }}>
                <div style={{ background: 'var(--surface-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Sanctioned</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>{fmtINR(selectedZone.totalSanctioned)}</div>
                </div>
                <div style={{ background: 'var(--surface-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Anomalies</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedZone.flaggedAnomalies > 0 ? 'var(--red-text)' : 'var(--emerald-text)', marginTop: 1 }}>
                    {selectedZone.flaggedAnomalies} Flagged
                  </div>
                </div>
              </div>

              <button
                className="btn"
                style={{ width: '100%', fontSize: 12, padding: '7px 12px' }}
                onClick={() => navigate(`/projects?district=${encodeURIComponent(selectedZone.district)}`)}
              >
                Inspect Zone Projects →
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}