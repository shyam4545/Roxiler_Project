import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import api from '../../api/client';

const schema = z.object({
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

const UserProfilePage = () => {
  const { user } = useAuth();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    setSuccess('');
    try {
      await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess('Password updated successfully!');
      reset();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your account settings</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Profile Info */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">👤 Account Info</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="detail-field">
                  <div className="field-label">Name</div>
                  <div className="field-value">{user?.name}</div>
                </div>
                <div className="detail-field">
                  <div className="field-label">Email</div>
                  <div className="field-value">{user?.email}</div>
                </div>
                <div className="detail-field">
                  <div className="field-label">Address</div>
                  <div className="field-value">{user?.address}</div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">🔑 Change Password</span>
              </div>

              {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
              {success && <div className="alert alert-success">✅ {success}</div>}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    className={`form-control ${errors.currentPassword ? 'error' : ''}`}
                    placeholder="Your current password"
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <div className="form-error">⚠️ {errors.currentPassword.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className={`form-control ${errors.newPassword ? 'error' : ''}`}
                    placeholder="8–16 chars, uppercase + special char"
                    {...register('newPassword')}
                  />
                  {errors.newPassword ? (
                    <div className="form-error">⚠️ {errors.newPassword.message}</div>
                  ) : (
                    <div className="form-hint">8–16 characters, at least 1 uppercase and 1 special character</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Repeat new password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <div className="form-error">⚠️ {errors.confirmPassword.message}</div>
                  )}
                </div>

                <button
                  id="change-password-submit"
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : '🔐 Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
