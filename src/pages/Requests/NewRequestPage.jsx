import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaWrench,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaUpload,
  FaShieldAlt,
  FaTimes,
  FaExclamationCircle,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { providerService } from '@/services/providerService';
import { uploadService } from '@/services/uploadService';
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
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
    if (submitError) setSubmitError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: 'File size must be 10 MB or smaller' }));
        return;
      }
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setSelectedFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const validation = validateServiceRequest(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      let attachments = [];

      // If user attached a file, upload it first to storage
      if (selectedFile) {
        try {
          const uploadRes = await uploadService.uploadFile(selectedFile, 'requests');
          if (uploadRes?.data) {
            attachments.push(uploadRes.data);
          }
        } catch (uploadErr) {
          const errDetail = uploadErr.response?.data?.message || uploadErr.message;
          setSubmitError(`File upload failed: ${errDetail}. Please check file type (JPG, PNG, PDF) and size.`);
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        category: selectedCategoryObj?.name || formData.category,
        service: formData.serviceName,
        title: `${formData.serviceName} in ${formData.area}`,
        description: formData.description,
        address: formData.address,
        area: formData.area,
        city: 'Dera Ismail Khan',
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        budget: formData.budget ? Number(formData.budget) : 0,
        notes: formData.notes,
        providerId: targetProvider?._id || targetProvider?.id || null,
        attachments,
      };

      await requestService.createRequest(payload);

      // Redirect to customer dashboard
      navigate(ROUTES.CUSTOMER_DASHBOARD);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit service request. Please try again.');
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

        {submitError && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <FaExclamationCircle />
            <span>{submitError}</span>
          </div>
        )}

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
                helperText="Be as specific as possible (at least 10 characters)."
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
                  label="Street Address / House No. / Landmark"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. House 42, St 3, Near Purani Sabzi Mandi"
                  error={errors.address}
                  required
                />
              </div>
            </div>

            {/* Schedule & Budget */}
            <div className="form-section-group">
              <h3 className="form-section-title">3. Timing, Budget & Photo</h3>

              <div className="form-grid-two">
                <Input
                  label="Preferred Date (Optional)"
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  error={errors.preferredDate}
                />

                <Select
                  label="Preferred Time Window"
                  name="preferredTime"
                  value={formData.preferredTime}
                  options={[
                    { value: 'Morning (9:00 AM - 1:00 PM)', label: 'Morning (9:00 AM - 1:00 PM)' },
                    { value: 'Afternoon (1:00 PM - 5:00 PM)', label: 'Afternoon (1:00 PM - 5:00 PM)' },
                    { value: 'Evening (5:00 PM - 9:00 PM)', label: 'Evening (5:00 PM - 9:00 PM)' },
                    { value: 'Emergency / ASAP', label: 'Emergency / ASAP' },
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
                    Upload Photo / Document of Problem (Optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="custom-file-upload-box" style={{ flex: 1, margin: 0 }}>
                      <FaUpload aria-hidden="true" />
                      <span>{selectedFileName || 'Click to attach image / document'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="visually-hidden"
                      />
                    </label>
                    {selectedFileName && (
                      <button
                        type="button"
                        onClick={removeFile}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                        }}
                        title="Remove file"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  {errors.file && <span className="form-error-text">{errors.file}</span>}
                  <small className="form-helper-text">Max 10 MB. JPG, PNG, WEBP, or PDF.</small>
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
