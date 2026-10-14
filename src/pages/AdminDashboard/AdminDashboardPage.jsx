import { useState, useEffect, useCallback } from 'react';
import {
  FaTachometerAlt,
  FaUserTie,
  FaUsers,
  FaClipboardList,
  FaThList,
  FaStar,
  FaChartBar,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaPaperclip,
  FaEye,
  FaCheck,
  FaTimes,
  FaUserCheck,
  FaUserTimes,
  FaExternalLinkAlt,
  FaFileAlt,
  FaClock,
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { providerService } from '@/services/providerService';
import { requestService } from '@/services/requestService';
import { reviewService } from '@/services/reviewService';
import { categoryService } from '@/services/categoryService';
import { adminService } from '@/services/adminService';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatCard from '@/components/dashboard/StatCard';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import { SuccessMessage } from '@/components/common/FeedbackStates';
import SkeletonCard from '@/components/common/SkeletonCard';
import '@/components/dashboard/DashboardPages.css';

export default function AdminDashboardPage() {
  useDocumentTitle('Platform Administration | D.I. Khan Service Finder');

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering for providers tab: 'all' | 'pending' | 'active' | 'rejected'
  const [proFilter, setProFilter] = useState('all');

  // Filtering for requests tab: 'all' | 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled'
  const [reqFilter, setReqFilter] = useState('all');

  // Modals
  const [manageReqModal, setManageReqModal] = useState({
    isOpen: false,
    request: null,
    selectedProId: '',
    status: '',
    note: '',
  });

  const [rejectProModal, setRejectProModal] = useState({
    isOpen: false,
    provider: null,
    reason: '',
  });

  const [viewProModal, setViewProModal] = useState({
    isOpen: false,
    provider: null,
  });

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, custRes, pRes, rRes, revRes, cRes] = await Promise.all([
        adminService.getStats().catch(() => null),
        adminService.getUsers('customer').catch(() => ({ data: [] })),
        providerService.getProviders({ limit: 100 }),
        requestService.getRequests({ isAdmin: true }),
        reviewService.getReviews(),
        categoryService.getCategories(),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      setCustomers(custRes?.data || []);
      setProviders(pRes?.data || []);
      setRequests(rRes?.data || []);
      setReviews(revRes?.data || []);
      setCategories(cRes?.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Professional actions
  const handleApproveProvider = async (providerId) => {
    try {
      await adminService.approveProvider(providerId);
      setSuccessMsg('Professional application approved! Status set to Active.');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to approve professional');
    }
  };

  const handleRejectProviderSubmit = async (e) => {
    e.preventDefault();
    if (!rejectProModal.provider) return;
    try {
      const pId = rejectProModal.provider._id || rejectProModal.provider.id;
      await adminService.rejectProvider(pId, rejectProModal.reason);
      setRejectProModal({ isOpen: false, provider: null, reason: '' });
      setSuccessMsg('Professional application rejected and status updated.');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to reject professional');
    }
  };

  // Request management action
  const handleSaveRequestManagement = async (e) => {
    e.preventDefault();
    const req = manageReqModal.request;
    if (!req) return;

    try {
      const targetId = req._id || req.id;
      if (manageReqModal.selectedProId) {
        await adminService.assignRequest(targetId, manageReqModal.selectedProId);
      }
      if (manageReqModal.status && manageReqModal.status !== req.status) {
        await adminService.updateRequestStatus(targetId, manageReqModal.status, manageReqModal.note);
      }
      setManageReqModal({ isOpen: false, request: null, selectedProId: '', status: '', note: '' });
      setSuccessMsg(`Request #${req.requestId || targetId} updated successfully.`);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    }
  };

  // Filtered providers
  const filteredProviders =
    proFilter === 'all'
      ? providers
      : providers.filter((p) => p.status === proFilter || (proFilter === 'pending' && !p.isVerified));

  // Filtered requests
  const filteredRequests =
    reqFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === reqFilter);

  const pendingProsCount = providers.filter((p) => p.status === 'pending' || !p.isVerified).length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
    { id: 'customers', label: 'Customers', icon: <FaUsers />, count: customers.length },
    { id: 'providers', label: 'Professionals', icon: <FaUserTie />, count: pendingProsCount > 0 ? pendingProsCount : providers.length },
    { id: 'requests', label: 'All Requests', icon: <FaClipboardList />, count: pendingRequestsCount > 0 ? pendingRequestsCount : requests.length },
    { id: 'categories', label: 'Categories', icon: <FaThList />, count: categories.length },
    { id: 'reviews', label: 'Reviews', icon: <FaStar />, count: reviews.length },
    { id: 'settings', label: 'Platform Settings', icon: <FaCog /> },
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

          {isLoading ? (
            <div className="dashboard-tab-view">
              <SkeletonCard count={3} type="provider" />
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">Admin Platform Overview</h1>
                      <p className="dash-subheading">
                        Real-time operations, verification queue, and bookings in Dera Ismail Khan.
                      </p>
                    </div>
                    <span className="badge badge-primary">MongoDB Atlas Live</span>
                  </div>

                  {/* Real Stats Grid */}
                  <div className="dash-stats-grid">
                    <StatCard
                      title="Registered Customers"
                      value={stats?.customers?.total ?? customers.length}
                      subtitle={`${stats?.customers?.new30Days ?? customers.length} new in last 30d`}
                      icon={<FaUsers />}
                      tone="primary"
                    />
                    <StatCard
                      title="Total Professionals"
                      value={stats?.providers?.total ?? providers.length}
                      subtitle={`${stats?.providers?.pending ?? pendingProsCount} pending approval`}
                      icon={<FaUserTie />}
                      tone={pendingProsCount > 0 ? 'warning' : 'success'}
                    />
                    <StatCard
                      title="Total Job Requests"
                      value={stats?.requests?.total ?? requests.length}
                      subtitle={`${stats?.requests?.pending ?? pendingRequestsCount} awaiting dispatch`}
                      icon={<FaClipboardList />}
                      tone="info"
                    />
                    <StatCard
                      title="Completed Services"
                      value={stats?.requests?.completed ?? requests.filter((r) => r.status === 'completed').length}
                      subtitle="Successfully fulfilled"
                      icon={<FaCheckCircle />}
                      tone="success"
                    />
                  </div>

                  {/* Pending Verifications Alert Box */}
                  {pendingProsCount > 0 && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#92400e', fontSize: '15px' }}>
                            ⚠️ {pendingProsCount} Professional Application(s) Awaiting Review
                          </strong>
                          <p style={{ margin: '4px 0 0 0', color: '#b45309', fontSize: '13px' }}>
                            New technicians have registered and are waiting for admin approval before they can accept customer jobs.
                          </p>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => { setActiveTab('providers'); setProFilter('pending'); }}>
                          Review Now
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Recent Customer Requests */}
                  <div className="dash-section-box">
                    <div className="dash-section-header">
                      <h2>Recent Platform Bookings</h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('requests')}>
                        View all requests
                      </Button>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Request ID</th>
                            <th>Service</th>
                            <th>Customer</th>
                            <th>Area</th>
                            <th>Assigned Pro</th>
                            <th>Status</th>
                            <th>Manage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.slice(0, 5).map((r) => (
                            <tr key={r.id || r._id}>
                              <td>
                                <strong>{r.requestId || `#${(r.id || r._id).slice(-6)}`}</strong>
                              </td>
                              <td>{r.service}</td>
                              <td>
                                {r.customerName}
                                <small className="table-sub">{r.customerPhone}</small>
                              </td>
                              <td>{r.area}</td>
                              <td>{r.providerName || <span style={{ color: '#f59e0b', fontSize: '12px' }}>Unassigned</span>}</td>
                              <td>
                                <RequestStatusBadge status={r.status} />
                              </td>
                              <td>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setManageReqModal({
                                      isOpen: true,
                                      request: r,
                                      selectedProId: r.providerId || '',
                                      status: r.status,
                                      note: '',
                                    })
                                  }
                                >
                                  Manage
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">Registered Customers ({customers.length})</h1>
                      <p className="dash-subheading">
                        All local clients who have signed up and posted service requests in Dera Ismail Khan.
                      </p>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Contact Details</th>
                          <th>Location / Area</th>
                          <th>Total Requests</th>
                          <th>Joined Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c.id || c._id}>
                            <td>
                              <strong>{c.name}</strong>
                            </td>
                            <td>
                              <div>{c.email}</div>
                              <small className="table-sub">{c.phone}</small>
                            </td>
                            <td>{c.area || 'D.I. Khan City'}</td>
                            <td>
                              <span className="badge badge-primary">{c.requestCount || 0} bookings</span>
                            </td>
                            <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: PROVIDERS */}
              {activeTab === 'providers' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">Service Professionals ({providers.length})</h1>
                      <p className="dash-subheading">
                        Review applications, verify trade credentials, and approve technicians for active marketplace dispatch.
                      </p>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="status-filter-pills" role="tablist">
                    {[
                      { id: 'all', label: `All (${providers.length})` },
                      { id: 'pending', label: `Pending Approval (${pendingProsCount})` },
                      { id: 'active', label: `Approved (${providers.filter((p) => p.status === 'active').length})` },
                      { id: 'rejected', label: `Rejected (${providers.filter((p) => p.status === 'rejected').length})` },
                    ].map((f) => (
                      <button
                        type="button"
                        key={f.id}
                        className={`status-pill ${proFilter === f.id ? 'active' : ''}`}
                        onClick={() => setProFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Professional</th>
                          <th>Trade / Service</th>
                          <th>Area & Rate</th>
                          <th>Experience</th>
                          <th>Approval Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProviders.map((p) => {
                          const pId = p._id || p.id;
                          const isApproved = p.status === 'active' && p.isVerified;
                          const isPending = p.status === 'pending' || !p.isVerified;

                          return (
                            <tr key={pId}>
                              <td>
                                <strong>{p.name}</strong>
                                <small className="table-sub">{p.phone} • {p.email}</small>
                              </td>
                              <td>{p.service}</td>
                              <td>
                                {p.area || p.primaryArea || 'D.I. Khan'}
                                <small className="table-sub">Rs. {p.pricing?.amount || p.startingPrice || 500}</small>
                              </td>
                              <td>{p.experienceYears || p.experience || 1} yrs</td>
                              <td>
                                {isApproved ? (
                                  <Badge tone="success">Approved</Badge>
                                ) : p.status === 'rejected' ? (
                                  <Badge tone="danger">Rejected</Badge>
                                ) : (
                                  <Badge tone="warning">Pending Review</Badge>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewProModal({ isOpen: true, provider: p })}
                                  >
                                    View
                                  </Button>
                                  {isPending && (
                                    <>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleApproveProvider(pId)}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRejectProModal({ isOpen: true, provider: p, reason: '' })}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {isApproved && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setRejectProModal({ isOpen: true, provider: p, reason: 'Suspended by admin' })}
                                    >
                                      Revoke
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: REQUESTS */}
              {activeTab === 'requests' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">All Platform Requests ({requests.length})</h1>
                      <p className="dash-subheading">
                        Dispatch technicians, assign unassigned jobs, inspect photos, and update workflow status.
                      </p>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="status-filter-pills" role="tablist">
                    {['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'].map((st) => (
                      <button
                        type="button"
                        key={st}
                        className={`status-pill ${reqFilter === st ? 'active' : ''}`}
                        onClick={() => setReqFilter(st)}
                      >
                        {st === 'all' ? 'All' : st.replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Request ID</th>
                          <th>Service & Area</th>
                          <th>Customer</th>
                          <th>Assigned Pro</th>
                          <th>Budget</th>
                          <th>Attachments</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((r) => {
                          const rId = r._id || r.id;
                          const attCount = r.attachments?.length || 0;

                          return (
                            <tr key={rId}>
                              <td>
                                <strong>{r.requestId || `#${rId.slice(-6)}`}</strong>
                                <small className="table-sub">{new Date(r.createdAt).toLocaleDateString()}</small>
                              </td>
                              <td>
                                <strong>{r.service}</strong>
                                <small className="table-sub">{r.area} ({r.address})</small>
                              </td>
                              <td>
                                {r.customerName}
                                <small className="table-sub">{r.customerPhone}</small>
                              </td>
                              <td>
                                {r.providerName ? (
                                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{r.providerName}</span>
                                ) : (
                                  <span style={{ color: '#d97706', fontSize: '12px' }}>⚠️ Unassigned</span>
                                )}
                              </td>
                              <td>{r.budget ? `Rs. ${Number(r.budget).toLocaleString()}` : 'Negotiable'}</td>
                              <td>
                                {attCount > 0 ? (
                                  <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <FaPaperclip /> {attCount}
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>None</span>
                                )}
                              </td>
                              <td>
                                <RequestStatusBadge status={r.status} />
                              </td>
                              <td>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    setManageReqModal({
                                      isOpen: true,
                                      request: r,
                                      selectedProId: r.providerId || '',
                                      status: r.status,
                                      note: '',
                                    })
                                  }
                                >
                                  Manage
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">Service Categories & Sub-trades</h1>
                      <p className="dash-subheading">Taxonomy of services available in Dera Ismail Khan.</p>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Sub-services</th>
                          <th>Active Services</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((c) => (
                          <tr key={c.id || c._id}>
                            <td>
                              <strong>{c.name}</strong>
                              <p className="text-muted text-xs">{c.description}</p>
                            </td>
                            <td>
                              <div className="category-sub-tags">
                                {c.services?.map((s, idx) => (
                                  <span key={idx} className="badge badge-neutral">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>{c.services?.length || c.serviceCount || 0} trades</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">Customer Reviews Moderation</h1>
                      <p className="dash-subheading">Real feedback left by D.I. Khan customers.</p>
                    </div>
                  </div>

                  <div className="dash-cards-stack">
                    {reviews.map((rev) => (
                      <Card key={rev.id || rev._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong>{rev.userName} ({rev.userCity || 'D.I. Khan'})</strong>
                          <span className="badge badge-warning">★ {rev.rating}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#334155' }}>{rev.comment}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="dashboard-tab-view">
                  <div className="dashboard-header-row">
                    <div>
                      <h1 className="dash-heading">Platform Architecture & Settings</h1>
                      <p className="dash-subheading">Database, uploads, and system configurations.</p>
                    </div>
                  </div>

                  <Card as="div" className="dash-settings-card">
                    <div className="settings-item">
                      <div>
                        <strong>Database Storage Engine</strong>
                        <p className="text-muted text-xs">MongoDB Atlas Cluster (Remote Sharded Replica Set)</p>
                      </div>
                      <span className="badge badge-success">Connected</span>
                    </div>

                    <div className="settings-item">
                      <div>
                        <strong>File & Attachment Uploads</strong>
                        <p className="text-muted text-xs">Local Express Static Storage with Multer (Max 10 MB per file)</p>
                      </div>
                      <span className="badge badge-primary">Active</span>
                    </div>

                    <div className="settings-item">
                      <div>
                        <strong>Target Region</strong>
                        <p className="text-muted text-xs">Dera Ismail Khan, Khyber Pakhtunkhwa, Pakistan</p>
                      </div>
                      <span className="badge badge-primary">Live</span>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MANAGE REQUEST MODAL */}
      <Modal
        isOpen={manageReqModal.isOpen}
        onClose={() => setManageReqModal({ isOpen: false, request: null, selectedProId: '', status: '', note: '' })}
        title={`Manage Request: ${manageReqModal.request?.service || ''}`}
        size="lg"
      >
        {manageReqModal.request && (
          <form onSubmit={handleSaveRequestManagement}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Info summary */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>ID: {manageReqModal.request.requestId || manageReqModal.request.id}</strong>
                  <RequestStatusBadge status={manageReqModal.request.status} />
                </div>
                <div><strong>Customer:</strong> {manageReqModal.request.customerName} ({manageReqModal.request.customerPhone})</div>
                <div><strong>Area:</strong> {manageReqModal.request.area} — {manageReqModal.request.address}</div>
                <div><strong>Problem:</strong> {manageReqModal.request.description}</div>
                {manageReqModal.request.budget ? <div><strong>Budget:</strong> Rs. {manageReqModal.request.budget}</div> : null}
              </div>

              {/* Attachments preview */}
              {manageReqModal.request.attachments && manageReqModal.request.attachments.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>
                    <FaPaperclip /> Attachments ({manageReqModal.request.attachments.length})
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {manageReqModal.request.attachments.map((att, idx) => {
                      const fullUrl = att.url.startsWith('http') ? att.url : `http://localhost:5000${att.url}`;
                      const isImg = att.mimetype?.includes('image') || att.url?.match(/\.(jpg|jpeg|png|webp)$/i);
                      return (
                        <a key={idx} href={fullUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', width: '120px', textAlign: 'center' }}>
                            {isImg ? (
                              <img src={fullUrl} alt={att.filename} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                                <FaFileAlt size={24} color="#30497d" />
                              </div>
                            )}
                            <div style={{ fontSize: '10px', padding: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {att.filename}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assign Provider */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                  Assign Service Professional
                </label>
                <select
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={manageReqModal.selectedProId}
                  onChange={(e) => setManageReqModal({ ...manageReqModal, selectedProId: e.target.value })}
                >
                  <option value="">-- Select Active Professional --</option>
                  {providers
                    .filter((p) => p.status === 'active')
                    .map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} ({p.service} • {p.area || 'D.I. Khan'})
                      </option>
                    ))}
                </select>
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  Assigning a professional updates status to Accepted and alerts both parties.
                </small>
              </div>

              {/* Status Select */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                  Change Request Status
                </label>
                <select
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={manageReqModal.status}
                  onChange={(e) => setManageReqModal({ ...manageReqModal, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Status Note */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                  Status / Dispatch Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technician dispatched to site via Circular Road."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={manageReqModal.note}
                  onChange={(e) => setManageReqModal({ ...manageReqModal, note: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button variant="ghost" type="button" onClick={() => setManageReqModal({ isOpen: false, request: null, selectedProId: '', status: '', note: '' })}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* REJECT PROFESSIONAL MODAL */}
      <Modal
        isOpen={rejectProModal.isOpen}
        onClose={() => setRejectProModal({ isOpen: false, provider: null, reason: '' })}
        title="Reject Professional Application"
        size="sm"
      >
        <form onSubmit={handleRejectProviderSubmit}>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '14px' }}>
            Are you sure you want to reject <strong>{rejectProModal.provider?.name}</strong>? Please provide a reason to inform the applicant.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
              Reason for Rejection
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Invalid trade credentials or unverifiable phone number."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              value={rejectProModal.reason}
              onChange={(e) => setRejectProModal({ ...rejectProModal, reason: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setRejectProModal({ isOpen: false, provider: null, reason: '' })}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW PROFESSIONAL PROFILE MODAL */}
      <Modal
        isOpen={viewProModal.isOpen}
        onClose={() => setViewProModal({ isOpen: false, provider: null })}
        title={`Professional Profile: ${viewProModal.provider?.name || ''}`}
        size="md"
      >
        {viewProModal.provider && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{viewProModal.provider.name}</h3>
                <small style={{ color: '#64748b' }}>{viewProModal.provider.service} • {viewProModal.provider.area || 'D.I. Khan'}</small>
              </div>
              <Badge tone={viewProModal.provider.status === 'active' ? 'success' : viewProModal.provider.status === 'rejected' ? 'danger' : 'warning'}>
                {viewProModal.provider.status}
              </Badge>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
              <div><strong>Phone:</strong> {viewProModal.provider.phone}</div>
              <div><strong>Email:</strong> {viewProModal.provider.email}</div>
              <div><strong>Experience:</strong> {viewProModal.provider.experienceYears || viewProModal.provider.experience || 1} years</div>
              <div><strong>Base Rate:</strong> Rs. {viewProModal.provider.pricing?.amount || viewProModal.provider.startingPrice || 500}</div>
              {viewProModal.provider.cnic && <div><strong>CNIC:</strong> {viewProModal.provider.cnic}</div>}
            </div>

            <div>
              <strong>Bio & Qualifications:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                {viewProModal.provider.bio || viewProModal.provider.shortDescription || 'No bio submitted yet.'}
              </p>
            </div>

            {/* Documents */}
            {viewProModal.provider.documents && viewProModal.provider.documents.length > 0 && (
              <div>
                <strong>Uploaded Credentials / Certifications:</strong>
                <ul style={{ paddingLeft: '20px', fontSize: '13px' }}>
                  {viewProModal.provider.documents.map((doc, idx) => (
                    <li key={idx}>
                      <a href={doc.url.startsWith('http') ? doc.url : `http://localhost:5000${doc.url}`} target="_blank" rel="noreferrer">
                        {doc.name || 'Document ' + (idx + 1)} <FaExternalLinkAlt size={10} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <Button variant="outline" onClick={() => setViewProModal({ isOpen: false, provider: null })}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
