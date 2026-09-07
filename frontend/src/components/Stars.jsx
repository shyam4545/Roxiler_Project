const Stars = ({ value, max = 5, size = '1rem', clickable = false, onRate }) => {
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          className={`star ${star <= Math.round(value) ? 'filled' : 'empty'} ${clickable ? 'clickable' : ''}`}
          style={{ fontSize: size }}
          onClick={clickable && onRate ? () => onRate(star) : undefined}
          title={clickable ? `Rate ${star}` : `${value} stars`}
        >
          ★
        </span>
      ))}
    </span>
  );
};

export default Stars;
