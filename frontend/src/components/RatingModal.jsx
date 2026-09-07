import { useState } from 'react';
import Stars from './Stars';

/**
 * Rating Modal — shown when user clicks "Rate" or "Modify Rating"
 * Props:
 *   storeName: string
 *   existingRating: number | null
 *   onSubmit: (value) => Promise<void>
 *   onClose: () => void
 */
const RatingModal = ({ storeName, existingRating, onSubmit, onClose }) => {
  const [selected, setSelected] = useState(existingRating || 0);
  const [hovering, setHovering] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const displayValue = hovering || selected;

  const handleSubmit = async () => {
    if (!selected) {
      setError('Please select a rating before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(selected);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          {existingRating ? '✏️ Modify Your Rating' : '⭐ Rate This Store'}
        </div>
        <div className="modal-subtitle">{storeName}</div>

        <div className="rating-picker">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star clickable ${star <= displayValue ? 'filled' : 'empty'} ${star <= displayValue ? 'active' : ''}`}
              onMouseEnter={() => setHovering(star)}
              onMouseLeave={() => setHovering(0)}
              onClick={() => setSelected(star)}
              title={`${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </span>
          ))}
        </div>

        {selected > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
            You selected: <strong style={{ color: 'var(--star-filled)' }}>{selected} star{selected > 1 ? 's' : ''}</strong>
          </p>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !selected} id="submit-rating-btn">
            {loading ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
