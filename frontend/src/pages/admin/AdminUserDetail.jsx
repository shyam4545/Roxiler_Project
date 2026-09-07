import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Stars from '../../components/Stars';
import api from '../../api/client';

const roleBadge = (role) => {
  const map = {
    ADMIN: ['badge-admin', '🛡️ Administrator'],
    USER: ['badge-user', '👤 Normal User'],
    STORE_OWNER: ['badge-owner', '🏪 Store Owner'],
  };
  const [cls, label] = map[role] || ['badge-user', role];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => setUser(res.data.user))
      .catch(() => setError('Failed to load user details.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">User Details</h1>
              <p className="page-subtitle">Viewing profile information</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
              ← Back to Users
            </button>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : user ? (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, flexShrink: 0,
                }}>
                  {user.role === 'ADMIN' ? '🛡️' : user.role === 'STORE_OWNER' ? '🏪' : '👤'}
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.name}
                  </div>
                  <div style={{ marginTop: 6 }}>{roleBadge(user.role)}</div>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-field">
                  <div className="field-label">Email</div>
                  <div className="field-value">{user.email}</div>
                </div>
                <div className="detail-field">
                  <div className="field-label">Role</div>
                  <div className="field-value">{roleBadge(user.role)}</div>
                </div>
                <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                  <div className="field-label">Address</div>
                  <div className="field-value">{user.address}</div>
                </div>
                <div className="detail-field">
                  <div className="field-label">Member Since</div>
                  <div className="field-value">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Store Owner section */}
              {user.role === 'STORE_OWNER' && (
                <div style={{
                  marginTop: 24, padding: 20,
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 16, color: 'var(--text-primary)' }}>
                    🏪 Store Information
                  </div>
                  {user.store ? (
                    <div className="detail-grid">
                      <div className="detail-field">
                        <div className="field-label">Store Name</div>
                        <div className="field-value">{user.store.name}</div>
                      </div>
                      <div className="detail-field">
                        <div className="field-label">Average Rating</div>
                        <div className="field-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Stars value={user.store.avgRating ?? 0} />
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            ({user.store.avgRating ?? 0} / 5)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No store assigned to this owner yet.</p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminUserDetail;
