import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
    
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
      setShowDropdown(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    window.dispatchEvent(new Event('authChange'));
    
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    setIsMenuOpen(false);
    
    navigate('/');
    alert('Logged out successfully.');
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleSignup = () => {
    setIsMenuOpen(false);
    navigate('/signup');
  };

  const handleProfile = () => {
    setIsMenuOpen(false);
    setShowDropdown(false);
    navigate('/profile');
  };

  const handleAdminPanel = () => {
    setIsMenuOpen(false);
    setShowDropdown(false);
    navigate('/admin');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className={`sticky-top z-3 transition-all ${isScrolled ? 'bg-white-95 backdrop-blur border-bottom-light shadow-sm' : 'bg-white-98 border-bottom-light'}`}>
      <div className="container">
        <nav className="navbar navbar-expand-md py-2 py-lg-3">
          {/* Brand Logo */}
          {/* Brand Logo - static, not clickable */}
<div className="navbar-brand d-flex align-items-center gap-2 p-2 rounded-3">
  <div className="logo-icon bg-gradient-primary rounded-2 d-flex align-items-center justify-content-center text-white fw-bold shadow-primary">
    CCC
  </div>
  <span className="brand-text gradient-text fw-bold">
    Construction Cost Estimator
  </span>
</div>

          {/* Mobile Menu Button */}
          <button 
            className="navbar-toggler border-0 shadow-sm bg-white-80 backdrop-blur hover-lift"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className={`navbar-toggler-icon-custom ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Navigation Menu */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <div className="navbar-nav ms-auto gap-2 gap-lg-4 align-items-center">
              <Link 
                to="/" 
                onClick={handleNavClick}
                className={`nav-link nav-item-custom ${location.pathname === '/' ? 'active' : ''}`}
              > 
                <i className="fas fa-home me-1 d-md-none"></i>
                Home
                {location.pathname === '/' && <div className="nav-indicator"></div>}
              </Link>
              
              <Link 
                to="/estimate" 
                onClick={handleNavClick}
                className={`nav-link nav-item-custom ${location.pathname === '/estimate' ? 'active' : ''}`}
              > 
                <i className="fas fa-calculator me-1 d-md-none"></i>
                Estimation
                {location.pathname === '/estimate' && <div className="nav-indicator"></div>}
              </Link>
              
              <Link 
                to="/help" 
                onClick={handleNavClick}
                className={`nav-link nav-item-custom ${location.pathname === '/help' ? 'active' : ''}`}
              >
                <i className="fas fa-question-circle me-1 d-md-none"></i>
                Help
                {location.pathname === '/help' && <div className="nav-indicator"></div>}
              </Link>

              {/* Auth Section */}
              {isLoggedIn ? (
                <div className="position-relative" ref={dropdownRef}>
                  {/* User Profile Button - Desktop */}
                  <div className="d-none d-md-block">
                    <button 
                      className="nav-link d-flex align-items-center gap-2 bg-transparent border-0 p-2 rounded-3 user-dropdown-btn hover-lift"
                      onClick={toggleDropdown}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="user-avatar bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                           style={{width: '32px', height: '32px', fontSize: '14px'}}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="d-none d-lg-inline">{user?.name?.split(' ')[0] || 'User'}</span>
                      <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'} ms-1`}></i>
                    </button>
                    
                    {/* Custom Dropdown Menu */}
                    {showDropdown && (
                      <div className="dropdown-custom show position-absolute end-0 mt-1 shadow" 
                           style={{minWidth: '200px', zIndex: 1000}}>
                        <div className="dropdown-header px-3 py-2">
                          <div className="fw-bold">
                            <i className="fas fa-user me-2"></i>{user?.name}
                          </div>
                          <div className="small text-muted">
                            <i className="fas fa-envelope me-2"></i>{user?.email}
                          </div>
                          {user?.role === 'admin' && (
                            <span className="badge bg-primary mt-1 hover-lift">
                              <i className="fas fa-crown me-1"></i>Admin
                            </span>
                          )}
                        </div>
                        <div className="dropdown-divider"></div>
                        
                        <button className="dropdown-item hover-lift" onClick={handleProfile}>
                          <i className="fas fa-user-circle me-2"></i>Profile
                        </button>
                        
                        {user?.role === 'admin' && (
                          <button className="dropdown-item hover-lift" onClick={handleAdminPanel}>
                            <i className="fas fa-shield-alt me-2"></i>Admin Panel
                          </button>
                        )}
                        
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item text-danger hover-lift" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i>Logout
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile View Auth Buttons */}
                  <div className="d-md-none mt-2 pt-2 border-top">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="user-avatar bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold hover-lift" style={{width: '40px', height: '40px'}}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="fw-bold">
                          <i className="fas fa-user me-1"></i>{user?.name}
                        </div>
                        <div className="text-muted small">
                          <i className="fas fa-envelope me-1"></i>{user?.email}
                        </div>
                        {user?.role === 'admin' && (
                          <span className="badge bg-primary hover-lift">
                            <i className="fas fa-crown me-1"></i>Admin
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-outline-primary w-100 mb-2 hover-lift"
                      onClick={handleProfile}
                    >
                      <i className="fas fa-user-circle me-2"></i>Profile
                    </button>
                    
                    {user?.role === 'admin' && (
                      <button 
                        className="btn btn-outline-secondary w-100 mb-2 hover-lift"
                        onClick={handleAdminPanel}
                      >
                        <i className="fas fa-shield-alt me-2"></i>Admin Panel
                      </button>
                    )}
                    
                    <button 
                      className="btn btn-danger w-100 hover-lift"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Login/Signup for Desktop */}
                  <div className="d-none d-md-flex align-items-center gap-3">
                    <Link 
                      to="/login"
                      onClick={handleLogin}
                      className={`nav-link nav-item-custom ${location.pathname === '/login' ? 'active' : ''}`}
                    >
                      <i className="fas fa-sign-in-alt me-1"></i> Login
                      {location.pathname === '/login' && <div className="nav-indicator"></div>}
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={handleSignup}
                      className={`nav-link nav-item-custom ${location.pathname === '/signup' ? 'active' : ''}`}
                    >
                      <i className="fas fa-user-plus me-1"></i> Sign Up
                      {location.pathname === '/signup' && <div className="nav-indicator"></div>}
                    </Link>
                  </div>

                  {/* Login/Signup for Mobile */}
                  <div className="d-md-none mt-2 pt-2 border-top">
                    <Link 
                      to="/login"
                      className="nav-link nav-item-custom w-100 mb-2 text-center"
                      onClick={handleLogin}
                    >
                      <i className="fas fa-sign-in-alt me-1"></i> Login
                    </Link>
                    <Link 
                      to="/signup"
                      className="nav-link nav-item-custom w-100 text-center"
                      onClick={handleSignup}
                    >
                      <i className="fas fa-user-plus me-1"></i> Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;