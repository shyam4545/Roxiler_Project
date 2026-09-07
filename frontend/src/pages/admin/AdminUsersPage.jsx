import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import api from '../../api/client';

const roleBadge = (role) => {
  const map = {
    ADMIN: ['badge-admin', '🛡️ Admin'],
    USER: ['badge-user', '👤 User'],
    STORE_OWNER: ['badge-owner', '🏪 Owner'],
  };
  const [cls, label] = map[role] || ['badge-user', role];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data.users))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'name',
      header: 'Name',
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
      key: 'role',
      header: 'Role',
      render: (row) => roleBadge(row.role),
    },
    {
      key: '_actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/admin/users/${row.id}`)}
          id={`view-user-${row.id}`}
        >
          View Details
        </button>
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
              <h1 className="page-title">Users</h1>
              <p className="page-subtitle">Manage all registered users</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/users/new')}
              id="add-user-btn"
            >
              ➕ Add User
            </button>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              globalFilterPlaceholder="Search by name, email, address, role..."
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
