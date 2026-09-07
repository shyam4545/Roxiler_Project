import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/client';

const StatCard = ({ icon, value, label, colorClass }) => (
  <div className="stat-card">
    <div className={`stat-icon ${colorClass}`}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Platform overview and key metrics</p>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="stat-grid">
              <StatCard icon="👥" value={stats?.totalUsers} label="Total Users" colorClass="purple" />
              <StatCard icon="🏪" value={stats?.totalStores} label="Total Stores" colorClass="blue" />
              <StatCard icon="⭐" value={stats?.totalRatings} label="Total Ratings" colorClass="amber" />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Quick Actions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="/admin/users/new" className="btn btn-primary" id="dash-add-user">
                  ➕ Add New User
                </a>
                <a href="/admin/stores/new" className="btn btn-secondary" id="dash-add-store">
                  🏪 Add New Store
                </a>
                <a href="/admin/users" className="btn btn-secondary" id="dash-view-users">
                  👥 View All Users
                </a>
                <a href="/admin/stores" className="btn btn-secondary" id="dash-view-stores">
                  📋 View All Stores
                </a>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Platform Summary</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Registered Users', value: stats?.totalUsers, color: 'var(--accent-primary)' },
                  { label: 'Active Stores', value: stats?.totalStores, color: 'var(--info)' },
                  { label: 'Ratings Submitted', value: stats?.totalRatings, color: 'var(--warning)' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color, fontSize: '1.1rem' }}>
                      {item.value ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
