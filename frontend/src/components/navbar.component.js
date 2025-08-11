import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// Future: move auth logic to controllers/AuthController

export default class Navbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      username: '',
      fullName: '',
      userType: '',
  isAdmin: false,
  darkMode: localStorage.getItem('darkMode') === 'true',
  searchQuery: new URLSearchParams(window.location.search).get('q') || ''
    };
  }

  componentDidMount() {
    const savedUser = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName') || '';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Safely parse admin flag
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');

    // Normalize userType string
    const userType = (localStorage.getItem('userType') || '').toLowerCase();

    // Debug logs to confirm what's being loaded
    console.log("=== NAVBAR DEBUG ===");
    console.log("Loaded from localStorage:");
    console.log("username:", savedUser);
    console.log("fullName:", fullName);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("userType:", userType);
    console.log("isAdmin:", isAdmin);
    console.log("typeof isAdmin:", typeof isAdmin);
    console.log("=== END DEBUG ===");

    if (savedUser && isLoggedIn) {
      this.setState({
        isLoggedIn: true,
        username: savedUser,
        fullName: fullName,
        userType: userType,
        isAdmin: isAdmin
      });
    }

    // Apply dark mode class if needed
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }

  handleSignOut = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userType');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isLoggedIn');

    this.setState({
      isLoggedIn: false,
      username: '',
      fullName: '',
      userType: '',
      isAdmin: false
    });

    window.location.href = '/';
  }

  toggleDarkMode = () => {
    this.setState(prev => ({ darkMode: !prev.darkMode }), () => {
      localStorage.setItem('darkMode', this.state.darkMode);
      if (this.state.darkMode) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
    });
  }

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  }

  submitSearch = (e) => {
    e.preventDefault();
    const q = (this.state.searchQuery || '').trim();
    const url = q ? `/?q=${encodeURIComponent(q)}` : '/';
    window.location.href = url;
  }

  render() {
  const { isLoggedIn, isAdmin, userType, fullName, username, darkMode } = this.state;
    const userDisplayName = fullName || username;

    let badgeClass = 'bg-primary';
    let badgeLabel = '🛒 Customer';

    if (isAdmin) {
      badgeClass = 'bg-danger';
      badgeLabel = '👑 Admin';
    } else if (userType === 'renter') {
      badgeClass = 'bg-success';
      badgeLabel = '🏠 Renter';
    }

    return (
      <>
  <nav className="navbar navbar-expand-lg navbar-light fixed-sky fixed-top">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <img 
                src="/Logo.png" 
                alt="Rentacube Logo" 
                height="40" 
                className="me-2"
              />
              Rentacube
            </Link>
            <div className="collapse navbar-collapse">
              {/* Stretched minimal search between brand and actions */}
              <div className="flex-grow-1 mx-3">
                <form className="d-flex w-100" onSubmit={this.submitSearch} role="search">
                  <div className="input-group input-group-sm w-100 minimal-search-group">
                    <span className="input-group-text search-addon">
                      <i className="fas fa-search" aria-hidden="true"></i>
                    </span>
                    <input
                      type="search"
                      className="form-control minimal-search-input"
                      placeholder="Search listings..."
                      aria-label="Search"
                      value={this.state.searchQuery}
                      onChange={this.handleSearchChange}
                    />
                  </div>
                </form>
              </div>
              <ul className="navbar-nav ms-auto">
                <li className="nav-item d-flex align-items-center me-2">
                  <button
                    onClick={this.toggleDarkMode}
                    className="btn btn-sm btn-outline-primary"
                    style={{ minWidth: '42px' }}
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                  </button>
                </li>
                {isLoggedIn ? (
                  <>
                    {isAdmin ? (
                      <li className="nav-item">
                        <Link to="/admin" className="nav-link">
                          <i className="fas fa-cog me-1"></i>Admin Panel
                        </Link>
                      </li>
                    ) : (
                      <li className="nav-item">
                        <Link to="/dashboard" className="nav-link">
                          <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                        </Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <button 
                        className="nav-link btn btn-link" 
                        onClick={this.handleSignOut}
                        style={{ border: 'none', padding: '0.5rem 1rem', color: 'rgba(0,0,0,.55)' }}
                      >
                        <i className="fas fa-sign-out-alt me-1"></i>Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link to="/signin" className="nav-link">
                        <i className="fas fa-sign-in-alt me-1"></i>Sign In
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/create-user" className="nav-link">
                        <i className="fas fa-user-plus me-1"></i>Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Secondary navbar for welcome message */}
        {isLoggedIn && (
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <div className="container-fluid">
              <span className="navbar-text mx-auto">
                Welcome, {userDisplayName}
                <span className={`badge ms-2 ${badgeClass}`}>
                  {badgeLabel}
                </span>
              </span>
            </div>
          </nav>
        )}
      </>
    );
  }
}
