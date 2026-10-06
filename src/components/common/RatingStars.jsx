import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './RatingStars.css';

/**
 * Display rating stars and review count.
 * @param {object} props
 * @param {number} props.rating e.g. 4.8
 * @param {number} [props.reviewCount] e.g. 35
 * @param {boolean} [props.showNumber]
 * @param {'sm'|'md'|'lg'} [props.size]
 */
export default function RatingStars({
  rating = 0,
  reviewCount = null,
  showNumber = true,
  size = 'md',
  className = '',
}) {
  const num = Number(rating) || 0;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (num >= i) {
      stars.push(<FaStar key={i} className="star-filled" aria-hidden="true" />);
    } else if (num >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="star-half" aria-hidden="true" />);
    } else {
      stars.push(<FaRegStar key={i} className="star-empty" aria-hidden="true" />);
    }
  }

  return (
    <div className={`rating-stars rating-${size} ${className}`} aria-label={`Rating: ${num.toFixed(1)} out of 5 stars`}>
      <span className="stars-cluster" aria-hidden="true">
        {stars}
      </span>
      {showNumber && <span className="rating-score">{num.toFixed(1)}</span>}
      {reviewCount !== null && (
        <span className="rating-count">({reviewCount})</span>
      )}
    </div>
  );
}
