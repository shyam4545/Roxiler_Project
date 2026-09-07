import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Stars from '../../components/Stars';
import RatingModal from '../../components/RatingModal';
import api from '../../api/client';

const UserStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ratingModal, setRatingModal] = useState(null); // { store, isModify }
  const [toast, setToast] = useState('');

  const fetchStores = (q = '') => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) { params.set('name', q); params.set('address', q); }
    api
      .get(`/stores?${params}`)
      .then((res) => setStores(res.data.stores))
      .catch(() => setError('Failed to load stores.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window._storeSearchTimer);
    window._storeSearchTimer = setTimeout(() => fetchStores(val), 400);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRatingSubmit = async (value) => {
    const { store, isModify } = ratingModal;
    if (isModify) {
      await api.put(`/stores/${store.id}/ratings`, { value });
      showToast(`✅ Rating updated for ${store.name}`);
    } else {
      await api.post(`/stores/${store.id}/ratings`, { value });
      showToast(`✅ Rating submitted for ${store.name}`);
    }
    setRatingModal(null);
    fetchStores(search);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Browse Stores</h1>
              <p className="page-subtitle">Find and rate stores on the platform</p>
            </div>
          </div>

          {toast && (
            <div className="alert alert-success" style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, maxWidth: 360 }}>
              {toast}
            </div>
          )}

          <div className="filters-bar" style={{ marginBottom: 24 }}>
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input
                id="store-search"
                className="form-control search-input"
                placeholder="Search by store name or address..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : stores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <p>No stores found. Try a different search.</p>
            </div>
          ) : (
            <div className="stores-grid">
              {stores.map((store) => (
                <div key={store.id} className="store-card">
                  <div className="store-card-name">{store.name}</div>
                  <div className="store-card-address">📍 {store.address}</div>

                  <div className="store-card-ratings">
                    <div className="store-card-rating-row">
                      <span className="store-card-rating-label">Overall Rating</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Stars value={store.avgRating} />
                        <span className="rating-number">
                          {store.avgRating > 0 ? store.avgRating.toFixed(1) : 'No ratings'}{' '}
                          {store.ratingCount > 0 && `(${store.ratingCount})`}
                        </span>
                      </div>
                    </div>

                    <div className="store-card-rating-row">
                      <span className="store-card-rating-label">Your Rating</span>
                      {store.userRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Stars value={store.userRating} />
                          <span className="rating-number">{store.userRating}/5</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not rated yet</span>
                      )}
                    </div>
                  </div>

                  <div className="store-card-actions">
                    {store.userRating ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        id={`modify-rating-${store.id}`}
                        onClick={() => setRatingModal({ store, isModify: true })}
                      >
                        ✏️ Modify Rating
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        id={`submit-rating-${store.id}`}
                        onClick={() => setRatingModal({ store, isModify: false })}
                      >
                        ⭐ Rate Store
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {ratingModal && (
          <RatingModal
            storeName={ratingModal.store.name}
            existingRating={ratingModal.isModify ? ratingModal.store.userRating : null}
            onSubmit={handleRatingSubmit}
            onClose={() => setRatingModal(null)}
          />
        )}
      </main>
    </div>
  );
};

export default UserStoresPage;
