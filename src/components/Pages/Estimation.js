import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { estimateAPI } from '../../services/api';

const Estimation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('form');
  const [areaWarning, setAreaWarning] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    projectName: '',
    projectSize: '',
    location: '',
    rooms: '',
    roomLength: '',
    roomWidth: '',
    materialQuality: 'Standard',
    finishes: 'No',
    finishesQuality: 'Standard',
    floors: '1',
    ceilingHeight: '10'
  });

  const materialQualities = ['Standard', 'Premium', 'Luxury'];
  const ceilingHeights = [
    { value: '10', label: '10 feet (Standard)' },
    { value: '12', label: '12 feet (Premium)' },
    { value: '14', label: '14 feet (Luxury)' }
  ];
  const finishesOptions = ['No', 'Yes'];
  const finishesQualities = ['Standard', 'Premium', 'Luxury'];

  // Load cities and materials from backend
  useEffect(() => {
    loadCities();
    loadMaterials();
  }, []);

  // Update area warning when relevant fields change
  useEffect(() => {
    calculateAreaWarning();
  }, [formData.projectSize, formData.rooms, formData.roomLength, formData.roomWidth]);

  const loadCities = async () => {
    try {
      const response = await estimateAPI.getCities();
      if (response.data.success) {
        setCities(response.data.cities);
        if (response.data.cities.length > 0 && !formData.location) {
          setFormData(prev => ({
            ...prev,
            location: response.data.cities[0].name
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await estimateAPI.getMaterials();
      if (response.data.success) {
        setMaterials(response.data.materials);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calculate area warning
  const calculateAreaWarning = () => {
    const projectSize = parseFloat(formData.projectSize) || 0;
    const rooms = parseInt(formData.rooms) || 0;
    const roomLength = parseFloat(formData.roomLength) || 0;
    const roomWidth = parseFloat(formData.roomWidth) || 0;

    if (projectSize > 0 && rooms > 0 && roomLength > 0 && roomWidth > 0) {
      const totalRoomsArea = roomLength * roomWidth * rooms;
      
      if (totalRoomsArea > projectSize) {
        const excessPercentage = ((totalRoomsArea - projectSize) / projectSize * 100).toFixed(1);
        setAreaWarning(`⚠️ Room area (${totalRoomsArea.toLocaleString()} sq.ft) exceeds project area by ${excessPercentage}%`);
      } else if (totalRoomsArea > 0) {
        const utilizationPercentage = (totalRoomsArea / projectSize * 100).toFixed(1);
        setAreaWarning(`Room area: ${totalRoomsArea.toLocaleString()} sq.ft (${utilizationPercentage}% of project area)`);
      } else {
        setAreaWarning('');
      }
    } else {
      setAreaWarning('');
    }
  };

  // Validation function
  const validateForm = () => {
    // Basic required field validation
    if (!formData.projectName || !formData.projectSize || !formData.location || 
        !formData.rooms || !formData.materialQuality || !formData.roomLength || !formData.roomWidth) {
      alert('Please fill in all required fields including room dimensions');
      return false;
    }

    // Convert to numbers
    const projectSize = parseFloat(formData.projectSize);
    const rooms = parseInt(formData.rooms);
    const roomLength = parseFloat(formData.roomLength);
    const roomWidth = parseFloat(formData.roomWidth);
    const floors = parseInt(formData.floors) || 1;

    // Validate positive numbers
    if (projectSize <= 0) {
      alert('Project area must be greater than 0');
      return false;
    }

    if (rooms <= 0) {
      alert('Number of rooms must be greater than 0');
      return false;
    }

    if (roomLength <= 0 || roomWidth <= 0) {
      alert('Room dimensions must be greater than 0');
      return false;
    }

    if (floors <= 0) {
      alert('Number of floors must be greater than 0');
      return false;
    }

    // Validate room dimensions
    const totalRoomsArea = roomLength * roomWidth * rooms;
    
    // Block submission if room area exceeds project area
    if (totalRoomsArea > projectSize) {
      return false; // Submission blocked - warning shown in UI
    }

    // Validate finishes quality if finishes is Yes
    if (formData.finishes === 'Yes' && !formData.finishesQuality) {
      alert('Please select finishes quality');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Calculate room area for final check
    const projectSize = parseFloat(formData.projectSize);
    const rooms = parseInt(formData.rooms);
    const roomLength = parseFloat(formData.roomLength);
    const roomWidth = parseFloat(formData.roomWidth);
    const totalRoomsArea = roomLength * roomWidth * rooms;
    
    // Final check for area validation
    if (totalRoomsArea > projectSize) {
      alert(`Cannot proceed: Room area (${totalRoomsArea.toLocaleString()} sq.ft) exceeds project area (${projectSize.toLocaleString()} sq.ft).\nPlease adjust your inputs.`);
      return;
    }
    
    // Run validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await estimateAPI.calculate(formData);
      
      if (response.data.success) {
        navigate('/results', { 
          state: { 
            estimate: response.data.estimate,
            formData: formData,
            materials: materials
          } 
        });
      } else {
        alert(response.data.error || 'Failed to calculate estimate');
      }
    } catch (error) {
      console.error('Estimation error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to calculate estimate. Please try again.';
      
      if (error.response?.status === 401) {
        alert('Please login to use the estimator');
        navigate('/login');
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'form':
        return (
          <div className="tab-content p-3 p-md-4 bg-light rounded">
            <div className="text-center mb-3 mb-md-4">
              <h4 className="tab-title fw-semibold mb-2 text-primary">
                Manual Form Input
              </h4>
              <p className="tab-description text-muted mb-0">
                Fill out the detailed form below with your construction project specifications for precise cost estimation.
              </p>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="tab-content p-3 p-md-4 bg-light rounded">
            <div className="text-center mb-3 mb-md-4">
              <h4 className="tab-title fw-semibold mb-2 text-primary">
                AI-Powered Estimation
              </h4>
              <p className="tab-description text-muted mb-3 mb-md-4">
                Get intelligent estimates for any city in Pakistan using our AI model.
              </p>
              <div className="alert alert-info">
                <i className="fas fa-robot me-2"></i>
                AI estimates consider regional factors, market trends, and historical data.
              </div>
              <div className="mt-4">
                <button className="btn btn-outline-primary" disabled>
                  <i className="fas fa-bolt me-2"></i>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="tab-content p-3 p-md-4 bg-light rounded">
            <div className="text-center mb-3 mb-md-4">
              <h4 className="tab-title fw-semibold mb-2 text-primary">
                Voice Command Input
              </h4>
              <p className="tab-description text-muted mb-3 mb-md-4">
                Use voice commands to quickly input your project details. Ensure clear audio for best results.
              </p>
              <div className="alert alert-info">
                <i className="fas fa-microphone me-2"></i>
                Voice input feature is currently under development.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="estimation-page py-4 py-md-5">
      <div className="container">
        {/* Header */}
        <header className="text-center mb-4 mb-md-5">
          <h1 className="main-heading fw-bold mb-2 gradient-text-primary">
            Project Estimation
          </h1>
          <h2 className="sub-heading text-muted mb-3 fw-medium">
            Choose Your Input Method & Provide Project Details
          </h2>
          <p className="description text-gray mx-auto mb-0">
            Select how you'd like to input your construction project information and get accurate cost estimates
          </p>
        </header>

        {/* SECTION 1: INPUT TYPE SELECTION */}
        <section className="input-section card border-0 shadow-sm mb-4">
          <div className="card-body p-3 p-md-4">
            <h3 className="section-title fw-bold mb-3 text-dark text-center">
              Select Input Method
            </h3>
            
            <div className="tab-buttons d-flex gap-2 gap-md-3 justify-content-center flex-wrap mb-3">
              <button
                onClick={() => setActiveTab('form')}
                className={`tab-button btn d-flex flex-column align-items-center ${
                  activeTab === 'form' 
                    ? 'btn-primary-custom active' 
                    : 'btn-outline-custom'
                }`}
              >
                <i className="fas fa-edit tab-icon mb-1"></i>
                <span className="tab-text d-none d-md-block">Manual Form</span>
                <span className="tab-text-mobile d-md-none">Form</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`tab-button btn d-flex flex-column align-items-center ${
                  activeTab === 'ai' 
                    ? 'btn-primary-custom active' 
                    : 'btn-outline-custom'
                }`}
              >
                <i className="fas fa-robot tab-icon mb-1"></i>
                <span className="tab-text d-none d-md-block">AI Estimation</span>
                <span className="tab-text-mobile d-md-none">AI</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`tab-button btn d-flex flex-column align-items-center ${
                  activeTab === 'voice' 
                    ? 'btn-primary-custom active' 
                    : 'btn-outline-custom'
                }`}
              >
                <i className="fas fa-microphone tab-icon mb-1"></i>
                <span className="tab-text d-none d-md-block">Voice Input</span>
                <span className="tab-text-mobile d-md-none">Voice</span>
              </button>
            </div>

            <div className="mt-3">
              {renderTabContent()}
            </div>
          </div>
        </section>

        {/* SECTION 2: PROJECT DETAILS FORM */}
        {activeTab === 'form' && (
          <section className="form-section card border-0 shadow-sm">
            <div className="card-body p-4">
              <h3 className="form-title fw-bold mb-4 text-dark text-center">
                Construction Project Specifications
              </h3>

              <form onSubmit={handleSubmit} className="row g-3">
                {/* Project Name */}
                <div className="col-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-project-diagram me-2 text-primary"></i>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="form-control form-control-custom"
                    placeholder="Enter your project name"
                    required
                  />
                </div>

                {/* Project Size */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-ruler-combined me-2 text-primary"></i>
                    Total Project Area (sq. ft.) *
                  </label>
                  <input
                    type="number"
                    name="projectSize"
                    value={formData.projectSize}
                    onChange={handleInputChange}
                    className="form-control form-control-custom"
                    placeholder="Total construction area"
                    min="1"
                    required
                  />
                </div>

                {/* Location Dropdown */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    Project Location *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-select form-control-custom"
                    required
                    disabled={cities.length === 0}
                  >
                    <option value="">Select Location</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {cities.length === 0 && (
                    <small className="text-danger">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      Loading cities...
                    </small>
                  )}
                </div>

                {/* Number of Rooms */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-door-open me-2 text-primary"></i>
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    className="form-control form-control-custom"
                    placeholder="Number of rooms"
                    min="1"
                    required
                  />
                </div>

                {/* Room Dimensions */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-ruler me-2 text-primary"></i>
                    Room Length (ft) *
                  </label>
                  <input
                    type="number"
                    name="roomLength"
                    value={formData.roomLength}
                    onChange={handleInputChange}
                    className="form-control form-control-custom"
                    placeholder="Length in feet"
                    min="1"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-ruler me-2 text-primary"></i>
                    Room Width (ft) *
                  </label>
                  <input
                    type="number"
                    name="roomWidth"
                    value={formData.roomWidth}
                    onChange={handleInputChange}
                    className="form-control form-control-custom"
                    placeholder="Width in feet"
                    min="1"
                    required
                  />
                </div>

                {/* Area Warning */}
                {areaWarning && (
                  <div className="col-12">
                    <div className={`alert ${areaWarning.includes('⚠️') ? 'alert-warning' : 'alert-info'} py-2 mb-0`}>
                      <i className="fas fa-info-circle me-2"></i>
                      {areaWarning}
                    </div>
                  </div>
                )}

                {/* Ceiling Height Dropdown */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-arrow-up me-2 text-primary"></i>
                    Ceiling Height *
                  </label>
                  <select
                    name="ceilingHeight"
                    value={formData.ceilingHeight}
                    onChange={handleInputChange}
                    className="form-select form-control-custom"
                    required
                  >
                    <option value="">Select Height</option>
                    {ceilingHeights.map(height => (
                      <option key={height.value} value={height.value}>
                        {height.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Floors */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-building me-2 text-primary"></i>
                    Number of Floors *
                  </label>
                  <input
                    type="number"
                    name="floors"
                    value={formData.floors}
                    onChange={handleInputChange}
                    className="form-control form-control-custom"
                    placeholder="Total floors"
                    min="1"
                    required
                  />
                </div>

                {/* Material Quality Dropdown */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-gem me-2 text-primary"></i>
                    Material Quality *
                  </label>
                  <select
                    name="materialQuality"
                    value={formData.materialQuality}
                    onChange={handleInputChange}
                    className="form-select form-control-custom"
                    required
                  >
                    <option value="">Select Quality</option>
                    {materialQualities.map(quality => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Finishes Selection */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <i className="fas fa-paint-roller me-2 text-primary"></i>
                    Include Finishes?
                  </label>
                  <select
                    name="finishes"
                    value={formData.finishes}
                    onChange={handleInputChange}
                    className="form-select form-control-custom"
                  >
                    {finishesOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Finishes Quality (only if finishes is Yes) */}
                {formData.finishes === 'Yes' && (
                  <div className="col-12">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-star me-2 text-primary"></i>
                      Finishes Quality *
                    </label>
                    <select
                      name="finishesQuality"
                      value={formData.finishesQuality}
                      onChange={handleInputChange}
                      className="form-select form-control-custom"
                      required={formData.finishes === 'Yes'}
                    >
                      <option value="">Select Finishes Quality</option>
                      {finishesQualities.map(quality => (
                        <option key={quality} value={quality}>
                          {quality}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <div className="col-12 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary-custom btn-lg w-100 submit-btn py-3"
                    disabled={loading || areaWarning.includes('⚠️')}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calculator me-2"></i>
                        Generate Cost Estimation
                      </>
                    )}
                  </button>
                  
                  {/* Login Required Notice */}
                  <div className="mt-2 text-center">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      You need to be logged in to save your estimates
                    </small>
                  </div>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Estimation;