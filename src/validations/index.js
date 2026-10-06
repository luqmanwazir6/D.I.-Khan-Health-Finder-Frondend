/**
 * Form validation utilities for customer and provider workflows.
 * Formats match Pakistani standards (e.g., 03xx-xxxxxxx phone numbers).
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required';
  // Allow +923001234567, 03001234567, 0300-1234567, 0300 1234567
  const cleaned = phone.replace(/[\s-]/g, '');
  const re = /^((\+92)|(0092)|(03))(\d{9})$/;
  if (!re.test(cleaned)) {
    return 'Enter a valid Pakistani phone number (e.g. 0300 1234567)';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateServiceRequest = (formData) => {
  const errors = {};

  if (!formData.category?.trim()) errors.category = 'Service category is required';
  if (!formData.serviceId?.trim() && !formData.serviceName?.trim()) {
    errors.serviceName = 'Service type is required';
  }
  if (!formData.description?.trim()) {
    errors.description = 'Please describe the issue or work needed';
  } else if (formData.description.trim().length < 15) {
    errors.description = 'Description must be at least 15 characters (e.g. "I have a water leakage in my kitchen")';
  }
  if (!formData.area?.trim()) errors.area = 'Please select your area in D.I. Khan';
  if (!formData.address?.trim()) errors.address = 'Street / house address is required';
  if (!formData.preferredDate) errors.preferredDate = 'Preferred date is required';
  if (!formData.preferredTime) errors.preferredTime = 'Preferred time slot is required';

  if (formData.budget && Number(formData.budget) <= 0) {
    errors.budget = 'Budget must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (values) => {
  const errors = {};
  if (!values.emailOrPhone?.trim()) {
    errors.emailOrPhone = 'Email or phone number is required';
  }
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRegisterForm = (values, role = 'customer') => {
  const errors = {};
  if (!values.name?.trim()) errors.name = 'Full name is required';
  
  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validatePhone(values.phone);
  if (phoneErr) errors.phone = phoneErr;

  const passwordErr = validatePassword(values.password);
  if (passwordErr) errors.password = passwordErr;

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (role === 'provider') {
    if (!values.category?.trim()) errors.category = 'Please select your primary service category';
    if (!values.experience || Number(values.experience) < 0) {
      errors.experience = 'Years of experience is required';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
