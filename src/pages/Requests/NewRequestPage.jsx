import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaWrench,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaUpload,
  FaShieldAlt,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { providerService } from '@/services/providerService';
import { CATEGORIES_DATA, DI_KHAN_AREAS } from '@/constants/data';
import { ROUTES } from '@/constants/routes';
import { validateServiceRequest } from '@/validations';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import './NewRequestPage.css';

export default function NewRequestPage() {
  useDocumentTitle('Post a Service Request in D.I. Khan');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const prefillProviderId = searchParams.get('providerId');
  const prefillCategory = searchParams.get('category');
  const prefillService = searchParams.get('service');

  const [targetProvider, setTargetProvider] = useState(null);

  const [formData, setFormData] = useState({
    category: prefillCategory || 'home-services',
    serviceName: prefillService || '',
    description: '',
    area: user?.area || '',
    address: user?.address || '',
    preferredDate: '',
    preferredTime: 'Morning (9:00 AM - 1:00 PM)',
    budget: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  // If a specific provider was targeted
  useEffect(() => {
    if (prefillProviderId) {
      providerService.getProviderById(prefillProviderId).then((res) => {
        if (res?.data) {
          setTargetProvider(res.data);
          setFormData((prev) => ({
            ...prev,
            category: res.data.categoryId || prev.category,
            serviceName: res.data.service || prev.serviceName,
          }));
        }
      });
    }
  }, [prefillProviderId]);

  // Current category sub-services
  const selectedCategoryObj = CATEGORIES_DATA.find((c) => c.id === formData.category || c.slug === formData.category);
  const serviceOptions = (selectedCategoryObj?.services || []).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateServiceRequest(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      await requestService.createRequest({
        ...formData,
        category: selectedCategoryObj?.name || formData.category,
        service: formData.serviceName,
        customerId: user?.id || 'guest',
        customerName: user?.name || 'Local Customer',
        customerPhone: user?.phone || '+92 300 0000000',
        providerId: targetProvider?.id || null,
        providerName: targetProvider?.name || null,
        providerPhone: targetProvider?.phone || null,
        hasAttachment: Boolean(selectedFileName),
      });

      // Redirect to customer dashboard
      navigate(ROUTES.CUSTOMER_DASHBOARD);
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-request-page">
      <div className="container page-section request-page-container">
        <div className="request-form-header">
          <span className="request-badge-pill">
            <FaWrench aria-hidden="true" /> Post a Job in D.I. Khan
          </span>
          <h1 className="request-heading">
            {targetProvider ? `Request Service from ${targetProvider.name}` : 'Submit a Service Request'}
          </h1>
          <p className="request-subheading">
            Describe what needs fixing or installation. We will alert qualified technicians in your neighborhood of Dera Ismail Khan.
          </p>
        </div>

        <Card className="request-form-card" as="div">
          <form onSubmit={handleSubmit} noValidate>
            {/* Category and Service */}
            <div className="form-section-group">
              <h3 className="form-section-title">1. Service Details</h3>

              <div className="form-grid-two">
                <Select
                  label="Service Category"
                  name="category"
                  value={formData.category}
                  options={CATEGORIES_DATA.map((c) => ({ value: c.id, label: c.name }))}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({ ...prev, category: e.target.value, serviceName: '' }));
                  }}
                  error={errors.category}
                  required
                />

                <Select
                  label="Specific Service Type"
                  name="serviceName"
                  value={formData.serviceName}
                  options={serviceOptions}
                  placeholder="Choose service (e.g. Plumber, Electrician)…"
                  onChange={handleChange}
                  error={errors.serviceName}
                  required
                />
              </div>

              <Textarea
                label="Describe the problem or job requirements"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Example: I have a water leakage in my kitchen under the sink and the motor is making a loud buzzing sound. Need a reliable plumber to inspect."
                error={errors.description}
                helperText="Be as specific as possible (at least 15 characters)."
                required
                rows={4}
              />
            </div>

            {/* Location */}
            <div className="form-section-group">
              <h3 className="form-section-title">2. Location in D.I. Khan</h3>

              <div className="form-grid-two">
                <Select
                  label="Area / Neighborhood"
                  name="area"
                  value={formData.area}
                  options={DI_KHAN_AREAS.map((a) => ({ value: a, label: a }))}
                  placeholder="Select your area in Dera Ismail Khan"
                  onChange={handleChange}
                  error={errors.area}
                  required
                />

                <Input
                  label="Full Street Address / Landmark"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House #, Mohallah / Street, Near Landmark"
                  error={errors.address}
                  required
                />
              </div>
            </div>

            {/* Schedule & Budget */}
            <div className="form-section-group">
              <h3 className="form-section-title">3. Schedule & Budget</h3>

              <div className="form-grid-two">
                <Input
                  label="Preferred Date"
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  error={errors.preferredDate}
                  required
                />

                <Select
                  label="Preferred Time Slot"
                  name="preferredTime"
                  value={formData.preferredTime}
                  options={[
                    'Morning (9:00 AM - 1:00 PM)',
                    'Afternoon (1:00 PM - 5:00 PM)',
                    'Evening (5:00 PM - 9:00 PM)',
                    'Emergency / As soon as possible',
                  ]}
                  onChange={handleChange}
                  error={errors.preferredTime}
                  required
                />
              </div>

              <div className="form-grid-two">
                <Input
                  label="Estimated Budget (PKR, optional)"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  error={errors.budget}
                  helperText="Leave blank if you'd like to negotiate with the technician."
                />

                <div className="form-group">
                  <label className="form-label">
                    Upload Photo of Problem (Optional)
                  </label>
                  <label className="custom-file-upload-box">
                    <FaUpload aria-hidden="true" />
                    <span>{selectedFileName || 'Click to attach image / receipt'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="visually-hidden"
                    />
                  </label>
                </div>
              </div>

              <Textarea
                label="Additional Instructions / Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Please bring extra PPRC pipe fittings or call before arriving."
                rows={2}
              />
            </div>

            {/* Submit Bar */}
            <div className="request-submit-bar">
              <div className="trust-footnote">
                <FaShieldAlt className="shield-ico" aria-hidden="true" />
                <span>Zero upfront fees. You pay the professional directly upon completion.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="submit-request-btn"
              >
                Submit Service Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
