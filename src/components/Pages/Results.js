import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { estimateAPI } from '../../services/api'; // Import the API

ChartJS.register(ArcElement, Tooltip, Legend);

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resultsRef = useRef();
  
  const [estimate, setEstimate] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const loadSavedEstimate = useCallback(async (estimateId) => {
    try {
      setLoading(true);
      const response = await estimateAPI.getEstimate(estimateId);
      
      if (response.data.success) {
        const savedEstimate = response.data.estimate;
        
        // Set the estimate data
        setEstimate(savedEstimate);
        
        // Reconstruct formData from saved estimate
        const reconstructedFormData = {
          projectName: savedEstimate.project_name || 'Saved Project',
          location: savedEstimate.location || 'Karachi',
          projectSize: savedEstimate.total_area || 0,
          materialQuality: savedEstimate.material_quality || 'Standard',
          rooms: savedEstimate.num_rooms || 0,
          floors: savedEstimate.num_floors || 1,
          ceilingHeight: savedEstimate.ceiling_height || '10',
          finishes: savedEstimate.includes_finishes ? 'Yes' : 'No',
          finishesQuality: savedEstimate.finishes_quality || 'Standard',
          roomLength: savedEstimate.room_length || 0,
          roomWidth: savedEstimate.room_width || 0
        };
        
        setFormData(reconstructedFormData);
        
        console.log('Loaded saved estimate:', savedEstimate);
      } else {
        console.error('Failed to load saved estimate:', response.data.error);
        alert('Failed to load saved estimate. Please try again.');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error loading saved estimate:', error);
      alert('Error loading saved estimate. Please try again.');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', checkScreenSize);
    
    // Check if we have estimate data from calculation OR from profile
    if (location.state?.estimate && location.state?.formData) {
      // Coming from calculation page
      setEstimate(location.state.estimate);
      setFormData(location.state.formData);
      setLoading(false);
    } else if (location.state?.estimateId) {
      // Coming from profile page - load saved estimate
      loadSavedEstimate(location.state.estimateId);
    } else {
      // No data, redirect to estimate page
      navigate('/estimate');
    }

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [location, navigate, loadSavedEstimate]);

  const downloadPDF = async () => {
    if (!resultsRef.current) return;

    try {
      const downloadBtn = document.getElementById('download-pdf-btn');
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = 'Generating PDF...';
      downloadBtn.disabled = true;

      // Expand all categories before generating PDF
      const allCategories = ['Materials', 'Labor', 'Equipment', 'Finishes', 'Miscellaneous'];
      setExpandedCategories(allCategories);

      // Wait for the state to update and DOM to render expanded sections
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        onclone: function(clonedDoc) {
          // Ensure all expanded sections are visible in the cloned document
          const expandedSections = clonedDoc.querySelectorAll('.category-details');
          expandedSections.forEach(section => {
            section.style.display = 'block';
            section.style.opacity = '1';
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${timestamp}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      const projectName = formData?.projectName || 'Project';
      pdf.save(`BOQ_Report-${projectName}-${Date.now()}.pdf`);

      // Collapse all categories after PDF generation
      setExpandedCategories([]);

      downloadBtn.textContent = originalText;
      downloadBtn.disabled = false;
      alert('PDF downloaded successfully with all BOQ details!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      const downloadBtn = document.getElementById('download-pdf-btn');
      downloadBtn.textContent = 'Download BOQ Report';
      downloadBtn.disabled = false;
      // Collapse all categories on error too
      setExpandedCategories([]);
      alert('Error generating PDF. Please try again.');
    }
  };

  const toggleCategoryDetails = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const isCategoryExpanded = (category) => {
    return expandedCategories.includes(category);
  };

  // Updated BOQ breakdown based on backend logic
  const getCategoryBreakdown = (category) => {
    if (!estimate || !formData) return [];

    const area = parseFloat(formData.projectSize) || 0;
    const floors = parseInt(formData.floors) || 1;
    const effectiveArea = area * floors;
    const locationName = formData.location || 'Karachi';
    const quality = formData.materialQuality || 'standard';
    const finishesQuality = formData.finishesQuality || 'standard';
    
    // Quality factors from backend
    const qualityFactors = {
      'standard': 1.0,
      'premium': 1.10,
      'luxury': 1.20
    };
    
    const qf = qualityFactors[quality.toLowerCase()] || 1.0;

    // Material rates from backend (simplified for frontend display)
    const materialRates = {
      'Karachi': {
        'cement': 1250,   // per bag
        'steel': 280,     // per kg
        'bricks': 14,     // per brick
        'sand': 120,      // per cft
        'crush': 140      // per cft
      },
      'Hyderabad': {
        'cement': 1150,
        'steel': 260,
        'bricks': 12,
        'sand': 105,
        'crush': 125
      },
      'Sukkur': {
        'cement': 1100,
        'steel': 250,
        'bricks': 11,
        'sand': 100,
        'crush': 120
      }
    };

    const rates = materialRates[locationName] || materialRates['Karachi'];

    // Calculate quantities based on backend formulas
    const cementBags = effectiveArea * 0.40 * qf;
    const steelKg = effectiveArea * 3.50 * qf;
    const bricksQty = effectiveArea * 8;
    const sandCft = effectiveArea * 1.20;
    const crushCft = effectiveArea * 0.90;

    const cementCost = cementBags * rates['cement'];
    const steelCost = steelKg * rates['steel'];
    const bricksCost = bricksQty * rates['bricks'];
    const sandCost = sandCft * rates['sand'];
    const crushCost = crushCft * rates['crush'];

    // Labor rates from backend
    const laborRatesData = {
      'Karachi': 550,  // per sqft
      'Hyderabad': 450,
      'Sukkur': 400
    };
    
    const laborRate = laborRatesData[locationName] || 550;
    const laborCost = area * laborRate * floors;

    // Equipment cost from backend (18% of labor cost)
    const equipmentCost = laborCost * 0.18;

    // Finish rates from backend
    const finishRates = {
      'standard': 450,
      'premium': 750,
      'luxury': 1300
    };
    
    const finishesRate = finishRates[finishesQuality.toLowerCase()] || 450;
    const finishesCost = formData.finishes === 'Yes' ? area * finishesRate * floors : 0;

    // Other costs from backend (12% of subtotal)
    const subTotal = cementCost + steelCost + bricksCost + sandCost + crushCost + laborCost + equipmentCost + finishesCost;
    const otherCosts = subTotal * 0.12;

    // Room cost from backend
    const roomCost = parseInt(formData.rooms || 0) * 60000;

    const breakdowns = {
      'Materials': [
        { 
          name: 'Cement', 
          quantity: `${Math.round(cementBags)} bags`, 
          rate: `PKR ${rates['cement'].toLocaleString()}/bag`,
          total: `PKR ${Math.round(cementCost).toLocaleString()}`
        },
        { 
          name: 'Steel', 
          quantity: `${Math.round(steelKg)} kg`, 
          rate: `PKR ${rates['steel'].toLocaleString()}/kg`,
          total: `PKR ${Math.round(steelCost).toLocaleString()}`
        },
        { 
          name: 'Bricks', 
          quantity: `${Math.round(bricksQty)} pcs`, 
          rate: `PKR ${rates['bricks'].toLocaleString()}/pc`,
          total: `PKR ${Math.round(bricksCost).toLocaleString()}`
        },
        { 
          name: 'Sand', 
          quantity: `${Math.round(sandCft)} cft`, 
          rate: `PKR ${rates['sand'].toLocaleString()}/cft`,
          total: `PKR ${Math.round(sandCost).toLocaleString()}`
        },
        { 
          name: 'Crush', 
          quantity: `${Math.round(crushCft)} cft`, 
          rate: `PKR ${rates['crush'].toLocaleString()}/cft`,
          total: `PKR ${Math.round(crushCost).toLocaleString()}`
        }
      ],
      'Labor': [
        { 
          name: 'Construction Labor', 
          quantity: `${area.toLocaleString()} sq.ft × ${floors} floor(s)`, 
          rate: `PKR ${laborRate.toLocaleString()}/sq.ft`,
          total: `PKR ${Math.round(laborCost).toLocaleString()}`
        },
        { 
          name: 'Masonry Work', 
          quantity: `${Math.round(effectiveArea / 100)} mason-days`, 
          rate: 'PKR 2,500/day',
          total: `PKR ${Math.round(effectiveArea / 100 * 2500).toLocaleString()}`
        },
        { 
          name: 'Carpentry Work', 
          quantity: `${formData.rooms} room(s)`, 
          rate: 'PKR 45,000/room',
          total: `PKR ${Math.round(parseInt(formData.rooms || 0) * 45000).toLocaleString()}`
        },
        { 
          name: 'Electrical Work', 
          quantity: `${Math.round(effectiveArea / 150)} electrician-days`, 
          rate: 'PKR 2,200/day',
          total: `PKR ${Math.round(effectiveArea / 150 * 2200).toLocaleString()}`
        },
        { 
          name: 'Plumbing Work', 
          quantity: `${formData.rooms} room(s)`, 
          rate: 'PKR 35,000/room',
          total: `PKR ${Math.round(parseInt(formData.rooms || 0) * 35000).toLocaleString()}`
        }
      ],
      'Equipment': [
        { 
          name: 'Equipment Rental', 
          quantity: 'Project duration', 
          rate: '18% of labor cost',
          total: `PKR ${Math.round(equipmentCost).toLocaleString()}`
        },
        { 
          name: 'Concrete Mixer', 
          quantity: '15 days', 
          rate: 'PKR 3,000/day',
          total: 'PKR 45,000'
        },
        { 
          name: 'Scaffolding', 
          quantity: '30 days', 
          rate: 'PKR 800/day',
          total: 'PKR 24,000'
        },
        { 
          name: 'Power Tools', 
          quantity: '45 days', 
          rate: 'PKR 1,000/day',
          total: 'PKR 45,000'
        },
        { 
          name: 'Safety Equipment', 
          quantity: 'Lump sum', 
          rate: 'N/A',
          total: 'PKR 15,000'
        }
      ],
      'Finishes': formData.finishes === 'Yes' ? [
        { 
          name: 'Interior Finishes', 
          quantity: `${area.toLocaleString()} sq.ft × ${floors} floor(s)`, 
          rate: `PKR ${finishesRate.toLocaleString()}/sq.ft`,
          total: `PKR ${Math.round(finishesCost).toLocaleString()}`
        },
        { 
          name: 'Flooring', 
          quantity: `${effectiveArea.toLocaleString()} sq.ft`, 
          rate: `PKR ${Math.round(finishesRate * 0.4).toLocaleString()}/sq.ft`,
          total: `PKR ${Math.round(effectiveArea * finishesRate * 0.4).toLocaleString()}`
        },
        { 
          name: 'Painting', 
          quantity: `${Math.round(effectiveArea * 3.5).toLocaleString()} sq.ft (walls)`, 
          rate: `PKR ${Math.round(finishesRate * 0.3).toLocaleString()}/sq.ft`,
          total: `PKR ${Math.round(effectiveArea * 3.5 * finishesRate * 0.3).toLocaleString()}`
        },
        { 
          name: 'Bathroom Tiles', 
          quantity: `${formData.rooms * 80} sq.ft`, 
          rate: `PKR ${Math.round(finishesRate * 0.5).toLocaleString()}/sq.ft`,
          total: `PKR ${Math.round(formData.rooms * 80 * finishesRate * 0.5).toLocaleString()}`
        },
        { 
          name: 'False Ceiling', 
          quantity: `${effectiveArea.toLocaleString()} sq.ft`, 
          rate: `PKR ${Math.round(finishesRate * 0.3).toLocaleString()}/sq.ft`,
          total: `PKR ${Math.round(effectiveArea * finishesRate * 0.3).toLocaleString()}`
        }
      ] : [],
      'Miscellaneous': [
        { 
          name: 'Project Management', 
          quantity: '12% of subtotal', 
          rate: 'N/A',
          total: `PKR ${Math.round(otherCosts * 0.4).toLocaleString()}`
        },
        { 
          name: 'Transportation', 
          quantity: '1 month', 
          rate: 'PKR 25,000/month',
          total: 'PKR 25,000'
        },
        { 
          name: 'Permits & Legal Fees', 
          quantity: 'Lump sum', 
          rate: 'N/A',
          total: 'PKR 35,000'
        },
        { 
          name: 'Contingency', 
          quantity: '5% of total', 
          rate: 'N/A',
          total: `PKR ${Math.round(estimate?.total_cost * 0.05).toLocaleString()}`
        },
        { 
          name: 'Room Addition Cost', 
          quantity: `${formData.rooms} room(s)`, 
          rate: 'PKR 60,000/room',
          total: `PKR ${roomCost.toLocaleString()}`
        }
      ]
    };
    return breakdowns[category] || [];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Materials': 'fa-boxes',
      'Labor': 'fa-users',
      'Equipment': 'fa-tools',
      'Finishes': 'fa-paint-roller',
      'Miscellaneous': 'fa-cubes'
    };
    return icons[category] || 'fa-circle';
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-50 py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted fs-5">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!estimate || !formData) {
    return (
      <div className="text-center py-5">
        <h4 className="text-danger">No estimate data found</h4>
        <button 
          onClick={() => navigate('/estimate')}
          className="btn btn-primary mt-3"
        >
          Go to Estimation
        </button>
      </div>
    );
  }

  // Prepare chart data - Updated to match backend cost structure
  const materialCost = estimate.material_cost || 0;
  const laborCost = estimate.labor_cost || 0;
  const equipmentCost = estimate.equipment_cost || 0;
  const finishesCost = formData.finishes === 'Yes' ? (estimate.other_costs * 0.4 || 0) : 0;
  const otherCosts = formData.finishes === 'Yes' ? (estimate.other_costs * 0.6 || 0) : (estimate.other_costs || 0);

  const chartData = {
    labels: ['Materials', 'Labor', 'Equipment', 'Finishes', 'Miscellaneous'],
    datasets: [
      {
        data: [
          materialCost,
          laborCost,
          equipmentCost,
          finishesCost,
          otherCosts
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14,
            family: "'Segoe UI', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#333'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: PKR ${value.toLocaleString()} (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        padding: 12
      }
    },
    cutout: '65%',
    maintainAspectRatio: false,
    responsive: true
  };

  return (
    <div className="results-page bg-light py-4 py-md-5">
      <div className="container">
        {/* Header */}
        <header className="text-center mb-4 mb-md-5">
          <h1 className="results-heading fw-bold mb-3" style={{color: '#2563eb'}}>
            <i className="fas fa-chart-bar me-2"></i>
            Construction Cost Estimation Results
          </h1>
          
          <section className="text-center mb-4">
            <h2 className="section-heading fw-semibold mb-2 text-dark">
              BOQ-Based Cost Estimation for {formData.projectName || 'Your Project'}
            </h2>
            <p className="text-muted mx-auto results-description">
              Detailed Bill of Quantities (BOQ) based on construction standards
            </p>
            <p className="text-muted small">
              <i className="fas fa-calendar me-1"></i>
              Generated on: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {location.state?.fromProfile && (
              <div className="alert alert-info d-inline-flex align-items-center mt-2">
                <i className="fas fa-history me-2"></i>
                Viewing saved estimate from your history
              </div>
            )}
          </section>
        </header>

        {/* Main Results Content */}
        <div ref={resultsRef} className="results-content">
          
          {/* PROJECT SUMMARY & PIE CHART IN SINGLE LANDSCAPE SECTION */}
          <div className="row g-4 mb-4 mb-md-5">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <div className="row g-4">
                    {/* Project Summary - Left Side */}
                    <div className="col-lg-7">
                      <h3 className="card-title fw-bold mb-4 text-center">
                        <i className="fas fa-clipboard-list me-2" style={{color: '#2563eb'}}></i>
                        Project Specifications Summary
                      </h3>
                      
                      <div className="row">
                        {/* Column 1 */}
                        <div className="col-md-6">
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-project-diagram me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Project Name</h6>
                                <p className="text-muted mb-0">{formData.projectName || 'Untitled Project'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-map-marker-alt me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Location</h6>
                                <p className="text-muted mb-0">{formData.location || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-ruler-combined me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Total Area</h6>
                                <p className="text-muted mb-0">{formData.projectSize} sq. ft.</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-door-open me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Number of Rooms</h6>
                                <p className="text-muted mb-0">{formData.rooms} rooms</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Column 2 */}
                        <div className="col-md-6">
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-building me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Number of Floors</h6>
                                <p className="text-muted mb-0">{formData.floors} floor(s)</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-gem me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Material Quality</h6>
                                <p className="text-muted mb-0">{formData.materialQuality}</p>
                              </div>
                            </div>
                          </div>
                          
                          {formData.finishes === 'Yes' && (
                            <div className="summary-item mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-paint-roller me-3" style={{color: '#2563eb'}}></i>
                                <div>
                                  <h6 className="mb-0 fw-semibold">Finishes Quality</h6>
                                  <p className="text-muted mb-0">{formData.finishesQuality}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {formData.ceilingHeight && (
                            <div className="summary-item mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-ruler-vertical me-3" style={{color: '#2563eb'}}></i>
                                <div>
                                  <h6 className="mb-0 fw-semibold">Ceiling Height</h6>
                                  <p className="text-muted mb-0">{formData.ceilingHeight} ft</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {formData.roomLength && formData.roomWidth && (
                            <div className="summary-item mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-expand-alt me-3" style={{color: '#2563eb'}}></i>
                                <div>
                                  <h6 className="mb-0 fw-semibold">Room Dimensions</h6>
                                  <p className="text-muted mb-0">{formData.roomLength} × {formData.roomWidth} ft</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="summary-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-check-circle me-3" style={{color: '#2563eb'}}></i>
                              <div>
                                <h6 className="mb-0 fw-semibold">Finishes Included</h6>
                                <p className="text-muted mb-0">{formData.finishes}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Cost Display */}
                      <div className="mt-4 pt-3 border-top">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h5 className="fw-bold mb-2">
                              <i className="fas fa-calculator me-2" style={{color: '#059669'}}></i>
                              Total Estimated Cost
                            </h5>
                            <p className="text-muted mb-0 small">
                              Based on material take-off and construction standards
                            </p>
                          </div>
                          <div className="col-md-4 text-end">
                            <div className="total-cost-display">
                              <div className="total-cost-amount fw-bold" style={{color: '#059669', fontSize: '1.8rem'}}>
                                PKR {estimate.total_cost.toLocaleString()}
                              </div>
                              {estimate.accuracy_level && (
                                <p className="text-muted small mb-0">
                                  <i className="fas fa-info-circle me-1"></i>
                                  {estimate.accuracy_level}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pie Chart - Right Side */}
                    <div className="col-lg-5">
                      <div className="chart-section h-100 d-flex flex-column">
                        <h3 className="card-title fw-semibold mb-4 text-center">
                          <i className="fas fa-chart-pie me-2" style={{color: '#2563eb'}}></i>
                          Cost Distribution
                        </h3>
                        <div className="chart-container flex-grow-1" style={{ position: 'relative' }}>
                          <Doughnut data={chartData} options={chartOptions} />
                        </div>
                        <div className="mt-3 text-center">
                          <div className="badge" style={{
                            backgroundColor: formData.materialQuality.toLowerCase() === 'luxury' ? '#dc2626' :
                                           formData.materialQuality.toLowerCase() === 'premium' ? '#f59e0b' : '#6b7280',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem'
                          }}>
                            <i className="fas fa-hard-hat me-1"></i>
                            {formData.materialQuality} Quality Construction
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED BOQ COST BREAKDOWN */}
          <section className="detailed-breakdown-section">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title fw-semibold mb-4 text-dark text-center">
                  <i className="fas fa-file-invoice-dollar me-2" style={{color: '#2563eb'}}></i>
                  Bill of Quantities (BOQ) - Detailed Breakdown
                </h3>
                
                <div className="table-responsive">
                  <table className="table table-hover breakdown-table">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold py-3" style={{width: '25%'}}>Category</th>
                        <th className="fw-semibold py-3 text-end">Amount (PKR)</th>
                        <th className="fw-semibold py-3 text-end">Percentage</th>
                        <th className="fw-semibold py-3 text-center" style={{width: '100px'}}>BOQ Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { category: 'Materials', cost: materialCost },
                        { category: 'Labor', cost: laborCost },
                        { category: 'Equipment', cost: equipmentCost },
                        ...(formData.finishes === 'Yes' ? [{ category: 'Finishes', cost: finishesCost }] : []),
                        { category: 'Miscellaneous', cost: otherCosts }
                      ].map((item, index) => {
                        const percentage = ((item.cost / estimate.total_cost) * 100).toFixed(1);
                        const isExpanded = isCategoryExpanded(item.category);
                        
                        return (
                          <React.Fragment key={index}>
                            <tr className={isExpanded ? 'table-active' : ''}>
                              <td className="py-3 fw-medium">
                                <i className={`fas ${getCategoryIcon(item.category)} me-2`} style={{color: '#2563eb'}}></i>
                                {item.category}
                              </td>
                              <td className="py-3 text-end fw-semibold">PKR {Math.round(item.cost).toLocaleString()}</td>
                              <td className="py-3 text-end">{percentage}%</td>
                              <td className="py-3 text-center">
                                <button 
                                  className="btn btn-sm rounded-circle"
                                  onClick={() => toggleCategoryDetails(item.category)}
                                  style={{
                                    backgroundColor: isExpanded ? '#2563eb' : '#f3f4f6',
                                    color: isExpanded ? 'white' : '#374151',
                                    width: '36px',
                                    height: '36px',
                                    padding: '0'
                                  }}
                                  title={isExpanded ? 'Hide BOQ Details' : 'View BOQ Details'}
                                >
                                  <i className={`fas fa-${isExpanded ? 'chevron-up' : 'chevron-down'}`}></i>
                                </button>
                              </td>
                            </tr>
                            
                            {isExpanded && (
                              <tr>
                                <td colSpan="4" className="p-0">
                                  <div className="category-details p-3 bg-light">
                                    <h6 className="fw-semibold mb-3">
                                      <i className="fas fa-list-alt me-2"></i>
                                      {item.category} - Bill of Quantities
                                    </h6>
                                    <div className="table-responsive">
                                      <table className="table table-sm table-bordered">
                                        <thead className="table-secondary">
                                          <tr>
                                            <th className="fw-semibold">Item Description</th>
                                            <th className="fw-semibold text-center">Quantity</th>
                                            <th className="fw-semibold text-center">Unit Rate (PKR)</th>
                                            <th className="fw-semibold text-end">Total Amount (PKR)</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {getCategoryBreakdown(item.category).map((detail, idx) => (
                                            <tr key={idx}>
                                              <td className="fw-medium">{detail.name}</td>
                                              <td className="text-center">{detail.quantity}</td>
                                              <td className="text-center">{detail.rate}</td>
                                              <td className="text-end fw-semibold">{detail.total}</td>
                                            </tr>
                                          ))}
                                          <tr className="table-success">
                                            <td colSpan="3" className="text-end fw-bold">Subtotal for {item.category}:</td>
                                            <td className="text-end fw-bold">PKR {Math.round(item.cost).toLocaleString()}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      
                      {/* Total Row */}
                      <tr className="border-top" style={{backgroundColor: '#f8fafc'}}>
                        <td className="py-3 fw-bold">Total Project Cost</td>
                        <td className="py-3 text-end fw-bold" style={{color: '#059669', fontSize: '1.2rem'}}>
                          PKR {estimate.total_cost.toLocaleString()}
                        </td>
                        <td className="py-3 text-end fw-bold" style={{color: '#059669', fontSize: '1.2rem'}}>
                          100%
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge" style={{backgroundColor: '#059669', fontSize: '0.9rem'}}>
                            <i className="fas fa-file-contract me-1"></i>
                            BOQ Complete
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Construction Notes */}
                <div className="row mt-4">
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-info">
                      <h6 className="fw-bold">
                        <i className="fas fa-industry me-2"></i>
                        Construction Standards Applied
                      </h6>
                      <ul className="mb-0 ps-3">
                        <li>Material take-off based on effective area calculations</li>
                        <li>Labor rates per sq.ft based on location</li>
                        <li>Equipment costs calculated as 18% of labor cost</li>
                        <li>Other costs calculated as 12% of subtotal</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-warning">
                      <h6 className="fw-bold">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Important BOQ Notes
                      </h6>
                      <ul className="mb-0 ps-3">
                        <li>Quantities calculated per backend formulas: cement = area × 0.40 × quality factor</li>
                        <li>Steel: area × 3.50 × quality factor kg</li>
                        <li>Bricks: area × 8 pieces</li>
                        <li>Sand: area × 1.20 cft</li>
                        <li>Crush: area × 0.90 cft</li>
                        <li>Accuracy: ±7–9% (material take-off based)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Navigation Options */}
        {!isMobile ? (
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-5">
            <button 
              id="download-pdf-btn"
              onClick={downloadPDF}
              className="btn btn-success btn-lg d-flex align-items-center gap-2 px-4"
            >
              <i className="fas fa-file-pdf"></i>
              Download Reports
            </button>
            
            <button 
              onClick={() => navigate('/estimate')}
              className="btn btn-warning btn-lg px-4"
            >
              <i className="fas fa-plus me-2"></i>
              New BOQ Estimation
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="btn btn-info btn-lg px-4"
            >
              <i className="fas fa-history me-2"></i>
              View All Estimates
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="btn btn-lg px-4" 
  style={{ backgroundColor: '#fd7514', color: 'white' }}
            >
              <i className="fas fa-home me-2"></i>
              Back to Home
            </button>
          </div>
        ) : (
          <div className="mobile-nav-buttons card border-0 shadow-sm mt-5">
            <div className="card-body p-3">
              <div className="row g-0 text-center">
                <div className="col-3">
                  <button 
                    id="download-pdf-btn"
                    onClick={downloadPDF}
                    className="btn btn-icon-mobile border-0 w-100"
                  >
                    <i className="fas fa-download mobile-icon" style={{color: '#059669', fontSize: '1.5rem'}}></i>
                    <span className="mobile-label d-block mt-1" style={{color: '#059669', fontSize: '0.8rem'}}>BOQ PDF</span>
                  </button>
                </div>

                <div className="col-3">
                  <button 
                    onClick={() => navigate('/estimate')}
                    className="btn btn-icon-mobile border-0 w-100"
                  >
                    <i className="fas fa-plus mobile-icon" style={{color: '#f59e0b', fontSize: '1.5rem'}}></i>
                    <span className="mobile-label d-block mt-1" style={{color: '#f59e0b', fontSize: '0.8rem'}}>New</span>
                  </button>
                </div>

                <div className="col-3">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="btn btn-icon-mobile border-0 w-100"
                  >
                    <i className="fas fa-user mobile-icon" style={{color: '#ff2a00', fontSize: '1.5rem'}}></i>
                    <span className="mobile-label d-block mt-1" style={{color: '#ff2a00', fontSize: '0.8rem'}}>Profile</span>
                  </button>
                </div>
                <div className="col-3">
                  <button 
                    onClick={() => navigate('/')}
                    className="btn btn-icon-mobile border-0 w-100"
                  >
                    <i className="fas fa-home mobile-icon" style={{color: '#052fff', fontSize: '1.5rem'}}></i>
                    <span className="mobile-label d-block mt-1" style={{color: '#052fff', fontSize: '0.8rem'}}>Home</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;