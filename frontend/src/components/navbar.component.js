import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isLoggedIn: false,
      username: ''
    };
  }

  // This would typically come from your authentication system
  // For now, you can manually set this or integrate with your auth logic
  componentDidMount() {
    // Check if user is logged in from localStorage or your auth system
    const savedUser = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (savedUser && isLoggedIn) {
      this.setState({
        isLoggedIn: true,
        username: savedUser
      });
    }
  }

  handleSignOut = () => {
    // Clear localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('isLoggedIn');
    
    // Update state
    this.setState({
      isLoggedIn: false,
      username: ''
    });
    
    // Redirect to home
    window.location.href = '/';
  }
  render() {
    return (
      <>
        <nav className="navbar navbar-expand-lg navbar-light bg-info">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand">Rentacube</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link to="/" className="nav-link">Home</Link>
                </li>
                <li className="nav-item">
                  <Link to="/about" className="nav-link">About</Link>
                </li>
                <li className="nav-item">
                  <Link to="/contact" className="nav-link">Contact</Link>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto">
                {this.state.isLoggedIn ? (
                  <>
                    <li className="nav-item">
                      <Link to="/dashboard" className="nav-link">
                        <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                      </Link>
                    </li>
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
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
          <div className="container-fluid">
            <span className="navbar-text mx-auto">
              Welcome, {this.state.isLoggedIn ? this.state.username : 'Guest'}
            </span>
          </div>
        </nav>
      </>
    );
  }
}