import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, getDashboardPath } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { validateLoginForm } from '@/validations';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import './AuthPages.css';

export default function LoginPage() {
  useDocumentTitle('Log in to D.I. Khan Service Finder');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = validateLoginForm(formData);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    try {
      const loggedInUser = await login(formData);
      const destination = from || getDashboardPath(loggedInUser?.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-desc">
          Log in to manage your service requests or professional profile in D.I. Khan.
        </p>
      </div>

      {generalError && (
        <div className="auth-alert-error" role="alert">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Email or Phone Number"
          name="emailOrPhone"
          value={formData.emailOrPhone}
          onChange={handleChange}
          placeholder="0300 1234567 or email@domain.com"
          error={errors.emailOrPhone}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
        />

        <div className="auth-extra-links">
          <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-pass-link">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="auth-submit-btn"
        >
          Log in
        </Button>
      </form>

      <div className="auth-footer-text">
        <span>Don&apos;t have an account? </span>
        <Link to={ROUTES.REGISTER}>Create account</Link>
      </div>
    </div>
  );
}
