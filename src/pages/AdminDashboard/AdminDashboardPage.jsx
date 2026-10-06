import { useState, useEffect } from 'react';
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
} from 'react-icons/fa';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { providerService } from '@/services/providerService';
import { requestService } from '@/services/requestService';
import { reviewService } from '@/services/reviewService';
import { categoryService } from '@/services/categoryService';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatCard from '@/components/dashboard/StatCard';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import { SuccessMessage } from '@/components/common/FeedbackStates';
import SkeletonCard from '@/components/common/SkeletonCard';
import '@/components/dashboard/DashboardPages.css';

export default function AdminDashboardPage() {
  useDocumentTitle('Platform Administration | D.I. Khan Service Finder');

  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [pRes, rRes, revRes, cRes] = await Promise.all([
        providerService.getProviders({ limit: 50 }),
        requestService.getRequests(),
        reviewService.getReviews(),
        categoryService.getCategories(),
      ]);
      setProviders(pRes.data || []);
      setRequests(rRes.data || []);
      setReviews(revRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleVerification = async (providerId, currentStatus) => {
    try {
      await providerService.updateProvider(providerId, { isVerified: !currentStatus });
      setSuccessMsg(`Provider verification status updated.`);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update verification');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
    { id: 'providers', label: 'Professionals', icon: <FaUserTie />, count: providers.length },
    { id: 'requests', label: 'All Requests', icon: <FaClipboardList />, count: requests.length },
    { id: 'categories', label: 'Categories', icon: <FaThList />, count: categories.length },
    { id: 'reviews', label: 'Reviews', icon: <FaStar />, count: reviews.length },
    { id: 'reports', label: 'City Reports', icon: <FaChartBar /> },
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
                    Operations, local provider verification, and marketplace metrics for Dera Ismail Khan.
                  </p>
                </div>
                <span className="badge badge-primary">D.I. Khan Live</span>
              </div>

              {/* Stats */}
              <div className="dash-stats-grid">
                <StatCard
                  title="Registered Pros"
                  value={providers.length}
                  subtitle="Verified local trades"
                  icon={<FaUserTie />}
                  tone="primary"
                />
                <StatCard
                  title="Total Job Requests"
                  value={requests.length}
                  subtitle="Customer bookings"
                  icon={<FaClipboardList />}
                  tone="info"
                />
                <StatCard
                  title="Customer Reviews"
                  value={reviews.length}
                  subtitle="Average 4.8★"
                  icon={<FaStar />}
                  tone="warning"
                />
              </div>

              {/* Pending Verification Management Box */}
              <div className="dash-section-box">
                <div className="dash-section-header">
                  <h2>Local Professionals Management</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('providers')}>
                    View all
                  </Button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Professional</th>
                        <th>Service / Trade</th>
                        <th>Area in D.I. Khan</th>
                        <th>Experience</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                            <small className="table-sub">{p.phone}</small>
                          </td>
                          <td>{p.service}</td>
                          <td>{p.primaryArea}</td>
                          <td>{p.experience} yrs</td>
                          <td>
                            {p.isVerified ? (
                              <Badge tone="success">Verified</Badge>
                            ) : (
                              <Badge tone="warning">Pending Verification</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant={p.isVerified ? 'ghost' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleVerification(p.id, p.isVerified)}
                            >
                              {p.isVerified ? 'Unverify' : 'Verify Pro'}
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

          {/* TAB: PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">All Registered Professionals</h1>
                  <p className="dash-subheading">
                    Manage profiles, phone numbers, and verify government credentials.
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Professional</th>
                      <th>Service</th>
                      <th>Location</th>
                      <th>Base Rate</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Verify Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <small className="table-sub">{p.phone}</small>
                        </td>
                        <td>{p.service}</td>
                        <td>{p.primaryArea}</td>
                        <td>Rs. {p.startingPrice}</td>
                        <td>★ {p.rating} ({p.reviewCount})</td>
                        <td>
                          {p.isVerified ? (
                            <Badge tone="success">Verified</Badge>
                          ) : (
                            <Badge tone="neutral">Standard</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant={p.isVerified ? 'ghost' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleVerification(p.id, p.isVerified)}
                          >
                            {p.isVerified ? 'Revoke Badge' : 'Grant Verified Badge'}
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                    Monitor all jobs placed by customers across Dera Ismail Khan.
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Service</th>
                      <th>Customer</th>
                      <th>Area</th>
                      <th>Budget</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td>
                          <strong>{r.service}</strong>
                          <small className="table-sub">{r.category}</small>
                        </td>
                        <td>
                          {r.customerName}
                          <small className="table-sub">{r.customerPhone}</small>
                        </td>
                        <td>{r.area}</td>
                        <td>{r.budget ? `Rs. ${r.budget}` : 'Negotiable'}</td>
                        <td>
                          <Badge
                            tone={
                              r.status === 'completed'
                                ? 'success'
                                : r.status === 'in-progress'
                                  ? 'primary'
                                  : r.status === 'pending'
                                    ? 'warning'
                                    : 'neutral'
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
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
                  <p className="dash-subheading">
                    Taxonomy of services available in Dera Ismail Khan.
                  </p>
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
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                          <p className="text-muted text-xs">{c.description}</p>
                        </td>
                        <td>
                          <div className="category-sub-tags">
                            {c.services?.map((s) => (
                              <span key={s.id} className="badge badge-neutral">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{c.services?.length || c.serviceCount} trades</td>
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
                  <p className="dash-subheading">Monitor real customer ratings.</p>
                </div>
              </div>

              <div className="dash-cards-stack">
                {reviews.map((rev) => (
                  <Card key={rev.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>{rev.userName} ({rev.userCity})</strong>
                      <span className="badge badge-warning">★ {rev.rating}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{rev.comment}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Dera Ismail Khan Service Insights</h1>
                  <p className="dash-subheading">Demographic coverage and demand analysis.</p>
                </div>
              </div>

              <div className="dash-stats-grid">
                <Card>
                  <strong>Top Demand Area</strong>
                  <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', margin: '8px 0 0' }}>
                    Cantt Area & Circular Road
                  </p>
                </Card>
                <Card>
                  <strong>Most Requested Trade</strong>
                  <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', margin: '8px 0 0' }}>
                    Plumbers & AC Technicians
                  </p>
                </Card>
                <Card>
                  <strong>Average Response Time</strong>
                  <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-success)', margin: '8px 0 0' }}>
                    35 Minutes
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dashboard-tab-view">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dash-heading">Platform Global Settings</h1>
                  <p className="dash-subheading">Configure city expansion and system options.</p>
                </div>
              </div>

              <Card as="div" className="dash-settings-card">
                <div className="settings-item">
                  <div>
                    <strong>Primary City Deployment</strong>
                    <p className="text-muted text-xs">
                      Active city: Dera Ismail Khan (Khyber Pakhtunkhwa)
                    </p>
                  </div>
                  <span className="badge badge-success">Live</span>
                </div>

                <div className="settings-item">
                  <div>
                    <strong>Future Expansion Target</strong>
                    <p className="text-muted text-xs">
                      Tank, Bannu, Bhakkar, Peshawar, Multan
                    </p>
                  </div>
                  <span className="badge badge-neutral">Planned</span>
                </div>
              </Card>
            </div>
          )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
