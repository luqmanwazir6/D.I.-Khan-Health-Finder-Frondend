import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaClipboardList,
  FaHeart,
  FaStar,
  FaUser,
  FaCog,
  FaPlus,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { providerService } from '@/services/providerService';
import { reviewService } from '@/services/reviewService';
import { userService } from '@/services/userService';
import { REQUEST_STATUS } from '@/constants/requestStatus';
import { ROUTES } from '@/constants/routes';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatCard from '@/components/dashboard/StatCard';
import RequestCard from '@/components/requests/RequestCard';
import ProviderCard from '@/components/providers/ProviderCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ReviewForm from '@/components/reviews/ReviewForm';
import { EmptyState, SuccessMessage } from '@/components/common/FeedbackStates';
import SkeletonCard from '@/components/common/SkeletonCard';
import '@/components/dashboard/DashboardPages.css';

export default function CustomerDashboardPage() {
  useDocumentTitle('Customer Dashboard | D.I. Khan Service Finder');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [savedProviders, setSavedProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Status filter within requests tab
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetCancelRequest, setTargetCancelRequest] = useState(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [targetReviewRequest, setTargetReviewRequest] = useState(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    area: user?.area || '',
    address: user?.address || '',
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, provRes, revRes] = await Promise.all([
        requestService.getRequests(),
        providerService.getProviders({ limit: 2 }),
        reviewService.getReviews(),
      ]);
      setRequests(reqRes.data || []);
      setSavedProviders(provRes.data || []);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error('Failed to load customer dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filtered requests
  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  // Stats calculation
  const pendingCount = requests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;
  const activeCount = requests.filter((r) =>
    ['accepted', 'in-progress'].includes(r.status),
  ).length;
  const completedCount = requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED).length;

  const handleCancelConfirm = async () => {
    if (!targetCancelRequest) return;
    try {
      await requestService.cancelRequest(targetCancelRequest.id);
      setCancelModalOpen(false);
      setSuccessMsg(`Service request #${targetCancelRequest.id} has been cancelled.`);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!targetReviewRequest) return;
    try {
      await reviewService.createReview({
        providerId: targetReviewRequest.providerId,
        userName: user?.name || 'Verified Customer',
        userCity: `D.I. Khan (${user?.area || 'Cantt'})`,
        rating,
        comment,
      });
      setReviewModalOpen(false);
      setSuccessMsg('Thank you! Your review has been recorded.');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(profileData);
      setSuccessMsg('Your profile details were updated successfully.');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
    { id: 'requests', label: 'My Requests', icon: <FaClipboardList />, count: requests.length },
    { id: 'saved', label: 'Saved Professionals', icon: <FaHeart /> },
    { id: 'reviews', label: 'My Reviews', icon: <FaStar /> },
    { id: 'profile', label: 'My Profile', icon: <FaUser /> },
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
                  <h1 className="dash-heading">Customer Overview</h1>
                  <p className="dash-subheading">
                    Welcome back, {user?.name}. Manage your active home service tasks in Dera Ismail Khan.
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={<FaPlus />}
                  onClick={() => navigate(ROUTES.NEW_REQUEST)}
                >
                  Post New Request
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="dash-stats-grid">
                <StatCard
                  title="Total Requests"
                  value={requests.length}
                  subtitle="All-time bookings"
                  icon={<FaClipboardList />}
                  tone="primary"
                />
                <StatCard
                  title="Pending"
                  value={pendingCount}
                  subtitle="Awaiting response"
                  icon={<FaClock />}
                  tone="warning"
                />
                <StatCard
                  title="In Progress"
                  value={activeCount}
                  subtitle="Technicians dispatched"
                  icon={<FaClock />}
                  tone="primary"
                />
                <StatCard
                  title="Completed"
                  value={completedCount}
                  subtitle="Resolved jobs"
                  icon={<FaCheckCircle />}
                  tone="success"
                />
              </div>

              {/* Recent Requests Section */}
              <div className="dash-section-box">
                <div className="dash-section-header">
                  <h2>Recent Service Requests</h2>
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
                ) : requests.length === 0 ? (
                  <EmptyState
                    title="No service requests yet"
                    message="You haven't posted any service requests. Need a plumber, electrician, or AC technician in D.I. Khan?"
                    actionLabel="Post Service Request"
                    onAction={() => navigate(ROUTES.NEW_REQUEST)}
                  />
                ) : (
                  <div className="dash-cards-stack">
                    {requests.slice(0, 3).map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        userRole="customer"
                        onCancel={(r) => {
                          setTargetCancelRequest(r);
                          setCancelModalOpen(true);
                        }}
                        onReview={(r) => {
                          setTargetReviewRequest(r);
                          setReviewModalOpen(true);
                        }}
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
                  <h1 className="dash-heading">My Service Requests</h1>
                  <p className="dash-subheading">
                    Track status, cancel unassigned jobs, or leave reviews for completed tasks.
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={<FaPlus />}
                  onClick={() => navigate(ROUTES.NEW_REQUEST)}
                >
                  New Request
                </Button>
              </div>

              {/* Status filter buttons */}
              <div className="status-filter-pills" role="tablist">
                {['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'].map(
                  (st) => (
                    <button
                      type="button"
                      key={st}
                      className={`status-pill ${statusFilter === st ? 'active' : ''}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st === 'all' ? 'All' : st.replace('-', ' ')}
                    </button>
                  ),
                )}
              </div>

              {isLoading ? (
                <SkeletonCard count={3} />
              ) : filteredRequests.length === 0 ? (
                <EmptyState
                  title="No requests match this status"
                  message="There are no service requests matching the selected filter."
                  actionLabel="Show all requests"
                  onAction={() => setStatusFilter('all')}
                />
              ) : (
                <div className="dash-cards-stack">
                  {filteredRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      userRole="customer"
                      onCancel={(r) => {
                        setTargetCancelRequest(r);
                        setCancelModalOpen(true);
                      }}
                      onReview={(r) => {
                        setTargetReviewRequest(r);
                        setReviewModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED PROVIDERS */}
          {activeTab === 'saved' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Saved Professionals</h1>
                  <p className="dash-subheading">
                    Technicians and craftsmen you have bookmarked for future work.
                  </p>
                </div>
              </div>

              <div className="dash-cards-stack">
                {savedProviders.map((prov) => (
                  <ProviderCard key={prov.id} provider={prov} />
                ))}
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">My Reviews & Ratings</h1>
                  <p className="dash-subheading">
                    Feedback you have submitted for professionals in D.I. Khan.
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

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">My Profile</h1>
                  <p className="dash-subheading">
                    Manage your contact details and default service address in Dera Ismail Khan.
                  </p>
                </div>
              </div>

              <Card as="div" className="dash-profile-card">
                <form onSubmit={handleProfileSave}>
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    required
                  />

                  <Input
                    label="Neighborhood / Area in D.I. Khan"
                    name="area"
                    value={profileData.area}
                    onChange={(e) => setProfileData({ ...profileData, area: e.target.value })}
                    placeholder="e.g. Cantt Area, Topanwala Gate"
                    required
                  />

                  <Input
                    label="Street / House Address"
                    name="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="House #, Street name"
                    required
                  />

                  <div className="dash-form-actions">
                    <Button type="submit" variant="primary">
                      Save Profile
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Account Settings</h1>
                  <p className="dash-subheading">Security, notifications, and preferences.</p>
                </div>
              </div>

              <Card as="div" className="dash-settings-card">
                <div className="settings-item">
                  <div>
                    <strong>SMS Job Notifications</strong>
                    <p className="text-muted text-xs">
                      Receive an SMS whenever a technician accepts or completes your request.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>

                <div className="settings-item">
                  <div>
                    <strong>City Default</strong>
                    <p className="text-muted text-xs">
                      Current primary location: Dera Ismail Khan, KP
                    </p>
                  </div>
                  <span className="badge badge-primary">Active</span>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* CANCEL REQUEST CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Service Request"
        message={`Are you sure you want to cancel service request #${targetCancelRequest?.id}? The technician will be notified.`}
        confirmText="Yes, Cancel Request"
        confirmVariant="danger"
      />

      {/* WRITE REVIEW MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review Completed Service: ${targetReviewRequest?.service}`}
        size="md"
      >
        <ReviewForm
          providerName={targetReviewRequest?.providerName || 'the Professional'}
          onSubmit={handleReviewSubmit}
          onCancel={() => setReviewModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
