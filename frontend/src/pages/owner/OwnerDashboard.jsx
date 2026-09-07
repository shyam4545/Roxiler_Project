import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Stars from '../../components/Stars';
import api from '../../api/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api
      .get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (formData) => {
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await api.put('/auth/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setPwSuccess('Password updated successfully!');
      reset();
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const raterColumns = [
    {
      key: 'userName',
      header: 'Customer Name',
      render: (row) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.user?.name}</span>
      ),
    },
    {
      key: 'userEmail',
      header: 'Email',
      render: (row) => row.user?.email,
    },
    {
      key: 'value',
      header: 'Rating Given',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars value={row.value} />
          <span className="rating-number">{row.value}/5</span>
        </div>
      ),
    },
    {
      key: 'ratedAt',
      header: 'Rated At',
      render: (row) =>
        new Date(row.ratedAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Store Dashboard</h1>
              <p className="page-subtitle">Your store's performance overview</p>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : data ? (
            <>
              {/* Store Info + Avg Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">🏪 Store Information</span>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <div className="field-label">Store Name</div>
                      <div className="field-value">{data.store.name}</div>
                    </div>
                    <div className="detail-field">
                      <div className="field-label">Email</div>
                      <div className="field-value">{data.store.email}</div>
                    </div>
                    <div className="detail-field" style={{ gridColumn: '1/-1' }}>
                      <div className="field-label">Address</div>
                      <div className="field-value">{data.store.address}</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="card-header" style={{ justifyContent: 'center' }}>
                    <span className="card-title">⭐ Average Rating</span>
                  </div>
                  <div className="avg-rating-number">
                    {data.store.avgRating > 0 ? data.store.avgRating.toFixed(1) : '—'}
                  </div>
                  <div style={{ margin: '12px 0' }}>
                    <Stars value={data.store.avgRating} size="1.4rem" />
                  </div>
                  <div className="avg-rating-label">
                    Based on <strong>{data.store.totalRatings}</strong> rating{data.store.totalRatings !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Raters Table */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">👥 Customer Ratings</span>
                </div>
                {data.raters.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">⭐</div>
                    <p>No ratings yet. Encourage your customers to rate your store!</p>
                  </div>
                ) : (
                  <DataTable
                    data={data.raters}
                    columns={raterColumns}
                    globalFilterPlaceholder="Search customers..."
                  />
                )}
              </div>

              {/* Change Password */}
              <div className="card" style={{ marginTop: 24, maxWidth: 500 }}>
                <div className="card-header">
                  <span className="card-title">🔑 Change Password</span>
                </div>

                {pwError && <div className="alert alert-error">⚠️ {pwError}</div>}
                {pwSuccess && <div className="alert alert-success">✅ {pwSuccess}</div>}

                <form onSubmit={handleSubmit(onPasswordSubmit)} noValidate>
                  <div className="form-group">
                    <label htmlFor="owner-current-pw">Current Password</label>
                    <input
                      id="owner-current-pw"
                      type="password"
                      className={`form-control ${errors.currentPassword ? 'error' : ''}`}
                      placeholder="Your current password"
                      {...register('currentPassword')}
                    />
                    {errors.currentPassword && <div className="form-error">⚠️ {errors.currentPassword.message}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="owner-new-pw">New Password</label>
                    <input
                      id="owner-new-pw"
                      type="password"
                      className={`form-control ${errors.newPassword ? 'error' : ''}`}
                      placeholder="8–16 chars, uppercase + special char"
                      {...register('newPassword')}
                    />
                    {errors.newPassword ? (
                      <div className="form-error">⚠️ {errors.newPassword.message}</div>
                    ) : (
                      <div className="form-hint">8–16 chars, at least 1 uppercase and 1 special character</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="owner-confirm-pw">Confirm New Password</label>
                    <input
                      id="owner-confirm-pw"
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Repeat new password"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && <div className="form-error">⚠️ {errors.confirmPassword.message}</div>}
                  </div>

                  <button
                    id="owner-pw-submit"
                    type="submit"
                    className="btn btn-primary"
                    disabled={pwLoading}
                  >
                    {pwLoading ? 'Updating...' : '🔐 Update Password'}
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
