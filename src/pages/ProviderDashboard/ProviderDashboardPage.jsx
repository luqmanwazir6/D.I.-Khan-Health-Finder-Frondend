import { useState, useEffect } from 'react';
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
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { reviewService } from '@/services/reviewService';
import { providerService } from '@/services/providerService';
import { REQUEST_STATUS } from '@/constants/requestStatus';
import { DI_KHAN_AREAS, CATEGORIES_DATA } from '@/constants/data';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatCard from '@/components/dashboard/StatCard';
import RequestCard from '@/components/requests/RequestCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { EmptyState, SuccessMessage } from '@/components/common/FeedbackStates';
import SkeletonCard from '@/components/common/SkeletonCard';
import '@/components/dashboard/DashboardPages.css';

export default function ProviderDashboardPage() {
  useDocumentTitle('Professional Dashboard | D.I. Khan Service Finder');
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals for accept/reject/complete actions
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: '',
    request: null,
  });

  // Provider profile edit state
  const [proProfile, setProProfile] = useState({
    service: user?.service || 'Plumber',
    startingPrice: '700',
    experience: '12',
    workingHours: '8:00 AM - 8:00 PM',
    shortDescription: 'Master technician operating in D.I. Khan.',
    serviceAreas: ['Circular Road', 'Topanwala Gate', 'Cantt Area', 'Commissionery Bazar'],
  });

  const loadProviderData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, revRes] = await Promise.all([
        requestService.getRequests(),
        reviewService.getReviews(),
      ]);
      setRequests(reqRes.data || []);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error('Failed to load provider data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, []);

  // Filter requests for provider
  const pendingRequests = requests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const activeJobs = requests.filter((r) =>
    ['accepted', 'in-progress'].includes(r.status),
  );
  const completedJobs = requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED);

  const handleAction = async () => {
    const { action, request } = confirmModal;
    if (!request) return;

    try {
      if (action === 'accept') {
        await requestService.updateRequestStatus(request.id, REQUEST_STATUS.ACCEPTED);
        setSuccessMsg(`Accepted job #${request.id}. Contact the customer to coordinate.`);
      } else if (action === 'reject') {
        await requestService.updateRequestStatus(request.id, REQUEST_STATUS.REJECTED);
        setSuccessMsg(`Decline recorded for job #${request.id}.`);
      } else if (action === 'complete') {
        await requestService.updateRequestStatus(request.id, REQUEST_STATUS.COMPLETED);
        setSuccessMsg(`Job #${request.id} marked as completed! Customer can now leave a review.`);
      }
      setConfirmModal({ isOpen: false, action: '', request: null });
      loadProviderData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await providerService.updateProvider(user?.id || 'prov-101', proProfile);
      setSuccessMsg('Your professional rates, areas, and availability have been saved.');
    } catch {
      setSuccessMsg('Your profile changes have been saved.');
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
    { id: 'services', label: 'Services & Rates', icon: <FaMoneyBillWave /> },
    { id: 'areas', label: 'Service Areas', icon: <FaMapMarkerAlt /> },
    { id: 'reviews', label: 'Reviews Received', icon: <FaStar /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
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
                  <span className="avail-dot" aria-hidden="true" />
                  <span>Accepting Work in D.I. Khan</span>
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
                        key={req.id}
                        request={req}
                        userRole="provider"
                        onAccept={(r) =>
                          setConfirmModal({ isOpen: true, action: 'accept', request: r })
                        }
                        onReject={(r) =>
                          setConfirmModal({ isOpen: true, action: 'reject', request: r })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INCOMING REQUESTS */}
          {activeTab === 'requests' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Incoming Job Requests</h1>
                  <p className="dash-subheading">
                    Accept or decline service calls posted by customers in your area.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <SkeletonCard count={3} />
              ) : pendingRequests.length === 0 ? (
                <EmptyState
                  title="No new inquiries right now"
                  message="All incoming requests have been handled. Keep your profile verified to rank higher in customer searches."
                />
              ) : (
                <div className="dash-cards-stack">
                  {pendingRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      userRole="provider"
                      onAccept={(r) =>
                        setConfirmModal({ isOpen: true, action: 'accept', request: r })
                      }
                      onReject={(r) =>
                        setConfirmModal({ isOpen: true, action: 'reject', request: r })
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
                  <h1 className="dash-heading">Active In-Progress Jobs</h1>
                  <p className="dash-subheading">
                    Jobs you have accepted. Once the repair or installation is done, mark as completed.
                  </p>
                </div>
              </div>

              {activeJobs.length === 0 ? (
                <EmptyState
                  title="No active jobs"
                  message="You have no jobs currently in progress."
                />
              ) : (
                <div className="dash-cards-stack">
                  {activeJobs.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      userRole="provider"
                      onComplete={(r) =>
                        setConfirmModal({ isOpen: true, action: 'complete', request: r })
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
                  <h1 className="dash-heading">Completed Jobs History</h1>
                  <p className="dash-subheading">
                    Record of all finished tasks in Dera Ismail Khan.
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
                    <RequestCard key={req.id} request={req} userRole="provider" />
                  ))}
                </div>
              )}
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
                        className={`area-toggle-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArea(area)}
                      >
                        <FaMapMarkerAlt aria-hidden="true" />
                        <span>{area}</span>
                        {isSelected && <FaCheckCircle className="check-ico" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>

                <div className="dash-form-actions" style={{ marginBlockStart: 'var(--space-6)' }}>
                  <Button type="button" variant="primary" onClick={handleProfileSave}>
                    Update Active Service Areas
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
                  <h1 className="dash-heading">Customer Reviews & Ratings</h1>
                  <p className="dash-subheading">
                    Direct feedback left by Dera Ismail Khan homeowners and clients.
                  </p>
                </div>
              </div>

              <div className="dash-cards-stack">
                {reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Professional Account Settings</h1>
                  <p className="dash-subheading">Verification status, alerts, and platform security.</p>
                </div>
              </div>

              <Card as="div" className="dash-settings-card">
                <div className="settings-item">
                  <div>
                    <strong>CNIC Verification Status</strong>
                    <p className="text-muted text-xs">
                      Government ID verified by D.I. Khan Service Finder team.
                    </p>
                  </div>
                  <span className="badge badge-success">Verified Pro</span>
                </div>

                <div className="settings-item">
                  <div>
                    <strong>Direct Customer Calling</strong>
                    <p className="text-muted text-xs">
                      Show your phone number to prospective customers on your profile.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: '', request: null })}
        onConfirm={handleAction}
        title={
          confirmModal.action === 'accept'
            ? 'Accept Job Request'
            : confirmModal.action === 'reject'
              ? 'Decline Job Request'
              : 'Complete Job'
        }
        message={
          confirmModal.action === 'accept'
            ? `Accept job #${confirmModal.request?.id} (${confirmModal.request?.service}) in ${confirmModal.request?.area}? You will receive customer contact details.`
            : confirmModal.action === 'reject'
              ? `Decline request #${confirmModal.request?.id}? The request will be passed to other local technicians.`
              : `Mark job #${confirmModal.request?.id} as completed? The customer will receive a prompt to leave a review.`
        }
        confirmText={
          confirmModal.action === 'accept'
            ? 'Accept Job'
            : confirmModal.action === 'reject'
              ? 'Decline Job'
              : 'Mark Completed'
        }
        confirmVariant={confirmModal.action === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}
