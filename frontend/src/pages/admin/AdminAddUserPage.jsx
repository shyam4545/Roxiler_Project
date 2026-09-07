import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../api/client';

const schema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  address: z.string().max(400, 'Address must be at most 400 characters').min(1, 'Address is required'),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], { required_error: 'Role is required' }),
});

const AdminAddUserPage = () => {
  const navigate = useNavigate();
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
    try {
      await api.post('/admin/users', data);
      setSuccess('User created successfully!');
      reset();
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create user.');
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
              <h1 className="page-title">Add New User</h1>
              <p className="page-subtitle">Create an admin, normal user, or store owner</p>
            </div>
            <Link to="/admin/users" className="btn btn-secondary">← Back to Users</Link>
          </div>

          <div className="card" style={{ maxWidth: 600 }}>
            {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="add-name">Full Name</label>
                <input
                  id="add-name"
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="At least 20 characters"
                  {...register('name')}
                />
                {errors.name ? (
                  <div className="form-error">⚠️ {errors.name.message}</div>
                ) : (
                  <div className="form-hint">Min 20, Max 60 characters</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="add-email">Email Address</label>
                <input
                  id="add-email"
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="user@example.com"
                  {...register('email')}
                />
                {errors.email && <div className="form-error">⚠️ {errors.email.message}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="add-password">Password</label>
                <input
                  id="add-password"
                  type="password"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="8–16 chars, uppercase + special char"
                  {...register('password')}
                />
                {errors.password ? (
                  <div className="form-error">⚠️ {errors.password.message}</div>
                ) : (
                  <div className="form-hint">8–16 characters, at least 1 uppercase and 1 special character</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="add-address">Address</label>
                <textarea
                  id="add-address"
                  className={`form-control ${errors.address ? 'error' : ''}`}
                  placeholder="Full address"
                  rows={3}
                  {...register('address')}
                  style={{ resize: 'vertical' }}
                />
                {errors.address ? (
                  <div className="form-error">⚠️ {errors.address.message}</div>
                ) : (
                  <div className="form-hint">Max 400 characters</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="add-role">Role</label>
                <select
                  id="add-role"
                  className={`form-control ${errors.role ? 'error' : ''}`}
                  {...register('role')}
                >
                  <option value="">Select a role...</option>
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
                {errors.role && <div className="form-error">⚠️ {errors.role.message}</div>}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  id="add-user-submit"
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : '✅ Create User'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAddUserPage;
