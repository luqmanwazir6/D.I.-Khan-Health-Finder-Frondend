import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCheck, FaBriefcase, FaShieldAlt } from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, getDashboardPath } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { CATEGORIES_DATA } from '@/constants/data';
import { validateRegisterForm } from '@/validations';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import './AuthPages.css';

export default function RegisterPage() {
  useDocumentTitle('Create Account | D.I. Khan Service Finder');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [activeRole, setActiveRole] = useState(ROLES.CUSTOMER);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: '',
    experience: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = validateRegisterForm(formData, activeRole);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    try {
      const newUser = await signup({
        ...formData,
        role: activeRole,
      });
      const destination = getDashboardPath(newUser?.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-desc">
          Join Dera Ismail Khan&apos;s leading local service community.
        </p>

        {/* Role toggle tabs */}
        <div className="auth-role-tabs" role="tablist" aria-label="Account Type">
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === ROLES.CUSTOMER}
            className={`auth-role-tab ${activeRole === ROLES.CUSTOMER ? 'active' : ''}`}
            onClick={() => setActiveRole(ROLES.CUSTOMER)}
          >
            <FaUserCheck aria-hidden="true" />
            <span>I Need Services (Customer)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === ROLES.PROVIDER}
            className={`auth-role-tab ${activeRole === ROLES.PROVIDER ? 'active' : ''}`}
            onClick={() => setActiveRole(ROLES.PROVIDER)}
          >
            <FaBriefcase aria-hidden="true" />
            <span>I Provide Services (Professional)</span>
          </button>
        </div>
      </div>

      {generalError && (
        <div className="auth-alert-error" role="alert">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Muhammad Tariq"
          error={errors.name}
          required
        />

        <div className="form-row-two">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@gmail.com"
            error={errors.email}
            required
          />

          <Input
            label="Phone Number (Pakistani)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0300 1234567"
            error={errors.phone}
            helperText="Format: 0300 1234567"
            required
          />
        </div>

        {/* Provider-specific fields */}
        {activeRole === ROLES.PROVIDER && (
          <div className="provider-registration-box">
            <div className="pro-reg-badge">
              <FaShieldAlt aria-hidden="true" /> Professional Details
            </div>

            <Select
              label="Primary Service Category"
              name="category"
              value={formData.category}
              options={CATEGORIES_DATA.map((c) => ({ value: c.name, label: c.name }))}
              placeholder="Select your main trade / service category"
              onChange={handleChange}
              error={errors.category}
              required
            />

            <Input
              label="Years of Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 8"
              error={errors.experience}
              required
            />
          </div>
        )}

        <div className="form-row-two">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="auth-submit-btn"
        >
          {activeRole === ROLES.PROVIDER ? 'Register as Professional' : 'Create Customer Account'}
        </Button>
      </form>

      <div className="auth-footer-text">
        <span>Already have an account? </span>
        <Link to={ROUTES.LOGIN}>Log in here</Link>
      </div>
    </div>
  );
}
