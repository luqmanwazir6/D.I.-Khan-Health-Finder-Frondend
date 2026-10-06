import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/constants/routes';
import { validateEmail } from '@/validations';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot Password | D.I. Khan Service Finder');

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <h1 className="auth-title">Reset Your Password</h1>
        <p className="auth-desc">
          Enter the email associated with your D.I. Khan Service Finder account.
        </p>
      </div>

      {isSubmitted ? (
        <div className="auth-success-box">
          <FaCheckCircle className="auth-success-ico" aria-hidden="true" />
          <h3>Check your email</h3>
          <p>
            We have sent password reset instructions to <strong>{email}</strong>.
          </p>
          <div className="auth-extra-links" style={{ justifyContent: 'center' }}>
            <Link to={ROUTES.LOGIN} className="forgot-pass-link">
              Return to log in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="name@example.com"
            error={error}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="auth-submit-btn"
          >
            Send Reset Instructions
          </Button>

          <div className="auth-footer-text">
            <Link to={ROUTES.LOGIN} className="back-to-login-link">
              <FaArrowLeft aria-hidden="true" /> Back to log in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
