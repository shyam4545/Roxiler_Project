import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../api/client';

const schema = z.object({
  name: z.string().min(1, 'Store name is required').max(255, 'Store name too long'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters').min(1, 'Address is required'),
  ownerId: z.string().optional(),
});

const AdminAddStorePage = () => {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all store owners to populate dropdown
  useEffect(() => {
    api
      .get('/admin/users?role=STORE_OWNER')
      .then((res) => setOwners(res.data.users.filter((u) => u.role === 'STORE_OWNER')))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    const payload = {
      ...data,
      ownerId: data.ownerId ? parseInt(data.ownerId) : null,
    };
    try {
      await api.post('/admin/stores', payload);
      setSuccess('Store created successfully!');
      reset();
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store.');
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
              <h1 className="page-title">Add New Store</h1>
              <p className="page-subtitle">Register a new store on the platform</p>
            </div>
            <Link to="/admin/stores" className="btn btn-secondary">← Back to Stores</Link>
          </div>

          <div className="card" style={{ maxWidth: 600 }}>
            {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="store-name">Store Name</label>
                <input
                  id="store-name"
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="The name of the store"
                  {...register('name')}
                />
                {errors.name && <div className="form-error">⚠️ {errors.name.message}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="store-email">Store Email</label>
                <input
                  id="store-email"
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="contact@store.com"
                  {...register('email')}
                />
                {errors.email && <div className="form-error">⚠️ {errors.email.message}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="store-address">Address</label>
                <textarea
                  id="store-address"
                  className={`form-control ${errors.address ? 'error' : ''}`}
                  placeholder="Full store address"
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
                <label htmlFor="store-owner">Assign Owner (Optional)</label>
                <select
                  id="store-owner"
                  className="form-control"
                  {...register('ownerId')}
                >
                  <option value="">No owner assigned</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} — {owner.email}
                    </option>
                  ))}
                </select>
                <div className="form-hint">Only users with Store Owner role are shown</div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  id="add-store-submit"
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : '✅ Create Store'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/stores')}>
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

export default AdminAddStorePage;
