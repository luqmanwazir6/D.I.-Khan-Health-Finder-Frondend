import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/constants/routes';
import { validatePassword } from '@/validations';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import './AuthPages.css';

export default function ResetPasswordPage() {
  useDocumentTitle('Set New Password | D.I. Khan Service Finder');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-desc">
          Choose a strong password with at least 6 characters.
        </p>
      </div>

      {isSuccess ? (
        <div className="auth-success-box">
          <FaCheckCircle className="auth-success-ico" aria-hidden="true" />
          <h3>Password reset successfully</h3>
          <p>You can now log in to your account with your new credentials.</p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Log in now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-alert-error" role="alert">
              {error}
            </div>
          )}

          <Input
            label="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
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
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
}
