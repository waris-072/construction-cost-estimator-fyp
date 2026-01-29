import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Section */}
          <div className="col-md-4">
            <h3 className="text-primary fw-bold fs-5 mb-3">
              Construction Cost Estimator
            </h3>
            <p className="text-light-emphasis lh-base small">
              AI-powered construction cost estimation tool developed by Team P-11 
              at University of Sindh, Jamshoro.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-light-emphasis hover-primary">
                <i className="fab fa-github fs-5"></i>
              </a>
              <a href="" className="text-light-emphasis hover-primary">
                <i className="fas fa-envelope fs-5"></i>
              </a>
              <a href="" className="text-light-emphasis hover-primary">
                <i className="fas fa-phone fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h4 className="fw-semibold fs-6 mb-3">
              Quick Links
            </h4>
            <div className="d-flex flex-column gap-2">
              <Link 
                to="/" 
                className="text-light-emphasis text-decoration-none small hover-primary"
              >
                <i className="fas fa-chevron-right me-1"></i>
                Home
              </Link>
              <Link 
                to="/estimate" 
                className="text-light-emphasis text-decoration-none small hover-primary"
              >
                <i className="fas fa-chevron-right me-1"></i>
                Start Estimation
              </Link>
              <Link 
                to="/help" 
                className="text-light-emphasis text-decoration-none small hover-primary"
              >
                <i className="fas fa-chevron-right me-1"></i>
                Help & Support
              </Link>
              <Link 
                to="/login" 
                className="text-light-emphasis text-decoration-none small hover-primary"
              >
                <i className="fas fa-chevron-right me-1"></i>
                Login
              </Link>
            </div>
          </div>

          {/* Team Info */}
          <div className="col-md-4">
            <h4 className="fw-semibold fs-6 mb-3">
              Team P-11
            </h4>
            <div className="d-flex flex-column gap-2 text-light-emphasis small">
              <div><i className="fas fa-user me-2"></i>Muhammad Waris</div>
              <div><i className="fas fa-user me-2"></i>Abdul Sattar</div>
              <div><i className="fas fa-user me-2"></i>Gulsher Ali</div>
            </div>
            <div className="mt-4">
              <h6 className="fw-semibold fs-6 mb-2">Contact</h6>
              <p className="text-light-emphasis small mb-1">
                <i className="fas fa-university me-2"></i>
                University of Sindh, Jamshoro
              </p>
              <p className="text-light-emphasis small">
                <i className="fas fa-graduation-cap me-2"></i>
                Final Year Project 2025
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-top border-secondary pt-3 text-center text-muted">
          <p className="mb-2 small lh-base">
            © 2025 Team P-11, University of Sindh Jamshoro. All rights reserved.
          </p>
          <div className="d-flex justify-content-center gap-3 small flex-wrap mt-2">
            <Link to="/help" className="text-muted hover-primary text-decoration-none">
              Help Center
            </Link>
            <span className="text-muted">•</span>
            <a href="#" className="text-muted hover-primary text-decoration-none">
              Privacy Policy
            </a>
            <span className="text-muted">•</span>
            <a href="#" className="text-muted hover-primary text-decoration-none">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;