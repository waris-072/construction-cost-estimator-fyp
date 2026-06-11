import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { estimateAPI } from '../../services/api';
import VoiceInput from '../UI/VoiceInput';

const Estimation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('form');
  const [areaWarning, setAreaWarning] = useState('');
  const [voiceSuccess, setVoiceSuccess] = useState('');
  const [aiLocationInput, setAiLocationInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  // AI Form state
  const [aiFormData, setAiFormData] = useState({
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
  // Note: aiAreaWarning is displayed but not dynamically updated
  // Keeping it here for future use
  const aiAreaWarning = '';
  const [aiVoiceSuccess, setAiVoiceSuccess] = useState('');
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Convert to numbers early for conditional checks
    const projectSize = parseFloat(formData.projectSize);
    const rooms = parseInt(formData.rooms) || 0;
    const roomLength = parseFloat(formData.roomLength) || 0;
    const roomWidth = parseFloat(formData.roomWidth) || 0;
    const floors = parseInt(formData.floors) || 1;

    // Basic required fields
    if (!formData.projectName || !formData.projectSize || !formData.location || !formData.materialQuality) {
      alert('Please fill in required fields: project name, project area, location, and material quality.');
      return false;
    }

    // If user specifies a number of rooms (>0), require room dimensions
    if (rooms > 0 && (roomLength <= 0 || roomWidth <= 0)) {
      alert('Please provide valid room dimensions (length and width) for the specified number of rooms.');
      return false;
    }

    // Validate positive numbers for main numeric fields
    if (projectSize <= 0) {
      alert('Project area must be greater than 0');
      return false;
    }

    if (rooms < 0) {
      alert('Number of rooms must be 0 or greater');
      return false;
    }

    if (floors <= 0) {
      alert('Number of floors must be greater than 0');
      return false;
    }

    // If room dimensions provided, ensure they are positive
    if ((formData.roomLength || formData.roomWidth) && (roomLength <= 0 || roomWidth <= 0)) {
      alert('Room dimensions must be greater than 0');
      return false;
    }

    // Validate room area vs project area (if dimensions available)
    if (rooms > 0 && roomLength > 0 && roomWidth > 0) {
      const totalRoomsArea = roomLength * roomWidth * rooms;

      if (totalRoomsArea > projectSize) {
        // Block submission if room area exceeds project area
        return false; // Submission blocked - warning shown in UI
      }
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
                Fill out the form below or use voice input. The AI will generate an estimate based on your details.
              </p>
              <div className="alert alert-info">
                <i className="fas fa-robot me-2"></i>
                AI estimates consider regional factors, market trends, and historical data.
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-7">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  // Validate AI form
                  const projectSize = parseFloat(aiFormData.projectSize);
                  const rooms = parseInt(aiFormData.rooms) || 0;
                  const roomLength = parseFloat(aiFormData.roomLength) || 0;
                  const roomWidth = parseFloat(aiFormData.roomWidth) || 0;
                  const totalRoomsArea = roomLength * roomWidth * rooms;
                  if (totalRoomsArea > projectSize) {
                    alert(`Cannot proceed: Room area (${totalRoomsArea.toLocaleString()} sq.ft) exceeds project area (${projectSize.toLocaleString()} sq.ft).\nPlease adjust your inputs.`);
                    return;
                  }
                  if (!aiFormData.projectName || !aiFormData.projectSize || !aiFormData.location || !aiFormData.materialQuality) {
                    alert('Please fill in required fields: project name, project area, location, and material quality.');
                    return;
                  }
                  setLoadingAi(true);
                  setAiSuggestions(null);
                  try {
                    const payload = {
                      ...aiFormData,
                      projectSize: parseFloat(aiFormData.projectSize) || 0,
                      rooms: parseInt(aiFormData.rooms) || 0,
                      floors: parseInt(aiFormData.floors) || 1,
                    };
                    const resp = await estimateAPI.calculate(payload);
                    if (!resp.data.success) {
                      alert(resp.data.error || 'AI estimation failed');
                      return;
                    }
                    const est = resp.data.estimate;
                    if (aiLocationInput && aiLocationInput.trim()) {
                      const target = aiLocationInput.trim();
                      const known = cities.find(c => c.name.toLowerCase() === target.toLowerCase());
                      if (known) {
                        const updatedForm = { ...aiFormData, location: target };
                        navigate('/results', { state: { estimate: est, formData: updatedForm, materials } });
                        return;
                      }
                      try {
                        const cityResp = await estimateAPI.aiCityEstimate({ projectData: payload, targetCity: target, currentCost: est.total_cost });
                        if (cityResp.data.success) {
                          const cityEst = cityResp.data.cityEstimate || {};
                          const estimatedCost = cityEst.estimatedCost || cityEst.estimated_cost;
                          if (window.confirm(`AI estimated cost for ${target}: PKR ${estimatedCost?.toLocaleString() || 'N/A'}\nReason: ${cityEst.reason || ''}\n\nDo you want to use this estimate?`)) {
                            const minimalEstimate = { total_cost: estimatedCost || est.total_cost };
                            const updatedForm = { ...aiFormData, location: target };
                            navigate('/results', { state: { estimate: minimalEstimate, formData: updatedForm, materials } });
                          }
                          return;
                        } else {
                          alert(cityResp.data.error || 'AI city estimate failed');
                          return;
                        }
                      } catch (e) {
                        console.error('AI city error', e);
                        const serverMsg = e?.response?.data?.error || e?.message || String(e);
                        alert('AI city estimate failed: ' + serverMsg);
                        return;
                      }
                    }
                    // Always show AI result directly
                    navigate('/results', { state: { estimate: est, formData: aiFormData, materials } });
                  } catch (err) {
                    console.error('AI estimate error', err);
                    const serverMsg = err?.response?.data?.error || err?.message || String(err);
                    alert('AI estimation failed: ' + serverMsg);
                  } finally {
                    setLoadingAi(false);
                  }
                }} className="row g-3">
                  {/* Project Name */}
                  <div className="col-6">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-project-diagram me-2 text-primary"></i>
                      Project Name *
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={aiFormData.projectName}
                      onChange={e => setAiFormData({ ...aiFormData, projectName: e.target.value })}
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
                      value={aiFormData.projectSize}
                      onChange={e => setAiFormData({ ...aiFormData, projectSize: e.target.value })}
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
                      value={aiFormData.location}
                      onChange={e => setAiFormData({ ...aiFormData, location: e.target.value })}
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
                      <option value="Other">Other (Enter City)</option>
                    </select>
                    {aiFormData.location === 'Other' && (
                      <input
                        type="text"
                        name="customCity"
                        value={aiFormData.customCity || ''}
                        onChange={e => setAiFormData({ ...aiFormData, customCity: e.target.value })}
                        className="form-control mt-2"
                        placeholder="Enter your city name"
                        required
                      />
                    )}
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
                      value={aiFormData.rooms}
                      onChange={e => setAiFormData({ ...aiFormData, rooms: e.target.value })}
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
                      value={aiFormData.roomLength}
                      onChange={e => setAiFormData({ ...aiFormData, roomLength: e.target.value })}
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
                      value={aiFormData.roomWidth}
                      onChange={e => setAiFormData({ ...aiFormData, roomWidth: e.target.value })}
                      className="form-control form-control-custom"
                      placeholder="Width in feet"
                      min="1"
                      required
                    />
                  </div>
                  {/* Area Warning */}
                  {aiAreaWarning && (
                    <div className="col-12">
                      <div className={`alert ${aiAreaWarning.includes('⚠️') ? 'alert-warning' : 'alert-info'} py-2 mb-0`}>
                        <i className="fas fa-info-circle me-2"></i>
                        {aiAreaWarning}
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
                      value={aiFormData.ceilingHeight}
                      onChange={e => setAiFormData({ ...aiFormData, ceilingHeight: e.target.value })}
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
                      value={aiFormData.floors}
                      onChange={e => setAiFormData({ ...aiFormData, floors: e.target.value })}
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
                      value={aiFormData.materialQuality}
                      onChange={e => setAiFormData({ ...aiFormData, materialQuality: e.target.value })}
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
                      value={aiFormData.finishes}
                      onChange={e => setAiFormData({ ...aiFormData, finishes: e.target.value })}
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
                  {aiFormData.finishes === 'Yes' && (
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-star me-2 text-primary"></i>
                        Finishes Quality *
                      </label>
                      <select
                        name="finishesQuality"
                        value={aiFormData.finishesQuality}
                        onChange={e => setAiFormData({ ...aiFormData, finishesQuality: e.target.value })}
                        className="form-select form-control-custom"
                        required={aiFormData.finishes === 'Yes'}
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
                      disabled={loadingAi || aiAreaWarning.includes('⚠️')}
                    >
                      {loadingAi ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-calculator me-2"></i>
                          Generate AI Cost Estimation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              <div className="col-md-5">
                <VoiceInput
                  onVoiceText={() => {}}
                  onParsedData={params => {
                    setAiFormData(prev => ({
                      ...prev,
                      ...params,
                      materialQuality: params.materialQuality ? params.materialQuality.charAt(0).toUpperCase() + params.materialQuality.slice(1) : 'Standard',
                      finishesQuality: params.finishesQuality ? params.finishesQuality.charAt(0).toUpperCase() + params.finishesQuality.slice(1) : 'Standard',
                      finishes: params.finishes === 'Yes' ? 'Yes' : 'No'
                    }));
                    setAiVoiceSuccess('✨ AI Project details auto-filled! Review and adjust as needed, then submit.');
                  }}
                />
                {aiVoiceSuccess && (
                  <div className="alert alert-success alert-dismissible fade show mt-3">
                    <i className="fas fa-check-circle me-2"></i>
                    {aiVoiceSuccess}
                  </div>
                )}
              </div>
            </div>
            {/* AI suggestions removed: AI now always gives direct results */}
          </div>
        );

      case 'voice':
        return (
          <div className="tab-content p-3 p-md-4 bg-light rounded">
            {voiceSuccess && (
              <div className="alert alert-success alert-dismissible fade show">
                <i className="fas fa-check-circle me-2"></i>
                {voiceSuccess}
              </div>
            )}
            <VoiceInput 
              onVoiceText={(text) => console.log('Voice:', text)}
              onParsedData={(params) => {
                // Auto-fill form with parsed voice data
                setFormData(prev => ({
                  ...prev,
                  ...params,
                  materialQuality: params.materialQuality ? params.materialQuality.charAt(0).toUpperCase() + params.materialQuality.slice(1) : 'Standard',
                  finishesQuality: params.finishesQuality ? params.finishesQuality.charAt(0).toUpperCase() + params.finishesQuality.slice(1) : 'Standard',
                  finishes: params.finishes === 'Yes' ? 'Yes' : 'No'
                }));
                setVoiceSuccess('✨ Project details auto-filled! Review and adjust as needed, then submit.');
                // Switch to form tab
                setTimeout(() => setActiveTab('form'), 500);
              }}
            />
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
                    onChange={e => {
                      handleInputChange(e);
                      if (e.target.value !== 'Other') {
                        setFormData(prev => ({ ...prev, customCity: '' }));
                      }
                    }}
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
                    <option value="Other">Other (Enter City)</option>
                  </select>
                  {formData.location === 'Other' && (
                    <input
                      type="text"
                      name="customCity"
                      value={formData.customCity || ''}
                      onChange={e => setFormData(prev => ({ ...prev, customCity: e.target.value }))}
                      className="form-control mt-2"
                      placeholder="Enter your city name"
                      required
                    />
                  )}
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