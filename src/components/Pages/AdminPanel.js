import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  return `PKR ${Math.round(amount || 0).toLocaleString()}`;
};

// Consistent color scheme
const COLORS = {
  primary: '#3b82f6',      // Blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber/Orange
  secondary: '#8b5cf6',    // Purple
  danger: '#ef4444',       // Red
  info: '#06b6d4',         // Cyan
  dark: '#374151',         // Gray
  light: '#f3f4f6',        // Light gray
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [materials, setMaterials] = useState([]);
  const [cities, setCities] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_estimates: 0,
    total_materials: 0,
    total_cost_sum: 0,
    recent_estimates: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate('/');
      alert('Access denied. Admin privileges required.');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'materials') loadMaterials();
    if (activeTab === 'cities') loadCities();
    if (activeTab === 'estimates') loadEstimates();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setStats(response.data.stats || response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError('Failed to load dashboard data');
      if (error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllMaterials();
      if (response.data.success) {
        setMaterials(response.data.materials || response.data);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllCities();
      if (response.data.success) {
        setCities(response.data.cities || response.data);
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const loadEstimates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllEstimates();
      if (response.data.success) {
        setEstimates(response.data.estimates || response.data);
      }
    } catch (error) {
      console.error('Failed to load estimates:', error);
      setError('Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.users || response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateMaterial = async (id, updatedData) => {
    try {
      const response = await adminAPI.updateMaterial(id, updatedData);
      if (response.data.success) {
        alert('Material updated successfully!');
        loadMaterials();
      }
    } catch (error) {
      console.error('Failed to update material:', error);
      alert('Failed to update material');
    }
  };

  const updateCity = async (id, updatedData) => {
    try {
      const response = await adminAPI.updateCity(id, updatedData);
      if (response.data.success) {
        alert('City rates updated successfully!');
        loadCities();
      }
    } catch (error) {
      console.error('Failed to update city:', error);
      alert('Failed to update city rates');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const response = await adminAPI.updateUser(userId, { is_active: isActive });
      if (response.data.success) {
        alert(`User ${isActive ? 'activated' : 'deactivated'} successfully!`);
        loadUsers();
      } else {
        alert(response.data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.data.success) {
        alert('User deleted successfully!');
        loadUsers();
      } else {
        alert(response.data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const viewEstimate = (estimateId) => {
    navigate('/results', { state: { estimateId: estimateId, fromAdmin: true } });
  };

  // Render loading spinner
  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: COLORS.primary }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mt-2">Loading...</p>
    </div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold" style={{ color: COLORS.primary }}>
          <i className="fas fa-tachometer-alt me-2"></i>
          Dashboard Overview
        </h4>
        <button 
          className="btn btn-sm"
          onClick={loadDashboard}
          style={{ backgroundColor: COLORS.primary, color: 'white' }}
        >
          <i className="fas fa-redo me-1"></i>
          Refresh
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 h-100" style={{ 
            backgroundColor: `${COLORS.primary}10`,
            borderLeft: `4px solid ${COLORS.primary}`
          }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '10px',
                  backgroundColor: `${COLORS.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-users" style={{ color: COLORS.primary, fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <div className="small" style={{ color: COLORS.dark }}>Total Users</div>
                  <div className="h4 fw-bold mb-0" style={{ color: COLORS.primary }}>{stats.total_users || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 h-100" style={{ 
            backgroundColor: `${COLORS.success}10`,
            borderLeft: `4px solid ${COLORS.success}`
          }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '10px',
                  backgroundColor: `${COLORS.success}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-file-invoice-dollar" style={{ color: COLORS.success, fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <div className="small" style={{ color: COLORS.dark }}>Total Estimates</div>
                  <div className="h4 fw-bold mb-0" style={{ color: COLORS.success }}>{stats.total_estimates || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 h-100" style={{ 
            backgroundColor: `${COLORS.info}10`,
            borderLeft: `4px solid ${COLORS.info}`
          }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '10px',
                  backgroundColor: `${COLORS.info}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-cube" style={{ color: COLORS.info, fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <div className="small" style={{ color: COLORS.dark }}>Total Materials</div>
                  <div className="h4 fw-bold mb-0" style={{ color: COLORS.info }}>{stats.total_materials || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 h-100" style={{ 
            backgroundColor: `${COLORS.warning}10`,
            borderLeft: `4px solid ${COLORS.warning}`
          }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '10px',
                  backgroundColor: `${COLORS.warning}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-money-bill-wave" style={{ color: COLORS.warning, fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <div className="small" style={{ color: COLORS.dark }}>Total Cost</div>
                  <div className="h4 fw-bold mb-0" style={{ color: COLORS.warning }}>{formatCurrency(stats.total_cost_sum)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Estimates */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0" style={{ color: COLORS.primary }}>
            <i className="fas fa-history me-2"></i>
            Recent Estimates
          </h5>
        </div>
        <div className="card-body p-0">
          {stats.recent_estimates && stats.recent_estimates.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: COLORS.light }}>
                  <tr>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Project</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>User</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Cost</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Date</th>
                    <th className="small fw-semibold py-2 text-center" style={{ color: COLORS.dark }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_estimates.slice(0, 5).map((estimate, index) => (
                    <tr key={index}>
                      <td className="py-2">
                        <div className="fw-medium small">{estimate.project_name || 'Untitled'}</div>
                        <div className="small text-muted">
                          {estimate.location} • {estimate.total_area} sq.ft
                        </div>
                      </td>
                      <td className="py-2 small">{estimate.user?.name || 'Unknown'}</td>
                      <td className="py-2">
                        <div className="fw-bold small" style={{ color: COLORS.success }}>
                          {formatCurrency(estimate.total_cost)}
                        </div>
                      </td>
                      <td className="py-2 small">{formatDate(estimate.created_at)}</td>
                      <td className="py-2 text-center">
                        <button 
                          className="btn btn-sm p-0"
                          onClick={() => viewEstimate(estimate.id)}
                          style={{ color: COLORS.primary }}
                          title="View Estimate"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-file-invoice text-muted mb-2" style={{ fontSize: '2rem' }}></i>
              <p className="text-muted small mb-0">No recent estimates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render materials management
  const renderMaterials = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold" style={{ color: COLORS.primary }}>
          <i className="fas fa-cube me-2"></i>
          Material Prices
        </h4>
        <button 
          className="btn btn-sm"
          onClick={loadMaterials}
          style={{ backgroundColor: COLORS.primary, color: 'white' }}
        >
          <i className="fas fa-redo me-1"></i>
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="alert py-2 px-3 mb-3" style={{ 
          backgroundColor: `${COLORS.danger}15`, 
          color: COLORS.danger,
          border: `1px solid ${COLORS.danger}30`
        }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {loading ? renderLoading() : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: COLORS.light }}>
                  <tr>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Material</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Category</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Unit</th>
                    <th className="small fw-semibold py-2 text-end" style={{ color: COLORS.dark }}>Standard</th>
                    <th className="small fw-semibold py-2 text-end" style={{ color: COLORS.dark }}>Premium</th>
                    <th className="small fw-semibold py-2 text-end" style={{ color: COLORS.dark }}>Luxury</th>
                    <th className="small fw-semibold py-2 text-center" style={{ color: COLORS.dark }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <MaterialRow 
                      key={material.id} 
                      material={material} 
                      onUpdate={updateMaterial} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render cities management
  const renderCities = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold" style={{ color: COLORS.primary }}>
          <i className="fas fa-city me-2"></i>
          City Rates
        </h4>
        <button 
          className="btn btn-sm"
          onClick={loadCities}
          style={{ backgroundColor: COLORS.primary, color: 'white' }}
        >
          <i className="fas fa-redo me-1"></i>
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="alert py-2 px-3 mb-3" style={{ 
          backgroundColor: `${COLORS.danger}15`, 
          color: COLORS.danger,
          border: `1px solid ${COLORS.danger}30`
        }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {loading ? renderLoading() : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: COLORS.light }}>
                  <tr>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>City</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Code</th>
                    <th className="small fw-semibold py-2 text-end" style={{ color: COLORS.dark }}>Labor Rate</th>
                    <th className="small fw-semibold py-2 text-end" style={{ color: COLORS.dark }}>Material Rate</th>
                    <th className="small fw-semibold py-2 text-end" style={{ color: COLORS.dark }}>Equipment Rate</th>
                    <th className="small fw-semibold py-2 text-center" style={{ color: COLORS.dark }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city) => (
                    <CityRow 
                      key={city.id} 
                      city={city} 
                      onUpdate={updateCity} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render estimates view
  const renderEstimates = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold" style={{ color: COLORS.primary }}>
          <i className="fas fa-file-invoice-dollar me-2"></i>
          All Estimates
        </h4>
        <button 
          className="btn btn-sm"
          onClick={loadEstimates}
          style={{ backgroundColor: COLORS.primary, color: 'white' }}
        >
          <i className="fas fa-redo me-1"></i>
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="alert py-2 px-3 mb-3" style={{ 
          backgroundColor: `${COLORS.danger}15`, 
          color: COLORS.danger,
          border: `1px solid ${COLORS.danger}30`
        }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {loading ? renderLoading() : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: COLORS.light }}>
                  <tr>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>ID</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Project</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>User</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Location</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Cost</th>
                    <th className="small fw-semibold py-2 text-center" style={{ color: COLORS.dark }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((estimate) => (
                    <tr key={estimate.id}>
                      <td className="py-2 small">#{estimate.id}</td>
                      <td className="py-2">
                        <div className="fw-medium small">{estimate.project_name || 'Untitled'}</div>
                        <div className="small text-muted">
                          {estimate.total_area} sq.ft • 
                          <span className="ms-1" style={{
                            color: estimate.material_quality === 'Luxury' ? COLORS.danger :
                                  estimate.material_quality === 'Premium' ? COLORS.warning : COLORS.dark
                          }}>
                            {estimate.material_quality}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 small">{estimate.user?.name || 'Unknown'}</td>
                      <td className="py-2 small">{estimate.location}</td>
                      <td className="py-2">
                        <div className="fw-bold small" style={{ color: COLORS.success }}>
                          {formatCurrency(estimate.total_cost)}
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <button 
                          className="btn btn-sm p-0 me-2"
                          onClick={() => viewEstimate(estimate.id)}
                          style={{ color: COLORS.primary }}
                          title="View Estimate"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render users view
  const renderUsers = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold" style={{ color: COLORS.primary }}>
          <i className="fas fa-users me-2"></i>
          User Management
        </h4>
        <button 
          className="btn btn-sm"
          onClick={loadUsers}
          style={{ backgroundColor: COLORS.primary, color: 'white' }}
        >
          <i className="fas fa-redo me-1"></i>
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="alert py-2 px-3 mb-3" style={{ 
          backgroundColor: `${COLORS.danger}15`, 
          color: COLORS.danger,
          border: `1px solid ${COLORS.danger}30`
        }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {loading ? renderLoading() : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: COLORS.light }}>
                  <tr>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>User</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Email</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Role</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Joined</th>
                    <th className="small fw-semibold py-2" style={{ color: COLORS.dark }}>Status</th>
                    <th className="small fw-semibold py-2 text-center" style={{ color: COLORS.dark }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-2">
                        <div className="fw-medium small">{user.name}</div>
                        <div className="small text-muted">ID: #{user.id}</div>
                      </td>
                      <td className="py-2 small">{user.email}</td>
                      <td className="py-2">
                        <span className="badge" style={{ 
                          backgroundColor: user.role === 'admin' ? `${COLORS.danger}20` : `${COLORS.primary}20`,
                          color: user.role === 'admin' ? COLORS.danger : COLORS.primary
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2 small">{formatDate(user.created_at)}</td>
                      <td className="py-2">
                        <span className="badge" style={{ 
                          backgroundColor: user.is_active ? `${COLORS.success}20` : `${COLORS.dark}20`,
                          color: user.is_active ? COLORS.success : COLORS.dark
                        }}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <button 
                            className="btn btn-sm p-0"
                            onClick={() => updateUserStatus(user.id, !user.is_active)}
                            style={{ 
                              color: user.is_active ? COLORS.warning : COLORS.success 
                            }}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            <i className={`fas fa-${user.is_active ? 'user-slash' : 'user-check'}`}></i>
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              className="btn btn-sm p-0"
                              onClick={() => deleteUser(user.id)}
                              style={{ color: COLORS.danger }}
                              title="Delete User"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-panel py-3 py-md-4 bg-white">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: COLORS.primary }}>
              <i className="fas fa-shield-alt me-2"></i>
              Admin Panel
            </h1>
            <p className="small text-muted mb-0">Manage your construction cost estimator system</p>
          </div>
          <button 
            className="btn btn-sm"
            onClick={() => navigate('/')}
            style={{ 
              backgroundColor: COLORS.light, 
              color: COLORS.dark,
              border: `1px solid ${COLORS.light}`
            }}
          >
            <i className="fas fa-arrow-left me-1"></i>
            Back to Site
          </button>
        </div>

        {/* Admin Navigation */}
        <div className="row">
          <div className="col-md-3 mb-3 mb-md-0">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-2">
                <div className="list-group list-group-flush">
                  <button 
                    className={`list-group-item list-group-item-action border-0 py-2 rounded mb-1 ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                    style={{ 
                      backgroundColor: activeTab === 'dashboard' ? `${COLORS.primary}10` : 'transparent',
                      color: activeTab === 'dashboard' ? COLORS.primary : COLORS.dark
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '8px',
                        backgroundColor: activeTab === 'dashboard' ? COLORS.primary : `${COLORS.primary}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="fas fa-tachometer-alt" style={{ 
                          color: activeTab === 'dashboard' ? 'white' : COLORS.primary 
                        }}></i>
                      </div>
                      <div>
                        <div className="small fw-bold">Dashboard</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action border-0 py-2 rounded mb-1 ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                    style={{ 
                      backgroundColor: activeTab === 'materials' ? `${COLORS.primary}10` : 'transparent',
                      color: activeTab === 'materials' ? COLORS.primary : COLORS.dark
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '8px',
                        backgroundColor: activeTab === 'materials' ? COLORS.primary : `${COLORS.primary}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="fas fa-cube" style={{ 
                          color: activeTab === 'materials' ? 'white' : COLORS.primary 
                        }}></i>
                      </div>
                      <div>
                        <div className="small fw-bold">Material Prices</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action border-0 py-2 rounded mb-1 ${activeTab === 'cities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cities')}
                    style={{ 
                      backgroundColor: activeTab === 'cities' ? `${COLORS.primary}10` : 'transparent',
                      color: activeTab === 'cities' ? COLORS.primary : COLORS.dark
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '8px',
                        backgroundColor: activeTab === 'cities' ? COLORS.primary : `${COLORS.primary}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="fas fa-city" style={{ 
                          color: activeTab === 'cities' ? 'white' : COLORS.primary 
                        }}></i>
                      </div>
                      <div>
                        <div className="small fw-bold">City Rates</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action border-0 py-2 rounded mb-1 ${activeTab === 'estimates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('estimates')}
                    style={{ 
                      backgroundColor: activeTab === 'estimates' ? `${COLORS.primary}10` : 'transparent',
                      color: activeTab === 'estimates' ? COLORS.primary : COLORS.dark
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '8px',
                        backgroundColor: activeTab === 'estimates' ? COLORS.primary : `${COLORS.primary}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="fas fa-file-invoice-dollar" style={{ 
                          color: activeTab === 'estimates' ? 'white' : COLORS.primary 
                        }}></i>
                      </div>
                      <div>
                        <div className="small fw-bold">All Estimates</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action border-0 py-2 rounded ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                    style={{ 
                      backgroundColor: activeTab === 'users' ? `${COLORS.primary}10` : 'transparent',
                      color: activeTab === 'users' ? COLORS.primary : COLORS.dark
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '8px',
                        backgroundColor: activeTab === 'users' ? COLORS.primary : `${COLORS.primary}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="fas fa-users" style={{ 
                          color: activeTab === 'users' ? 'white' : COLORS.primary 
                        }}></i>
                      </div>
                      <div>
                        <div className="small fw-bold">User Management</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-md-9">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'cities' && renderCities()}
            {activeTab === 'estimates' && renderEstimates()}
            {activeTab === 'users' && renderUsers()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Material Row Component
const MaterialRow = ({ material, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [rates, setRates] = useState({
    standard_rate: material.standard_rate,
    premium_rate: material.premium_rate,
    luxury_rate: material.luxury_rate
  });

  const handleSave = () => {
    onUpdate(material.id, rates);
    setEditing(false);
  };

  const handleCancel = () => {
    setRates({
      standard_rate: material.standard_rate,
      premium_rate: material.premium_rate,
      luxury_rate: material.luxury_rate
    });
    setEditing(false);
  };

  return (
    <tr>
      <td className="py-2">
        <div className="fw-medium small">{material.name}</div>
        <div className="small text-muted">{material.category}</div>
      </td>
      <td className="py-2">
        <span className="badge" style={{ 
          backgroundColor: `${COLORS.info}20`,
          color: COLORS.info
        }}>
          {material.category}
        </span>
      </td>
      <td className="py-2 small">{material.unit}</td>
      <td className="py-2 text-end">
        {editing ? (
          <div className="input-group input-group-sm" style={{ width: '130px' }}>
            <span className="input-group-text border-0" style={{ 
              backgroundColor: COLORS.light,
              color: COLORS.dark
            }}>PKR</span>
            <input 
              type="number" 
              value={rates.standard_rate}
              onChange={(e) => setRates({...rates, standard_rate: parseFloat(e.target.value) || 0})}
              className="form-control border-0"
              style={{ backgroundColor: COLORS.light }}
            />
          </div>
        ) : (
          <div className="fw-medium small" style={{ color: COLORS.success }}>
            {formatCurrency(material.standard_rate)}
          </div>
        )}
      </td>
      <td className="py-2 text-end">
        {editing ? (
          <div className="input-group input-group-sm" style={{ width: '130px' }}>
            <span className="input-group-text border-0" style={{ 
              backgroundColor: COLORS.light,
              color: COLORS.dark
            }}>PKR</span>
            <input 
              type="number" 
              value={rates.premium_rate}
              onChange={(e) => setRates({...rates, premium_rate: parseFloat(e.target.value) || 0})}
              className="form-control border-0"
              style={{ backgroundColor: COLORS.light }}
            />
          </div>
        ) : (
          <div className="fw-medium small" style={{ color: COLORS.warning }}>
            {formatCurrency(material.premium_rate)}
          </div>
        )}
      </td>
      <td className="py-2 text-end">
        {editing ? (
          <div className="input-group input-group-sm" style={{ width: '130px' }}>
            <span className="input-group-text border-0" style={{ 
              backgroundColor: COLORS.light,
              color: COLORS.dark
            }}>PKR</span>
            <input 
              type="number" 
              value={rates.luxury_rate}
              onChange={(e) => setRates({...rates, luxury_rate: parseFloat(e.target.value) || 0})}
              className="form-control border-0"
              style={{ backgroundColor: COLORS.light }}
            />
          </div>
        ) : (
          <div className="fw-medium small" style={{ color: COLORS.danger }}>
            {formatCurrency(material.luxury_rate)}
          </div>
        )}
      </td>
      <td className="py-2 text-center">
        {editing ? (
          <div className="d-flex gap-1 justify-content-center">
            <button 
              className="btn btn-sm p-0"
              onClick={handleSave}
              style={{ color: COLORS.success }}
              title="Save"
            >
              <i className="fas fa-check"></i>
            </button>
            <button 
              className="btn btn-sm p-0"
              onClick={handleCancel}
              style={{ color: COLORS.danger }}
              title="Cancel"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-sm p-0"
            onClick={() => setEditing(true)}
            style={{ color: COLORS.primary }}
            title="Edit"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </td>
    </tr>
  );
};

// City Row Component
const CityRow = ({ city, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [cityData, setCityData] = useState({
    labor_rate_per_sqft: city.labor_rate_per_sqft,
    material_base_rate: city.material_base_rate,
    equipment_rate: city.equipment_rate
  });

  const handleSave = () => {
    onUpdate(city.id, cityData);
    setEditing(false);
  };

  const handleCancel = () => {
    setCityData({
      labor_rate_per_sqft: city.labor_rate_per_sqft,
      material_base_rate: city.material_base_rate,
      equipment_rate: city.equipment_rate
    });
    setEditing(false);
  };

  return (
    <tr>
      <td className="py-2">
        <div className="fw-medium small">{city.name}</div>
        <div className="small text-muted">Code: {city.code}</div>
      </td>
      <td className="py-2">
        <span className="badge" style={{ 
          backgroundColor: `${COLORS.secondary}20`,
          color: COLORS.secondary
        }}>
          {city.code}
        </span>
      </td>
      <td className="py-2 text-end">
        {editing ? (
          <div className="input-group input-group-sm" style={{ width: '130px' }}>
            <span className="input-group-text border-0" style={{ 
              backgroundColor: COLORS.light,
              color: COLORS.dark
            }}>PKR</span>
            <input 
              type="number" 
              value={cityData.labor_rate_per_sqft}
              onChange={(e) => setCityData({...cityData, labor_rate_per_sqft: parseFloat(e.target.value) || 0})}
              className="form-control border-0"
              style={{ backgroundColor: COLORS.light }}
            />
          </div>
        ) : (
          <div className="fw-medium small" style={{ color: COLORS.success }}>
            {formatCurrency(city.labor_rate_per_sqft)}
          </div>
        )}
      </td>
      <td className="py-2 text-end">
        {editing ? (
          <div className="input-group input-group-sm" style={{ width: '130px' }}>
            <span className="input-group-text border-0" style={{ 
              backgroundColor: COLORS.light,
              color: COLORS.dark
            }}>PKR</span>
            <input 
              type="number" 
              value={cityData.material_base_rate}
              onChange={(e) => setCityData({...cityData, material_base_rate: parseFloat(e.target.value) || 0})}
              className="form-control border-0"
              style={{ backgroundColor: COLORS.light }}
            />
          </div>
        ) : (
          <div className="fw-medium small" style={{ color: COLORS.primary }}>
            {formatCurrency(city.material_base_rate)}
          </div>
        )}
      </td>
      <td className="py-2 text-end">
        {editing ? (
          <div className="input-group input-group-sm" style={{ width: '130px' }}>
            <span className="input-group-text border-0" style={{ 
              backgroundColor: COLORS.light,
              color: COLORS.dark
            }}>PKR</span>
            <input 
              type="number" 
              value={cityData.equipment_rate}
              onChange={(e) => setCityData({...cityData, equipment_rate: parseFloat(e.target.value) || 0})}
              className="form-control border-0"
              style={{ backgroundColor: COLORS.light }}
            />
          </div>
        ) : (
          <div className="fw-medium small" style={{ color: COLORS.warning }}>
            {formatCurrency(city.equipment_rate)}
          </div>
        )}
      </td>
      <td className="py-2 text-center">
        {editing ? (
          <div className="d-flex gap-1 justify-content-center">
            <button 
              className="btn btn-sm p-0"
              onClick={handleSave}
              style={{ color: COLORS.success }}
              title="Save"
            >
              <i className="fas fa-check"></i>
            </button>
            <button 
              className="btn btn-sm p-0"
              onClick={handleCancel}
              style={{ color: COLORS.danger }}
              title="Cancel"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-sm p-0"
            onClick={() => setEditing(true)}
            style={{ color: COLORS.primary }}
            title="Edit"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </td>
    </tr>
  );
};

export default AdminPanel;