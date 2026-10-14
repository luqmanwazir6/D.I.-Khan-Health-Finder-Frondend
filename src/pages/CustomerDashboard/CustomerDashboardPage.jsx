import { useState, useEffect, useCallback } from 'react';
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
  FaBell,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPaperclip,
  FaPhoneAlt,
  FaTimes,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaFileAlt,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/requestService';
import { providerService } from '@/services/providerService';
import { reviewService } from '@/services/reviewService';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { REQUEST_STATUS, CANCELLABLE_STATUSES } from '@/constants/requestStatus';
import { ROUTES } from '@/constants/routes';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatCard from '@/components/dashboard/StatCard';
import RequestCard from '@/components/requests/RequestCard';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import ProviderCard from '@/components/providers/ProviderCard';
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
  const [_reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
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

  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetailsReq, setSelectedDetailsReq] = useState(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    area: user?.area || '',
    address: user?.address || '',
  });

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqRes, provRes, revRes, notifRes] = await Promise.all([
        requestService.getRequests(),
        providerService.getProviders({ limit: 4 }),
        reviewService.getReviews(),
        notificationService.getNotifications(),
      ]);

      const allReqs = reqRes.data || [];
      const currentUserId = (user?.id || user?._id || '').toString();
      const currentUserEmail = (user?.email || '').toLowerCase();

      // Ensure data belongs to customer if in mixed fallback mode
      let myReqs = allReqs;
      if (allReqs.some((r) => r.customerId && r.customerId !== currentUserId)) {
        myReqs = allReqs.filter((r) => {
          const matchId = currentUserId && (
            r.customerId === currentUserId ||
            r.customer === currentUserId ||
            r.customer?._id === currentUserId
          );
          const matchEmail = currentUserEmail && (
            (r.customerEmail && r.customerEmail.toLowerCase() === currentUserEmail) ||
            (r.customer?.email && r.customer.email.toLowerCase() === currentUserEmail)
          );
          return matchId || matchEmail;
        });
      }

      setRequests(myReqs);
      setSavedProviders(provRes.data || []);
      setReviews(revRes.data || []);
      if (notifRes?.data) {
        setNotifications(notifRes.data.notifications || []);
        setUnreadNotifCount(notifRes.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load customer dashboard', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  const handleOpenDetails = (req) => {
    setSelectedDetailsReq(req);
    setDetailsModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!targetCancelRequest) return;
    try {
      const targetId = targetCancelRequest._id || targetCancelRequest.id;
      await requestService.cancelRequest(targetId);
      setCancelModalOpen(false);
      setDetailsModalOpen(false);
      setSuccessMsg(`Service request #${targetCancelRequest.requestId || targetId} has been cancelled.`);
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
      setDetailsModalOpen(false);
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

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setUnreadNotifCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
    { id: 'requests', label: 'My Requests', icon: <FaClipboardList />, count: requests.length },
    { id: 'notifications', label: 'Updates & Alerts', icon: <FaBell />, count: unreadNotifCount },
    { id: 'saved', label: 'Recommended Pros', icon: <FaHeart /> },
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
                  tone="info"
                />
                <StatCard
                  title="Completed"
                  value={completedCount}
                  subtitle="Resolved jobs"
                  icon={<FaCheckCircle />}
                  tone="success"
                />
              </div>

              {/* Recent Requests Box */}
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
                        key={req.id || req._id}
                        request={req}
                        userRole="customer"
                        onViewDetails={handleOpenDetails}
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
                    Track status in real-time, inspect attachments, or coordinate with assigned professionals.
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
              ) : requests.length === 0 ? (
                <EmptyState
                  title="No service requests yet"
                  message="You haven't posted any service requests yet. Looking for a trusted plumber, electrician, or craftsman in D.I. Khan?"
                  actionLabel="Post Service Request"
                  onAction={() => navigate(ROUTES.NEW_REQUEST)}
                />
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
                      key={req.id || req._id}
                      request={req}
                      userRole="customer"
                      onViewDetails={handleOpenDetails}
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

          {/* TAB: NOTIFICATIONS / UPDATES */}
          {activeTab === 'notifications' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Updates & Alerts</h1>
                  <p className="dash-subheading">Real-time status updates on your service bookings in D.I. Khan.</p>
                </div>
                {unreadNotifCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    Mark all as read
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <EmptyState
                  title="No updates right now"
                  message="When a professional accepts your request or changes status, you will see notifications here."
                />
              ) : (
                <div className="dash-cards-stack">
                  {notifications.map((n) => (
                    <Card
                      key={n._id}
                      style={{
                        borderLeft: n.isRead ? '3px solid #cbd5e1' : '3px solid #f2842f',
                        background: n.isRead ? '#ffffff' : '#fffbeb',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#1e293b' }}>{n.title}</strong>
                          <p style={{ margin: '4px 0 6px 0', fontSize: '14px', color: '#475569' }}>{n.message}</p>
                          <small style={{ color: '#94a3b8', fontSize: '12px' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </small>
                        </div>
                        {!n.isRead && (
                          <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                            New
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED / RECOMMENDED PROVIDERS */}
          {activeTab === 'saved' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Recommended Professionals</h1>
                  <p className="dash-subheading">
                    Verified technicians and craftsmen available in Dera Ismail Khan.
                  </p>
                </div>
              </div>

              <div className="dash-cards-stack">
                {savedProviders.map((prov) => (
                  <ProviderCard key={prov.id || prov._id} provider={prov} />
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
                  <p className="dash-subheading">Update your contact information for technicians to find your address.</p>
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

      {/* REQUEST DETAILS MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Request Details: ${selectedDetailsReq?.service || ''}`}
        size="lg"
      >
        {selectedDetailsReq && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedDetailsReq.category}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#0f172a' }}>
                  ID: {selectedDetailsReq.requestId || selectedDetailsReq.id}
                </h3>
              </div>
              <RequestStatusBadge status={selectedDetailsReq.status} />
            </div>

            {/* Description */}
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#334155' }}>Problem Description</h4>
              <p style={{ margin: 0, padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', color: '#1e293b' }}>
                {selectedDetailsReq.description}
              </p>
            </div>

            {/* Location & Time Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#f1f5f9', padding: '14px', borderRadius: '8px' }}>
              <div>
                <small style={{ color: '#64748b', display: 'block' }}>Location</small>
                <strong>{selectedDetailsReq.area}</strong>
                <div style={{ fontSize: '13px', color: '#334155' }}>{selectedDetailsReq.address}</div>
              </div>
              <div>
                <small style={{ color: '#64748b', display: 'block' }}>Schedule</small>
                <strong>{selectedDetailsReq.preferredDate || 'Flexible'}</strong>
                <div style={{ fontSize: '13px', color: '#334155' }}>{selectedDetailsReq.preferredTime}</div>
              </div>
              <div>
                <small style={{ color: '#64748b', display: 'block' }}>Estimated Budget</small>
                <strong>{selectedDetailsReq.budget ? `Rs. ${Number(selectedDetailsReq.budget).toLocaleString()}` : 'Negotiable'}</strong>
              </div>
              <div>
                <small style={{ color: '#64748b', display: 'block' }}>Assigned Professional</small>
                <strong>{selectedDetailsReq.providerName || 'Pending Assignment'}</strong>
                {selectedDetailsReq.providerPhone && (
                  <div style={{ fontSize: '13px', color: '#2563eb' }}>
                    <a href={`tel:${selectedDetailsReq.providerPhone.replace(/\s+/g, '')}`}>📞 {selectedDetailsReq.providerPhone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Attached Files / Photos */}
            {selectedDetailsReq.attachments && selectedDetailsReq.attachments.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaPaperclip /> Attached Photos / Documents ({selectedDetailsReq.attachments.length})
                </h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedDetailsReq.attachments.map((att, idx) => {
                    const fullUrl = att.url.startsWith('http') ? att.url : `http://localhost:5000${att.url}`;
                    const isImg = att.mimetype?.includes('image') || att.url?.match(/\.(jpg|jpeg|png|webp)$/i);
                    return (
                      <a
                        key={idx}
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#ffffff',
                          display: 'block',
                          width: '140px',
                        }}
                      >
                        {isImg ? (
                          <img
                            src={fullUrl}
                            alt={att.filename}
                            style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#30497d', fontSize: '28px' }}>
                            <FaFileAlt />
                          </div>
                        )}
                        <div style={{ padding: '6px', fontSize: '11px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.filename}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            {selectedDetailsReq.statusHistory && selectedDetailsReq.statusHistory.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Status History Timeline</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
                  {selectedDetailsReq.statusHistory.map((sh, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#0f172a' }}>{sh.status.toUpperCase()}</strong>: {sh.note || 'Status updated'} — <small style={{ color: '#94a3b8' }}>{new Date(sh.timestamp).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions in details modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              {CANCELLABLE_STATUSES.includes(selectedDetailsReq.status) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTargetCancelRequest(selectedDetailsReq);
                    setCancelModalOpen(true);
                  }}
                >
                  Cancel Request
                </Button>
              )}
              {selectedDetailsReq.status === REQUEST_STATUS.COMPLETED && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setTargetReviewRequest(selectedDetailsReq);
                    setReviewModalOpen(true);
                  }}
                >
                  ★ Write Review
                </Button>
              )}
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL REQUEST CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Service Request"
        message={`Are you sure you want to cancel service request #${targetCancelRequest?.requestId || targetCancelRequest?.id}? The technician will be notified.`}
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
