import React, { useState } from 'react';

const Help = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeSection, setActiveSection] = useState('guide'); // 'guide' or 'faqs'

  const faqs = [
    {
      question: "What is this tool for?",
      answer: "This AI-powered tool helps construction professionals and homeowners quickly estimate construction project costs and timelines using multiple input methods."
    },
    {
      question: "How accurate are the predictions?",
      answer: "Our AI model provides estimates based on construction data patterns. While highly accurate for planning purposes, always consult with professional estimators for final budgets."
    },
    {
      question: "Can I use this tool on mobile devices?",
      answer: "Yes, the application is fully responsive and works on all mobile devices, tablets, and desktop computers."
    },
    {
      question: "What file formats are supported for upload?",
      answer: "We support Excel files (.xlsx), blueprint images (JPG, PNG), and manual form input. Voice input is also available for supported browsers."
    },
    {
      question: "Is the voice input feature accurate?",
      answer: "Voice recognition accuracy depends on your browser and microphone quality. It works best in quiet environments with clear speech."
    },
    {
      question: "How do I save my estimates?",
      answer: "All estimates are automatically saved to your session. You can export them as PDF reports or Excel files for future reference."
    },
    {
      question: "What construction types are supported?",
      answer: "We support residential, commercial, and industrial construction projects including houses, apartments, offices, and small commercial buildings."
    },
    {
      question: "Can I compare different material options?",
      answer: "Yes, you can adjust material quality levels (Standard, Premium, Luxury) and see how they affect the total cost in real-time."
    },
    {
      question: "How are location-based costs calculated?",
      answer: "Our AI considers regional material costs, labor rates, and local construction regulations for accurate location-specific estimates."
    },
    {
      question: "Is my project data secure?",
      answer: "Yes, all your project data is stored locally in your browser session and is never sent to external servers without your permission."
    }
  ];

  const steps = [
    { step: 1, title: "Go to Estimate Page", desc: "Navigate to the estimation page from the main menu" },
    { step: 2, title: "Select Input Type", desc: "Choose between form, file upload, or voice input" },
    { step: 3, title: "Fill Project Details", desc: "Enter project specifications and material preferences" },
    { step: 4, title: "Review & Submit", desc: "Double-check your inputs and submit for analysis" },
    { step: 5, title: "Adjust Materials", desc: "Fine-tune material selections based on AI suggestions" },
    { step: 6, title: "Export Results", desc: "Download detailed reports in PDF or Excel format" }
  ];

  const teamMembers = [
    {
      name: "Muhammad Waris",
      role: "Full Stack Developer",
      avatar: "MW",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      contributions: [
        "AI Model Integration",
        "Backend Development",
        "Database Design",
        "API Development",
        "System Architecture"
      ],
    },
    {
      name: "Abdul Sattar",
      role: "Frontend Developer", 
      avatar: "AS",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      contributions: [
        "UI/UX Design",
        "React Components",
        "Responsive Design",
        "User Experience",
        "Bootstrap Integration"
      ],
    },
    {
      name: "Gulsher Ali",
      role: "Frontend Developer",
      avatar: "GA",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      contributions: [
        "Data Analysis",
        "ML Model Training",
        "Data Visualization",
        "Algorithm Optimization",
        "Performance Testing"
      ],
    }
  ];

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const openStepPopup = (step = steps[0]) => {
    setSelectedStep(step);
  };

  const closeStepPopup = () => {
    setSelectedStep(null);
  };

  const openMemberPopup = (member) => {
    setSelectedMember(member);
  };

  const closeMemberPopup = () => {
    setSelectedMember(null);
  };

  const navigateStep = (direction) => {
    const currentIndex = steps.findIndex(step => step.step === selectedStep.step);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex < steps.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : steps.length - 1;
    }
    
    setSelectedStep(steps[newIndex]);
  };

  return (
    <div className="help-page">
      <div className="container py-4 py-md-5">
        {/* Header */}
        <header className="text-center mb-4 mb-md-5">
          <h1 className="display-5 fw-bold gradient-text-primary mb-3">Help & Support</h1>
          <p className="lead text-muted d-none d-md-block">
            Get the most out of our AI Construction Cost Estimator
          </p>
        </header>

        {/* Mobile Section Toggle Buttons */}
        <div className="d-md-none mb-4">
          <div className="row g-2">
            <div className="col-6">
              <button
                onClick={() => setActiveSection('guide')}
                className={`section-toggle-btn w-100 ${activeSection === 'guide' ? 'active' : ''}`}
              >
                <i className="fas fa-map-signs me-2"></i>
                Guide
              </button>
            </div>
            <div className="col-6">
              <button
                onClick={() => setActiveSection('faqs')}
                className={`section-toggle-btn w-100 ${activeSection === 'faqs' ? 'active' : ''}`}
              >
                <i className="fas fa-question-circle me-2"></i>
                FAQs
              </button>
            </div>
          </div>
        </div>

        {/* Steps and FAQs in Single Row (Desktop) / Toggle (Mobile) */}
        <div className="row g-4 mb-5">
          {/* Steps Section */}
          <div className={`col-lg-6 ${activeSection === 'guide' ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-map-signs text-primary me-2"></i>
                  <h3 className="h5 fw-bold mb-0">How to Use</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="steps-list">
                  {steps.map((step) => (
                    <div 
                      key={step.step} 
                      className="step-item d-flex align-items-start p-3 border-bottom"
                      onClick={() => openStepPopup(step)}
                    >
                      <div className="step-number me-3 flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="step-content flex-grow-1">
                        <h6 className="fw-semibold mb-1 text-dark">{step.title}</h6>
                        <p className="text-muted small mb-0">{step.desc}</p>
                      </div>
                      <div className="step-action flex-shrink-0">
                        <i className="fas fa-chevron-right text-primary"></i>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <button 
                    onClick={() => openStepPopup()}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-play-circle me-2"></i>
                    Start Guided Tour
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className={`col-lg-6 ${activeSection === 'faqs' ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-question-circle text-primary me-2"></i>
                  <h3 className="h5 fw-bold mb-0">Frequently Asked Questions</h3>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="faq-accordion" style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {faqs.map((faq, index) => (
                    <div 
                      key={index} 
                      className={`faq-item border-bottom ${activeFAQ === index ? 'active' : ''}`}
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="faq-question-btn w-100 text-start p-3 border-0 bg-transparent"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold text-dark small">{faq.question}</span>
                          <span className="faq-icon text-primary fs-5">
                            {activeFAQ === index ? '−' : '+'}
                          </span>
                        </div>
                      </button>
                      {activeFAQ === index && (
                        <div className="faq-answer p-3 bg-light">
                          <p className="text-muted mb-0 small">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="about-section">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold text-center mb-4">
                <i className="fas fa-users me-2 text-primary"></i>
                About This Project
              </h2>
              <p className="text-muted text-center mb-4">
                This AI-powered construction cost estimation tool was developed as a Final Year Project by Team P-11 
                at the University of Sindh, Jamshoro. Our goal is to revolutionize construction cost estimation using 
                artificial intelligence and modern web technologies.
              </p>

              {/* Team Members */}
              <div className="row g-3">
                {teamMembers.map((member, index) => (
                  <div key={index} className="col-md-4">
                    <div 
                      className="team-card text-center p-3"
                      onClick={() => openMemberPopup(member)}
                    >
                      <div 
                        className="team-avatar mx-auto mb-3"
                        style={{ background: member.color }}
                      >
                        {member.avatar}
                      </div>
                      <h6 className="fw-bold mb-1">{member.name}</h6>
                      <p className="text-primary small fw-semibold mb-2">{member.role}</p>
                      <div className="team-action">
                        <span className="text-muted small">
                          <i className="fas fa-info-circle me-1"></i>
                          View Contributions
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Step Modal */}
      {selectedStep && (
        <div 
          className="modal fade show d-block"
          style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={closeStepPopup}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-map-signs me-2 text-primary"></i>
                  Step {selectedStep.step}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeStepPopup}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="step-modal-number mx-auto mb-3">
                  {selectedStep.step}
                </div>
                <h4 className="fw-bold mb-3">{selectedStep.title}</h4>
                <p className="text-muted mb-4">{selectedStep.desc}</p>
                
                <div className="step-progress-indicator d-flex justify-content-center gap-2 mb-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.step}
                      className={`progress-dot ${selectedStep.step === step.step ? 'active' : ''}`}
                    />
                  ))}
                </div>

                <div className="step-navigation-buttons d-flex gap-2">
                  <button
                    onClick={() => navigateStep('prev')}
                    className="btn btn-outline-secondary flex-fill"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Previous
                  </button>
                  <button
                    onClick={() => navigateStep('next')}
                    className="btn btn-primary flex-fill"
                  >
                    Next
                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {selectedMember && (
        <div 
          className="modal fade show d-block"
          style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={closeMemberPopup}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Team Member</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeMemberPopup}
                ></button>
              </div>
              <div className="modal-body text-center py-1">
                
                <h4 className="fw-bold">{selectedMember.name}</h4>
                <p className="text-primary fw-semibold mb-1">{selectedMember.role}</p>
                <p className="text-muted mb-2">{selectedMember.description}</p>

                <div className="contributions-section text-start">
                  <h6 className="fw-semibold mb-3">
                    <i className="fas fa-tasks me-2 text-primary"></i>
                    Key Contributions:
                  </h6>
                  <div className="contributions-list">
                    {selectedMember.contributions.map((contribution, index) => (
                      <div key={index} className="contribution-item d-flex align-items-center mb-2">
                        <i className="fas fa-check-circle text-success me-2"></i>
                        <span className="text-muted">{contribution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  onClick={closeMemberPopup}
                  className="btn btn-primary w-100"
                >
                  <i className="fas fa-times me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;