import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import './ReviewForm.css';

export default function ReviewForm({
  providerName = 'Professional',
  onSubmit,
  onCancel = null,
  isLoading = false,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short review or comment');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }
    setError(null);
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="review-rating-select-group">
        <label className="form-label">
          Rate your service experience with {providerName}:
        </label>
        <div className="star-picker" role="radiogroup" aria-label="Rating out of 5 stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`star-pick-btn ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <FaStar aria-hidden="true" />
            </button>
          ))}
          <span className="rating-select-text">
            {rating} of 5 Star{rating > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <Textarea
        label="Your Review / Feedback"
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the professional's punctuality, skill, cleanliness, and attitude? Did they solve the problem?"
        error={error}
        rows={4}
        required
      />

      <div className="review-form-actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" isLoading={isLoading}>
          Submit Review
        </Button>
      </div>
    </form>
  );
}
