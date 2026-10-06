import { FaUserCircle, FaCalendarAlt } from 'react-icons/fa';
import RatingStars from '@/components/common/RatingStars';
import Card from '@/components/common/Card';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  return (
    <Card className="review-card" as="article">
      <div className="review-header">
        <div className="reviewer-info">
          <FaUserCircle className="reviewer-avatar" aria-hidden="true" />
          <div>
            <h4 className="reviewer-name">{review.userName}</h4>
            {review.userCity && (
              <span className="reviewer-location">{review.userCity}</span>
            )}
          </div>
        </div>

        <div className="review-meta-box">
          <RatingStars rating={review.rating} showNumber={false} size="sm" />
          <span className="review-date">
            <FaCalendarAlt aria-hidden="true" /> {review.date}
          </span>
        </div>
      </div>

      <p className="review-comment">{review.comment}</p>
    </Card>
  );
}
