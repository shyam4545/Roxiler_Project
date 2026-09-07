import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Stars from '../../components/Stars';
import api from '../../api/client';

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/admin/stores')
      .then((res) => setStores(res.data.stores))
      .catch(() => setError('Failed to load stores.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'name',
      header: 'Store Name',
      render: (row) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'address',
      header: 'Address',
      render: (row) => (
        <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.address}
        </span>
      ),
    },
    {
      key: 'avgRating',
      header: 'Rating',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars value={row.avgRating} />
          <span className="rating-number">
            {row.avgRating > 0 ? row.avgRating.toFixed(1) : 'No ratings'}
          </span>
        </div>
      ),
    },
    {
      key: 'ratingCount',
      header: '# Ratings',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>{row.ratingCount}</span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: false,
      render: (row) =>
        row.owner ? (
          <span style={{ color: 'var(--text-secondary)' }}>{row.owner.name}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>No owner</span>
        ),
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Stores</h1>
              <p className="page-subtitle">All registered stores on the platform</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/stores/new')}
              id="add-store-btn"
            >
              ➕ Add Store
            </button>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <DataTable
              data={stores}
              columns={columns}
              globalFilterPlaceholder="Search by name, email, address..."
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminStoresPage;
