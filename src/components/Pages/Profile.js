import React, { useState, useEffect, useCallback } from 'react';
import { authAPI, estimateAPI, formatCurrency, formatDate, handleApiError } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEstimates: 0,
    totalCost: 0,
    avgCost: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false
  });
  const navigate = useNavigate();

  // Use useCallback to memoize the function
  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load user profile
      const profileResponse = await authAPI.getProfile();
      if (profileResponse.data.success) {
        setUser(profileResponse.data.user);
      } else {
        throw new Error(profileResponse.data.error || 'Failed to load user profile');
      }
      
      // Load estimation history
      await loadEstimationHistory(1);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      const errorMessage = handleApiError(error, 'Failed to load profile data');
      setError(errorMessage);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadEstimationHistory = async (page) => {
    try {
      const response = await estimateAPI.getHistory(page, pagination.per_page);
      
      if (response.data.success) {
        setEstimates(response.data.estimates);
        
        // Update pagination
        setPagination({
          page: response.data.current_page || page,
          per_page: response.data.per_page || pagination.per_page,
          total: response.data.total || 0,
          pages: response.data.pages || 1,
          has_next: response.data.has_next || false,
          has_prev: response.data.has_prev || false
        });
        
        // Calculate stats from all estimates
        const totalCost = response.data.estimates.reduce((sum, est) => sum + (est.total_cost || 0), 0);
        const totalEstimates = response.data.total || 0;
        
        setStats({
          totalEstimates: totalEstimates,
          totalCost: totalCost,
          avgCost: totalEstimates > 0 ? Math.round(totalCost / totalEstimates) : 0
        });
      } else {
        throw new Error(response.data.error || 'Failed to load estimation history');
      }
    } catch (error) {
      console.error('Failed to load estimation history:', error);
      setError(handleApiError(error, 'Failed to load estimation history'));
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadEstimationHistory(newPage);
    }
  };

  const handleDeleteEstimate = async (estimateId) => {
    if (!window.confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await estimateAPI.deleteEstimate(estimateId);
      
      if (response.data.success) {
        // Remove estimate from state
        const deletedEstimate = estimates.find(e => e.id === estimateId);
        setEstimates(prev => prev.filter(est => est.id !== estimateId));
        
        // Update pagination total
        const newTotal = Math.max(0, pagination.total - 1);
        const newPages = Math.ceil(newTotal / pagination.per_page);
        
        setPagination(prev => ({
          ...prev,
          total: newTotal,
          pages: newPages,
          // Adjust current page if needed
          page: prev.page > newPages ? Math.max(1, newPages) : prev.page
        }));
        
        // Update stats
        if (deletedEstimate) {
          setStats(prev => {
            const newTotalEstimates = prev.totalEstimates - 1;
            const newTotalCost = prev.totalCost - (deletedEstimate.total_cost || 0);
            return {
              totalEstimates: newTotalEstimates,
              totalCost: newTotalCost,
              avgCost: newTotalEstimates > 0 ? Math.round(newTotalCost / newTotalEstimates) : 0
            };
          });
        }
        
        // If current page becomes empty after deletion, load previous page
        if (estimates.length === 1 && pagination.page > 1) {
          loadEstimationHistory(pagination.page - 1);
        }
        
        alert('Estimate deleted successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to delete estimate');
      }
    } catch (error) {
      console.error('Failed to delete estimate:', error);
      alert(handleApiError(error, 'Failed to delete estimate'));
    }
  };

  const handleViewEstimate = (estimateId) => {
    // Navigate to results page with the estimate ID in state
    console.log('Navigating to results with estimate ID:', estimateId);
    navigate('/results', { 
      state: { 
        estimateId: estimateId,
        fromProfile: true 
      } 
    });
  };

  const refreshHistory = () => {
    loadEstimationHistory(pagination.page);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="text-center py-5">
        <h4 className="text-danger">Failed to load profile</h4>
        <p className="text-muted mb-3">{error}</p>
        <button 
          onClick={loadProfileData}
          className="btn btn-primary me-2"
        >
          <i className="fas fa-redo me-2"></i>
          Retry
        </button>
        <button 
          onClick={() => navigate('/login')}
          className="btn btn-outline-primary"
        >
          <i className="fas fa-sign-in-alt me-2"></i>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page py-4 py-md-5">
      <div className="container">
        {/* Header */}
        <header className="text-center mb-4 mb-md-5">
          <h1 className="fw-bold gradient-text-primary mb-3">
            <i className="fas fa-user-circle me-2"></i>
            My Profile
          </h1>
          <p className="text-muted">Manage your account and view estimation history</p>
          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
        </header>

        <div className="row g-4">
          {/* User Info Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                {/* Avatar */}
                <div className="avatar-circle mx-auto mb-3">
                  <span className="avatar-text">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                {/* User Info */}
                <h4 className="fw-bold mb-1">{user?.name || 'User'}</h4>
                <p className="text-muted mb-2">
                  <i className="fas fa-envelope me-2"></i>
                  {user?.email || 'No email'}
                </p>
                
                <div className="mb-3">
                  <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'} px-3 py-2`}>
                    <i className={`fas ${user?.role === 'admin' ? 'fa-crown' : 'fa-user'} me-2`}></i>
                    {user?.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
                
                {/* Stats */}
                <div className="row text-center mt-4">
                  <div className="col-6 border-end">
                    <h5 className="fw-bold text-primary">{stats.totalEstimates}</h5>
                    <small className="text-muted">Estimates</small>
                  </div>
                  <div className="col-6">
                    <h5 className="fw-bold text-success">
                      {formatCurrency(stats.totalCost)}
                    </h5>
                    <small className="text-muted">Total Cost</small>
                  </div>
                </div>
                
                <hr />
                
                {/* Additional Info */}
                <div className="text-start">
                  <p className="mb-2">
                    <i className="fas fa-calendar text-primary me-2"></i>
                    <strong>Member since:</strong> {formatDate(user?.created_at)}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-chart-line text-success me-2"></i>
                    <strong>Avg. Estimate:</strong> {formatCurrency(stats.avgCost)}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="card-footer bg-white border-0 pt-0">
                <button 
                  onClick={() => navigate('/estimate')}
                  className="btn btn-primary w-100 mb-2"
                >
                  <i className="fas fa-plus me-2"></i>
                  New Estimate
                </button>
                <button 
                  onClick={refreshHistory}
                  className="btn btn-outline-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo me-2"></i>
                      Refresh History
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Estimation History */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0">
                      <i className="fas fa-history text-primary me-2"></i>
                      Estimation History
                    </h5>
                    {estimates.length > 0 && (
                      <small className="text-muted">
                        Page {pagination.page} of {pagination.pages} • 
                        Showing {estimates.length} of {pagination.total} estimates
                      </small>
                    )}
                  </div>
                  <span className="badge bg-primary">
                    {pagination.total} {pagination.total === 1 ? 'Estimate' : 'Estimates'}
                  </span>
                </div>
              </div>
              
              <div className="card-body">
                {estimates.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-file-invoice text-muted fs-1 mb-3"></i>
                    <h5 className="text-muted">No Estimates Yet</h5>
                    <p className="text-muted">Start your first estimation to see history here</p>
                    <button 
                      onClick={() => navigate('/estimate')}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-plus me-2"></i>
                      Create Your First Estimate
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Project</th>
                            <th>Location</th>
                            <th>Area</th>
                            <th>Total Cost</th>
                            <th>Date</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estimates.map((estimate) => (
                            <tr key={estimate.id} className="align-middle">
                              <td>
                                <div className="fw-semibold">{estimate.project_name || 'Unnamed Project'}</div>
                                <small className="text-muted">
                                  {estimate.material_quality || 'Standard'} Quality • {estimate.num_floors || 1} Floors
                                </small>
                              </td>
                              <td>{estimate.location || 'N/A'}</td>
                              <td>{estimate.total_area ? `${estimate.total_area} sq. ft.` : 'N/A'}</td>
                              <td>
                                <span className="fw-bold text-primary">
                                  {formatCurrency(estimate.total_cost)}
                                </span>
                              </td>
                              <td>
                                <small>{formatDate(estimate.created_at)}</small>
                              </td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  {/* View Button - Goes to Results Page */}
                                  <button 
                                    onClick={() => handleViewEstimate(estimate.id)}
                                    className="btn btn-sm btn-primary"
                                    title="View Estimate Results"
                                  >
                                    <i className="fas fa-chart-bar me-1"></i>
                                    View Results
                                  </button>
                                  
                                  {/* Delete Button */}
                                  <button 
                                    onClick={() => handleDeleteEstimate(estimate.id)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete Estimate"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <nav className="mt-3">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${!pagination.has_prev ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(pagination.page - 1)}
                              disabled={!pagination.has_prev}
                            >
                              <i className="fas fa-chevron-left"></i>
                            </button>
                          </li>
                          
                          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            let pageNum;
                            if (pagination.pages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.page >= pagination.pages - 2) {
                              pageNum = pagination.pages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }
                            
                            return (
                              <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                <button 
                                  className="page-link" 
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          })}
                          
                          <li className={`page-item ${!pagination.has_next ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(pagination.page + 1)}
                              disabled={!pagination.has_next}
                            >
                              <i className="fas fa-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                    
                    {/* Summary Stats */}
                    {estimates.length > 0 && (
                      <div className="row mt-4">
                        <div className="col-md-4 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body text-center">
                              <h6 className="text-muted mb-2">Total Projects</h6>
                              <h4 className="fw-bold text-primary">{stats.totalEstimates}</h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body text-center">
                              <h6 className="text-muted mb-2">Total Investment</h6>
                              <h4 className="fw-bold text-success">
                                {formatCurrency(stats.totalCost)}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body text-center">
                              <h6 className="text-muted mb-2">Average Cost</h6>
                              <h4 className="fw-bold text-warning">
                                {formatCurrency(stats.avgCost)}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for avatar */}
      <style jsx>{`
        .profile-page {
          min-height: 80vh;
        }
        
        .avatar-circle {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        
        .avatar-circle:hover {
          transform: scale(1.05);
        }
        
        .avatar-text {
          color: white;
          font-size: 2.5rem;
          font-weight: bold;
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(102, 126, 234, 0.05);
        }
        
        .gradient-text-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default Profile;