import React, { Component } from 'react';
import axios from 'axios';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        username: '',
        email: '',
        createdAt: ''
      },
      listings: [],
      bookings: [],
      analytics: {
        totalViews: 0,
        totalEarnings: 0,
        activeListings: 0,
        completedBookings: 0
      },
      activeTab: 'profile',
      isLoading: true,
      message: ''
    };
  }

  componentDidMount() {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!username || !isLoggedIn) {
      // Redirect to sign in if not logged in
      window.location.href = '/signin';
      return;
    }

    this.loadUserData(username);
  }

  loadUserData = (username) => {
    // For now, we'll simulate data since we don't have all endpoints yet
    // In a real app, you'd make API calls to get user data, listings, bookings, etc.
    
    // Simulate loading user profile
    setTimeout(() => {
      this.setState({
        user: {
          username: username,
          email: `${username}@example.com`, // This would come from API
          createdAt: new Date().toLocaleDateString()
        },
        listings: [
          { id: 1, title: 'Modern Apartment', price: '$120/night', status: 'Active', views: 45 },
          { id: 2, title: 'Cozy Studio', price: '$80/night', status: 'Active', views: 32 }
        ],
        bookings: [
          { id: 1, property: 'Beach House', dates: 'Dec 1-5, 2024', status: 'Confirmed', amount: '$400' },
          { id: 2, property: 'City Loft', dates: 'Nov 15-18, 2024', status: 'Completed', amount: '$300' }
        ],
        analytics: {
          totalViews: 77,
          totalEarnings: 700,
          activeListings: 2,
          completedBookings: 1
        },
        isLoading: false
      });
    }, 500);
  }

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  }

  renderProfile = () => (
    <div className="card shadow">
      <div className="card-header">
        <h5>User Profile</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <p><strong>Username:</strong> {this.state.user.username}</p>
            <p><strong>Email:</strong> {this.state.user.email}</p>
            <p><strong>Member Since:</strong> {this.state.user.createdAt}</p>
          </div>
          <div className="col-md-6">
            <div className="text-center">
              <div className="bg-light rounded p-3">
                <i className="fas fa-user fa-3x text-muted mb-2"></i>
                <p className="mb-0">Profile Picture</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  renderListingsAndBookings = () => (
    <div className="row">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-header">
            <h5>My Listings</h5>
          </div>
          <div className="card-body">
            {this.state.listings.length === 0 ? (
              <p className="text-muted">No listings yet</p>
            ) : (
              this.state.listings.map(listing => (
                <div key={listing.id} className="border-bottom pb-2 mb-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6>{listing.title}</h6>
                      <p className="mb-1 text-muted">{listing.price}</p>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${listing.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {listing.status}
                      </span>
                      <p className="mb-0 small text-muted">{listing.views} views</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <button className="btn btn-primary btn-sm mt-2">Add New Listing</button>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-header">
            <h5>My Bookings</h5>
          </div>
          <div className="card-body">
            {this.state.bookings.length === 0 ? (
              <p className="text-muted">No bookings yet</p>
            ) : (
              this.state.bookings.map(booking => (
                <div key={booking.id} className="border-bottom pb-2 mb-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6>{booking.property}</h6>
                      <p className="mb-1 text-muted">{booking.dates}</p>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${booking.status === 'Confirmed' ? 'bg-warning' : 'bg-success'}`}>
                        {booking.status}
                      </span>
                      <p className="mb-0 small text-muted">{booking.amount}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )

  renderAnalytics = () => (
    <div className="row">
      <div className="col-md-3">
        <div className="card bg-primary text-white shadow">
          <div className="card-body text-center">
            <h3>{this.state.analytics.totalViews}</h3>
            <p className="mb-0">Total Views</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-success text-white shadow">
          <div className="card-body text-center">
            <h3>${this.state.analytics.totalEarnings}</h3>
            <p className="mb-0">Total Earnings</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-info text-white shadow">
          <div className="card-body text-center">
            <h3>{this.state.analytics.activeListings}</h3>
            <p className="mb-0">Active Listings</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-warning text-white shadow">
          <div className="card-body text-center">
            <h3>{this.state.analytics.completedBookings}</h3>
            <p className="mb-0">Completed Bookings</p>
          </div>
        </div>
      </div>
    </div>
  )

  renderSettings = () => (
    <div className="card shadow">
      <div className="card-header">
        <h5>Personal Settings</h5>
      </div>
      <div className="card-body">
        <form>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={this.state.user.username}
                  readOnly
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={this.state.user.email}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Leave empty to keep current password"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="City, Country"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Bio</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Update Settings</button>
        </form>
      </div>
    </div>
  )

  render() {
    if (this.state.isLoading) {
      return (
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h2>Dashboard</h2>
            <p className="text-muted">Welcome back, {this.state.user.username}!</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('profile')}
            >
              Profile
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('listings')}
            >
              Listings & Bookings
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('analytics')}
            >
              Analytics
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('settings')}
            >
              Settings
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {this.state.activeTab === 'profile' && this.renderProfile()}
          {this.state.activeTab === 'listings' && this.renderListingsAndBookings()}
          {this.state.activeTab === 'analytics' && this.renderAnalytics()}
          {this.state.activeTab === 'settings' && this.renderSettings()}
        </div>
      </div>
    );
  }
}
