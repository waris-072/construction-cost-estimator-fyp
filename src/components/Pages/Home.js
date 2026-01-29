import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/cce-hero.jpg';
import demoVideo from "../../assets/cce-demo.mp4";

const Home = () => {
  return (
    <div>
      {/* HERO SECTION - Same as before */}
      <section 
        className="hero-section position-relative text-white text-center"
        style={{
          background: `linear-gradient(rgba(102, 126, 234, 0.1), rgba(161, 131, 190, 0.1)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container">
          <h1 className="hero-heading fw-bold mb-3 mb-lg-4">
            AI-Powered <span className="gradient-orange-text">Construction Cost</span> Estimator
          </h1>
          
          <p className="hero-subtitle mb-4 mb-lg-5 mx-auto fw-medium">
            Quickly predict cost & duration of your construction project with AI. Get accurate estimates in minutes with our advanced prediction algorithms.
          </p>
          
          <div className="hero-buttons d-flex gap-3 justify-content-center align-items-center flex-wrap">
            <Link to="/estimate" className="btn btn-primary-custom btn-lg">
              Go to Estimation
            </Link>
            <a
            href={demoVideo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-light-custom btn-lg"
            >
              View Demo
            </a>
          </div>
        </div>
        <div className="wave-separator"></div>
      </section>

      {/* WHY CHOOSE SECTION - FIXED CARDS */}
      <section className="why-choose-section bg-light py-5 py-lg-8">
        <div className="container">
          <div className="text-center mb-4 mb-lg-6">
            <h2 className="section-heading fw-bold mb-2 mb-lg-3 text-dark">
              Why Choose <span className="gradient-orange-text">Our Estimator?</span>
            </h2>
            <p className="section-subtitle text-muted mx-auto">
              Built with cutting-edge AI technology to provide the most accurate construction cost estimates
            </p>
          </div>

          {/* Features Grid - FIXED CARDS */}
          <div className="row g-4 g-lg-5">
            {/* Feature 1 - Multi-Input Support */}
            <div className="col-md-4">
              <div className="feature-card orange">
                <div className="feature-icon bg-orange-gradient">
                  📥
                </div>
                <h3 className="feature-title">
                  Multi-Input Support
                </h3>
                <p className="feature-text">
                  Support for manual forms & voice input for maximum flexibility, .
                </p>
              </div>
            </div>

            {/* Feature 2 - AI Cost & Time Prediction */}
            <div className="col-md-4">
              <div className="feature-card blue">
                <div className="feature-icon bg-blue-gradient">
                  🤖
                </div>
                <h3 className="feature-title">
                  Cost Predictions
                </h3>
                <p className="feature-text">
                  Analyze your project details to provide cost estimates and timeline predictions.(for not included cities).
                </p>
              </div>
            </div>

            {/* Feature 3 - Expert Reports */}
            <div className="col-md-4">
              <div className="feature-card green">
                <div className="feature-icon bg-green-gradient">
                  📊
                </div>
                <h3 className="feature-title">
                  Expert Reports
                </h3>
                <p className="feature-text">
                  Generate detailed pdf reports with complete cost breakdowns and project specifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Same as before */}
      <section className="cta-section bg-gradient-blue text-white text-center py-5 py-lg-8">
        <div className="container">
          <h3 className="cta-heading fw-bold mb-2 mb-lg-3">
            Get Started Now
          </h3>
          <p className="cta-subtitle mb-4 mb-lg-5 opacity-90">
            Start estimating your construction costs in minutes
          </p>
          <Link to="/estimate" className="btn btn-light-custom btn-lg">
            Start Estimation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;