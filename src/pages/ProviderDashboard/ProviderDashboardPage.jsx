import { useState, useEffect, useCallback } from 'react';
import {
  FaTachometerAlt,
  FaInbox,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaUserTie,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaShieldAlt,
  FaCog,
  FaPhoneAlt,
  FaIdCard,
  FaUpload,
  FaPaperclip,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaEye,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { reviewService } from '@/services/reviewService';
import { providerService } from '@/services/providerService';
import { uploadService } from '@/services/uploadService';
import { REQUEST_STATUS } from '@/constants/requestStatus';
import { DI_KHAN_AREAS, CATEGORIES_DATA } from '@/constants/data';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatCard from '@/components/dashboard/StatCard';
import RequestCard from '@/components/requests/RequestCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Modal from '@/components/common/Modal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { EmptyState, SuccessMessage } from '@/components/common/FeedbackStates';
import SkeletonCard from '@/components/common/SkeletonCard';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import '@/components/dashboard/DashboardPages.css';

export default function ProviderDashboardPage() {
  useDocumentTitle('Professional Dashboard | D.I. Khan Service Finder');
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providerDoc, setProviderDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Modals for accept/reject/complete actions
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: '',
    request: null,
    notes: '',
  });

  // Request details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetailsReq, setSelectedDetailsReq] = useState(null);

  // Provider profile edit state
  const [proProfile, setProProfile] = useState({
    service: user?.service || 'Plumber',
    startingPrice: '700',
    experience: '5',
    workingHours: '8:00 AM - 8:00 PM',
    shortDescription: 'Master technician operating in D.I. Khan.',
    cnic: '',
    serviceAreas: ['Circular Road', 'Topanwala Gate', 'Cantt Area', 'Commissionery Bazar'],
  });

  const loadProviderData = useCallback(async () => {
    setIsLoading(true);
    try {
      const myProId = user?.providerId || user?.id || user?._id;
      const myProEmail = user?.email?.toLowerCase();
      const proCategory = user?.category || proProfile.service;

      const [reqRes, revRes, proListRes] = await Promise.all([
        requestService.getRequests({
          providerId: myProId,
          providerEmail: myProEmail,
          category: proCategory,
        }),
        reviewService.getReviews(),
        providerService.getProviders({ limit: 100 }),
      ]);

      // Match current provider doc
      const foundPro = (proListRes.data || []).find(
        (p) =>
          (myProId && (p._id === myProId || p.id === myProId)) ||
          (p.user && (p.user === user?.id || p.user === user?._id)) ||
          (p.email && p.email.toLowerCase() === myProEmail)
      );

      if (foundPro) {
        setProviderDoc(foundPro);
        setProProfile({
          service: foundPro.service || proProfile.service,
          startingPrice: foundPro.pricing?.amount || foundPro.startingPrice || '700',
          experience: foundPro.experienceYears || foundPro.experience || '5',
          workingHours: foundPro.workingHours || '8:00 AM - 8:00 PM',
          shortDescription: foundPro.bio || foundPro.shortDescription || '',
          cnic: foundPro.cnic || '',
          serviceAreas: foundPro.serviceAreas || proProfile.serviceAreas,
        });
      }

      const allReqs = reqRes.data || [];
      const proRequests = allReqs.filter((r) => {
        const matchesId = myProId && (r.providerId === myProId || r.provider === myProId);
        const matchesEmail = myProEmail && r.providerEmail && r.providerEmail.toLowerCase() === myProEmail;
        const matchesOpen = !r.providerId && proCategory && (r.category === proCategory || r.service === proProfile.service);
        return matchesId || matchesEmail || matchesOpen;
      });

      setRequests(proRequests);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error('Failed to load provider data', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, proProfile.service, proProfile.serviceAreas]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const providerStatus = providerDoc?.status || 'pending';
  const isApproved = providerStatus === 'active';

  // Filter requests for provider
  const pendingRequests = requests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const activeJobs = requests.filter((r) =>
    ['accepted', 'in-progress'].includes(r.status),
  );
  const completedJobs = requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED);

  const handleAction = async () => {
    const { action, request, notes } = confirmModal;
    if (!request) return;

    if (!isApproved && action === 'accept') {
      alert('Your professional account is awaiting Admin approval. You cannot accept customer jobs yet.');
      setConfirmModal({ isOpen: false, action: '', request: null, notes: '' });
      return;
    }

    try {
      const targetId = request._id || request.id;
      if (action === 'accept') {
        await requestService.updateRequestStatus(targetId, REQUEST_STATUS.ACCEPTED);
        setSuccessMsg(`Accepted job #${request.requestId || targetId}. Coordinate directly with customer at ${request.customerPhone}.`);
      } else if (action === 'in-progress') {
        await requestService.updateRequestStatus(targetId, REQUEST_STATUS.IN_PROGRESS, { statusNote: 'Technician started work' });
        setSuccessMsg(`Job #${request.requestId || targetId} is now In Progress.`);
      } else if (action === 'reject') {
        await requestService.updateRequestStatus(targetId, REQUEST_STATUS.REJECTED, { rejectionReason: notes || 'Provider declined' });
        setSuccessMsg(`Decline recorded for job #${request.requestId || targetId}.`);
      } else if (action === 'complete') {
        await requestService.updateRequestStatus(targetId, REQUEST_STATUS.COMPLETED, { completionNotes: notes || 'Job completed on site' });
        setSuccessMsg(`Job #${request.requestId || targetId} marked as completed! Customer has been notified.`);
      }
      setConfirmModal({ isOpen: false, action: '', request: null, notes: '' });
      loadProviderData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const targetProId = providerDoc?._id || providerDoc?.id || user?.providerId || user?.id;
      await providerService.updateProvider(targetProId, {
        service: proProfile.service,
        bio: proProfile.shortDescription,
        shortDescription: proProfile.shortDescription,
        experienceYears: Number(proProfile.experience) || 1,
        pricing: { type: 'starting', amount: Number(proProfile.startingPrice) || 500, currency: 'PKR' },
        workingHours: proProfile.workingHours,
        serviceAreas: proProfile.serviceAreas,
        cnic: proProfile.cnic,
      });
      setSuccessMsg('Your rates, CNIC, and profile details have been saved.');
      loadProviderData();
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10 MB.');
      return;
    }

    setUploadingDoc(true);
    try {
      const uploadRes = await uploadService.uploadFile(file, 'documents');
      if (uploadRes?.data) {
        const newDoc = {
          name: file.name,
          url: uploadRes.data.url,
          fileType: uploadRes.data.mimetype,
          uploadedAt: new Date().toISOString(),
        };

        const existingDocs = providerDoc?.documents || [];
        const targetProId = providerDoc?._id || providerDoc?.id || user?.providerId || user?.id;

        await providerService.updateProvider(targetProId, {
          documents: [...existingDocs, newDoc],
        });

        setSuccessMsg(`Document "${file.name}" uploaded successfully for Admin verification.`);
        loadProviderData();
      }
    } catch (err) {
      alert(err.message || 'Document upload failed. Please try again.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const toggleArea = (area) => {
    setProProfile((prev) => {
      const exists = prev.serviceAreas.includes(area);
      const nextAreas = exists
        ? prev.serviceAreas.filter((a) => a !== area)
        : [...prev.serviceAreas, area];
      return { ...prev, serviceAreas: nextAreas };
    });
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
    { id: 'requests', label: 'Job Requests', icon: <FaInbox />, count: pendingRequests.length },
    { id: 'active', label: 'Active Jobs', icon: <FaClock />, count: activeJobs.length },
    { id: 'completed', label: 'Completed Jobs', icon: <FaCheckCircle />, count: completedJobs.length },
    { id: 'verification', label: 'Verification & Docs', icon: <FaIdCard /> },
    { id: 'services', label: 'Services & Rates', icon: <FaMoneyBillWave /> },
    { id: 'areas', label: 'Service Areas', icon: <FaMapMarkerAlt /> },
    { id: 'reviews', label: 'Customer Reviews', icon: <FaStar />, count: reviews.length },
  ];

  return (
    <div className="dashboard-container container page-section">
      <div className="dashboard-layout-grid">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar-area">
          <DashboardSidebar
            items={sidebarItems}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-content-area">
          {successMsg && (
            <SuccessMessage
              message={successMsg}
              onDismiss={() => setSuccessMsg('')}
            />
          )}

          {/* APPROVAL STATUS BANNERS */}
          {providerStatus === 'pending' && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaExclamationTriangle color="#d97706" size={20} />
                <div>
                  <strong style={{ color: '#92400e', fontSize: '15px' }}>
                    Application Pending Admin Approval
                  </strong>
                  <p style={{ margin: '4px 0 0 0', color: '#b45309', fontSize: '13px' }}>
                    Your professional account is currently under review by Admin. You can upload your CNIC and certificates under the <strong>"Verification & Docs"</strong> tab. Once verified, you will be able to accept customer requests.
                  </p>
                </div>
              </div>
            </div>
          )}

          {providerStatus === 'rejected' && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaTimesCircle color="#dc2626" size={20} />
                <div>
                  <strong style={{ color: '#991b1b', fontSize: '15px' }}>
                    Application Not Approved
                  </strong>
                  <p style={{ margin: '4px 0 0 0', color: '#b91c1c', fontSize: '13px' }}>
                    Reason: {providerDoc?.rejectionReason || 'Please upload valid trade credentials or contact support.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Professional Overview</h1>
                  <p className="dash-subheading">
                    Welcome, {user?.name}. Monitor your jobs, incoming calls, and customer feedback in D.I. Khan.
                  </p>
                </div>
                <div className="dash-status-indicator">
                  <span className={isApproved ? 'avail-dot' : ''} style={!isApproved ? { background: '#f59e0b', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '6px' } : undefined} />
                  <span>{isApproved ? 'Verified & Active in D.I. Khan' : 'Pending Verification'}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="dash-stats-grid">
                <StatCard
                  title="New Requests"
                  value={pendingRequests.length}
                  subtitle="Awaiting your response"
                  icon={<FaInbox />}
                  tone="warning"
                />
                <StatCard
                  title="Active Jobs"
                  value={activeJobs.length}
                  subtitle="In progress"
                  icon={<FaClock />}
                  tone="primary"
                />
                <StatCard
                  title="Completed Jobs"
                  value={completedJobs.length}
                  subtitle="Successfully delivered"
                  icon={<FaCheckCircle />}
                  tone="success"
                />
              </div>

              {/* Pending Requests Box */}
              <div className="dash-section-box">
                <div className="dash-section-header">
                  <h2>Incoming Service Requests ({pendingRequests.length})</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('requests')}
                  >
                    View all requests
                  </Button>
                </div>

                {isLoading ? (
                  <SkeletonCard count={2} />
                ) : pendingRequests.length === 0 ? (
                  <EmptyState
                    title="No pending job requests"
                    message="You have responded to all current inquiries. New job posts from Dera Ismail Khan customers will appear here."
                  />
                ) : (
                  <div className="dash-cards-stack">
                    {pendingRequests.map((req) => (
                      <RequestCard
                        key={req.id || req._id}
                        request={req}
                        userRole="provider"
                        onViewDetails={(r) => { setSelectedDetailsReq(r); setDetailsModalOpen(true); }}
                        onAccept={(r) =>
                          setConfirmModal({ isOpen: true, action: 'accept', request: r, notes: '' })
                        }
                        onReject={(r) =>
                          setConfirmModal({ isOpen: true, action: 'reject', request: r, notes: '' })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Incoming Service Requests ({pendingRequests.length})</h1>
                  <p className="dash-subheading">
                    Review jobs posted by customers in your area and accept them to connect directly.
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <EmptyState
                  title="No new job requests"
                  message="When customers in D.I. Khan request your trade, they will appear here immediately."
                />
              ) : (
                <div className="dash-cards-stack">
                  {pendingRequests.map((req) => (
                    <RequestCard
                      key={req.id || req._id}
                      request={req}
                      userRole="provider"
                      onViewDetails={(r) => { setSelectedDetailsReq(r); setDetailsModalOpen(true); }}
                      onAccept={(r) =>
                        setConfirmModal({ isOpen: true, action: 'accept', request: r, notes: '' })
                      }
                      onReject={(r) =>
                        setConfirmModal({ isOpen: true, action: 'reject', request: r, notes: '' })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ACTIVE JOBS */}
          {activeTab === 'active' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Active On-Site Jobs ({activeJobs.length})</h1>
                  <p className="dash-subheading">
                    Coordinate with clients, complete tasks, and mark them finished to enable reviews.
                  </p>
                </div>
              </div>

              {activeJobs.length === 0 ? (
                <EmptyState
                  title="No active jobs"
                  message="Accept an incoming request to start working on it."
                />
              ) : (
                <div className="dash-cards-stack">
                  {activeJobs.map((req) => (
                    <RequestCard
                      key={req.id || req._id}
                      request={req}
                      userRole="provider"
                      onViewDetails={(r) => { setSelectedDetailsReq(r); setDetailsModalOpen(true); }}
                      onComplete={(r) =>
                        setConfirmModal({ isOpen: true, action: 'complete', request: r, notes: '' })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: COMPLETED JOBS */}
          {activeTab === 'completed' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Completed Jobs History ({completedJobs.length})</h1>
                  <p className="dash-subheading">
                    Record of all finished tasks delivered across Dera Ismail Khan.
                  </p>
                </div>
              </div>

              {completedJobs.length === 0 ? (
                <EmptyState
                  title="No completed jobs yet"
                  message="Finished jobs will appear here in your work history."
                />
              ) : (
                <div className="dash-cards-stack">
                  {completedJobs.map((req) => (
                    <RequestCard
                      key={req.id || req._id}
                      request={req}
                      userRole="provider"
                      onViewDetails={(r) => { setSelectedDetailsReq(r); setDetailsModalOpen(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: VERIFICATION & DOCUMENTS */}
          {activeTab === 'verification' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Verification & Trade Credentials</h1>
                  <p className="dash-subheading">
                    Upload your CNIC, government trade certificate, or shop license to get verified by Admin.
                  </p>
                </div>
                <Badge tone={isApproved ? 'success' : providerStatus === 'rejected' ? 'danger' : 'warning'}>
                  {providerStatus.toUpperCase()}
                </Badge>
              </div>

              <Card as="div" className="dash-profile-card">
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    CNIC / National Identity Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12101-1234567-1"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={proProfile.cnic}
                    onChange={(e) => setProProfile({ ...proProfile, cnic: e.target.value })}
                  />
                  <small style={{ color: '#64748b', fontSize: '12px' }}>
                    Required for government identity verification in D.I. Khan.
                  </small>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    Upload Trade Documents / Certifications
                  </label>
                  <div style={{ border: '2px dashed #cbd5e1', padding: '24px', textAlign: 'center', borderRadius: '8px', background: '#f8fafc' }}>
                    <FaUpload size={28} color="#30497d" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                      Click to choose file or drag & drop
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 12px 0' }}>
                      CNIC copy, Trade Diploma, Apprenticeship certificate, or Shop photo (Max 10 MB: JPG, PNG, PDF)
                    </div>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                      {uploadingDoc ? 'Uploading...' : 'Select File'}
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleDocumentUpload}
                        disabled={uploadingDoc}
                        className="visually-hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Document List */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b' }}>
                    Uploaded Documents ({providerDoc?.documents?.length || 0})
                  </h4>
                  {!providerDoc?.documents || providerDoc.documents.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>No documents uploaded yet.</p>
                  ) : (
                    <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#334155' }}>
                      {providerDoc.documents.map((doc, idx) => {
                        const fullUrl = doc.url.startsWith('http') ? doc.url : `http://localhost:5000${doc.url}`;
                        return (
                          <li key={idx} style={{ marginBottom: '8px' }}>
                            <a href={fullUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>
                              {doc.name} <FaExternalLinkAlt size={10} />
                            </a>{' '}
                            — <small style={{ color: '#94a3b8' }}>{new Date(doc.uploadedAt).toLocaleDateString()}</small>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="dash-form-actions" style={{ marginTop: '20px' }}>
                  <Button type="button" variant="primary" onClick={handleProfileSave}>
                    Save Verification Info
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: SERVICES & RATES */}
          {activeTab === 'services' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Manage Services & Rates</h1>
                  <p className="dash-subheading">
                    Update your trade specialization, starting inspection fee, and working hours.
                  </p>
                </div>
              </div>

              <Card as="div" className="dash-profile-card">
                <form onSubmit={handleProfileSave}>
                  <Input
                    label="Primary Trade / Title"
                    name="service"
                    value={proProfile.service}
                    onChange={(e) => setProProfile({ ...proProfile, service: e.target.value })}
                    required
                  />

                  <div className="form-row-two">
                    <Input
                      label="Starting Inspection / Call-out Fee (PKR)"
                      name="startingPrice"
                      type="number"
                      value={proProfile.startingPrice}
                      onChange={(e) => setProProfile({ ...proProfile, startingPrice: e.target.value })}
                      required
                    />

                    <Input
                      label="Years of Experience"
                      name="experience"
                      type="number"
                      value={proProfile.experience}
                      onChange={(e) => setProProfile({ ...proProfile, experience: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="Working Hours"
                    name="workingHours"
                    value={proProfile.workingHours}
                    onChange={(e) => setProProfile({ ...proProfile, workingHours: e.target.value })}
                    placeholder="e.g. 8:00 AM - 9:00 PM"
                    required
                  />

                  <Textarea
                    label="Short Professional Bio"
                    name="shortDescription"
                    value={proProfile.shortDescription}
                    onChange={(e) => setProProfile({ ...proProfile, shortDescription: e.target.value })}
                    rows={3}
                  />

                  <div className="dash-form-actions">
                    <Button type="submit" variant="primary">
                      Save Rates & Profile
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB: SERVICE AREAS */}
          {activeTab === 'areas' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Service Areas in D.I. Khan</h1>
                  <p className="dash-subheading">
                    Check the areas where you are available to travel for on-site client calls.
                  </p>
                </div>
              </div>

              <Card as="div" className="dash-profile-card">
                <div className="areas-selection-grid">
                  {DI_KHAN_AREAS.map((area) => {
                    const isSelected = proProfile.serviceAreas.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        className={`area-checkbox-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArea(area)}
                      >
                        <span className="area-check-dot" />
                        {area}
                      </button>
                    );
                  })}
                </div>

                <div className="dash-form-actions">
                  <Button type="button" variant="primary" onClick={handleProfileSave}>
                    Save Selected Areas
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Customer Reviews ({reviews.length})</h1>
                  <p className="dash-subheading">
                    Direct feedback and ratings from customers you served in D.I. Khan.
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <EmptyState
                  title="No reviews yet"
                  message="Complete jobs successfully to build your verified reputation in Dera Ismail Khan."
                />
              ) : (
                <div className="dash-cards-stack">
                  {reviews.map((rev) => (
                    <ReviewCard key={rev.id || rev._id} review={rev} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION / ACTION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: '', request: null, notes: '' })}
        onConfirm={handleAction}
        title={
          confirmModal.action === 'accept'
            ? 'Accept Service Job'
            : confirmModal.action === 'complete'
              ? 'Mark Job as Completed'
              : 'Decline Job Request'
        }
        message={
          confirmModal.action === 'accept'
            ? `Accept job #${confirmModal.request?.requestId || confirmModal.request?.id} (${confirmModal.request?.service} in ${confirmModal.request?.area})? The customer will receive your contact details.`
            : confirmModal.action === 'complete'
              ? `Have you completed the work for #${confirmModal.request?.requestId || confirmModal.request?.id}? The customer will be invited to leave a review.`
              : `Are you sure you want to decline job #${confirmModal.request?.requestId || confirmModal.request?.id}?`
        }
        confirmText={
          confirmModal.action === 'accept'
            ? 'Yes, Accept Job'
            : confirmModal.action === 'complete'
              ? 'Yes, Mark Completed'
              : 'Decline Job'
        }
        confirmVariant={confirmModal.action === 'reject' ? 'danger' : 'primary'}
      />

      {/* REQUEST DETAILS MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Job Details: ${selectedDetailsReq?.service || ''}`}
        size="lg"
      >
        {selectedDetailsReq && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <strong>ID: {selectedDetailsReq.requestId || selectedDetailsReq.id}</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedDetailsReq.category}</div>
              </div>
              <RequestStatusBadge status={selectedDetailsReq.status} />
            </div>

            <div>
              <strong>Customer Problem Description:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px' }}>
                {selectedDetailsReq.description}
              </p>
            </div>

            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '6px' }}>
              <div><strong>Client:</strong> {selectedDetailsReq.customerName}</div>
              {selectedDetailsReq.customerPhone && (
                <div><strong>Phone:</strong> <a href={`tel:${selectedDetailsReq.customerPhone.replace(/\s+/g, '')}`}>📞 {selectedDetailsReq.customerPhone}</a></div>
              )}
              <div><strong>Location:</strong> {selectedDetailsReq.area} — {selectedDetailsReq.address}</div>
              <div><strong>Time:</strong> {selectedDetailsReq.preferredDate || 'Flexible'} ({selectedDetailsReq.preferredTime})</div>
              {selectedDetailsReq.budget ? <div><strong>Budget:</strong> Rs. {selectedDetailsReq.budget}</div> : null}
            </div>

            {selectedDetailsReq.attachments && selectedDetailsReq.attachments.length > 0 && (
              <div>
                <strong>Photos / Attachments:</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {selectedDetailsReq.attachments.map((att, idx) => {
                    const fullUrl = att.url.startsWith('http') ? att.url : `http://localhost:5000${att.url}`;
                    return (
                      <a key={idx} href={fullUrl} target="_blank" rel="noreferrer">
                        <img src={fullUrl} alt={att.filename} style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
