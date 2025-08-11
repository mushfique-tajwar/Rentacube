import React, { Component } from 'react';
import axios from 'axios';
import { UserAPI } from '../services/api';

export default class AdminPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
  activeTab: 'users',
      users: [],
      listings: [],
  pendingRenters: [],
      isLoading: false,
      message: '',
  confirmAction: null,
      editingUser: null,
      editingListing: null,
      editForm: {
        username: '',
        fullName: '',
        email: '',
        userType: '',
        name: '',
        description: '',
        pricePerDay: '',
        district: '',
        city: '',
        category: '',
        isActive: true
      }
    };
  }

  componentDidMount() {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !isAdmin) {
      this.setState({ message: 'Access denied. Admin privileges required.' });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
  return;
    }
    
    this.fetchUsers();
    this.fetchListings();
  this.fetchPendingRenters();
  }

  fetchUsers = () => {
    this.setState({ isLoading: true });
    axios.get('http://localhost:3000/users')
      .then(response => {
        this.setState({ users: response.data, isLoading: false });
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        this.setState({ 
          message: 'Error fetching users: ' + (error.response?.data || error.message),
          isLoading: false 
        });
      });
  }

  fetchListings = () => {
    this.setState({ isLoading: true });
    axios.get('http://localhost:3000/listings/admin/all?adminUsername=admin')
      .then(response => {
        this.setState({ listings: response.data, isLoading: false });
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        this.setState({ 
          message: 'Error fetching listings: ' + (error.response?.data || error.message),
          isLoading: false 
        });
      });
  }

  fetchPendingRenters = () => {
    this.setState({ isLoading: true });
    UserAPI.pendingRenters()
      .then(({data}) => {
        this.setState({ pendingRenters: data, isLoading: false });
      })
      .catch(error => {
        console.error('Error fetching pending renters:', error);
        this.setState({ 
          message: 'Error fetching pending renters: ' + (error.response?.data || error.message),
          isLoading: false 
        });
      });
  }

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab, message: '', editingUser: null, editingListing: null });
  if (tab === 'approvals') this.fetchPendingRenters();
  }

  handleDeleteUser = (userId) => {
    this.setState({ confirmAction: { type: 'delete-user', id: userId, text: 'Are you sure you want to delete this user? This action cannot be undone.' } });
  }

  handleDeleteListing = (listingId) => {
    this.setState({ confirmAction: { type: 'delete-listing', id: listingId, text: 'Are you sure you want to delete this listing? This action cannot be undone.' } });
  }

  handleEditUser = (user) => {
    this.setState({
      editingUser: user._id,
      editForm: {
        ...this.state.editForm,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType
      }
    });
  }

  handleEditListing = (listing) => {
    const pricing = listing.pricing || {};
    this.setState({
      editingListing: listing._id,
      editForm: {
        ...this.state.editForm,
        name: listing.name,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
        pricingHourly: pricing.hourly || '',
        pricingDaily: pricing.daily || '',
        pricingMonthly: pricing.monthly || '',
        district: listing.district,
        city: listing.city,
        category: listing.category,
        isActive: listing.isActive
      }
    });
  }

  handleFormChange = (field, value) => {
    this.setState({
      editForm: {
        ...this.state.editForm,
        [field]: value
      }
    });
  }

  handleUpdateUser = () => {
    const { editingUser, editForm } = this.state;
    
    axios.put(`http://localhost:3000/users/admin/update/${editingUser}`, {
      username: editForm.username,
      fullName: editForm.fullName,
      email: editForm.email,
      userType: editForm.userType,
      adminUsername: 'admin'
    })
      .then(() => {
        this.setState({ 
          message: 'User updated successfully!', 
          editingUser: null 
        });
        this.fetchUsers();
      })
      .catch(error => {
        this.setState({ message: 'Error updating user: ' + (error.response?.data || error.message) });
      });
  }

  handleUpdateListing = () => {
    const { editingListing, editForm } = this.state;
    
    const updateData = {
      name: editForm.name,
      description: editForm.description,
      pricePerDay: editForm.pricePerDay,
      district: editForm.district,
      city: editForm.city,
      category: editForm.category,
      isActive: editForm.isActive,
      adminUsername: 'admin'
    };
    
    // Add new pricing fields if they have values
    if (editForm.pricingHourly) updateData.pricingHourly = editForm.pricingHourly;
    if (editForm.pricingDaily) updateData.pricingDaily = editForm.pricingDaily;
    if (editForm.pricingMonthly) updateData.pricingMonthly = editForm.pricingMonthly;
    
    axios.put(`http://localhost:3000/listings/admin/update/${editingListing}`, updateData)
      .then(() => {
        this.setState({ 
          message: 'Listing updated successfully!', 
          editingListing: null 
        });
        this.fetchListings();
      })
      .catch(error => {
        this.setState({ message: 'Error updating listing: ' + (error.response?.data || error.message) });
      });
  }

  approveRenter = (userId, status) => {
    UserAPI.approveRenter(userId, status)
      .then(() => {
        this.setState({ message: `Renter ${status}` });
        this.fetchPendingRenters();
        this.fetchUsers();
      })
      .catch(error => {
        this.setState({ message: 'Error updating approval: ' + (error.response?.data || error.message) });
      });
  }

  // Helper function to format pricing display
  formatPricing = (listing) => {
    const pricing = listing.pricing || {};
    const prices = [];
    
    if (pricing.hourly) {
      prices.push(`$${pricing.hourly}/hr`);
    }
    if (pricing.daily) {
      prices.push(`$${pricing.daily}/day`);
    }
    if (pricing.monthly) {
      prices.push(`$${pricing.monthly}/mo`);
    }
    
    // Fallback to legacy pricePerDay if no pricing structure exists
    if (prices.length === 0 && listing.pricePerDay) {
      prices.push(`$${listing.pricePerDay}/day`);
    }
    
    return prices.length > 0 ? prices.join(', ') : 'Price on request';
  }

  render() {
    const { activeTab, users, listings, isLoading, message, editingUser, editingListing, editForm } = this.state;

    return (
      <div className="container-fluid mt-4">
        <h2 className="mb-4">
          <i className="fas fa-cog me-2"></i>Admin Panel
        </h2>

        {message && (
          <div className={`alert ${message.includes('Error') || message.includes('denied') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => this.handleTabChange('users')}
            >
              <i className="fas fa-users me-2"></i>Manage Users
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => this.handleTabChange('listings')}
            >
              <i className="fas fa-list me-2"></i>Manage Listings
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => this.handleTabChange('approvals')}
            >
              <i className="fas fa-check-circle me-2"></i>Approvals
            </button>
          </li>
        </ul>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="row">
            <div className="col-12">
              <h4>Users Management</h4>
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="card shadow">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>User Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id}>
                          <td>
                            {editingUser === user._id ? (
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={editForm.username}
                                onChange={(e) => this.handleFormChange('username', e.target.value)}
                              />
                            ) : (
                              user.username
                            )}
                          </td>
                          <td>
                            {editingUser === user._id ? (
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={editForm.fullName}
                                onChange={(e) => this.handleFormChange('fullName', e.target.value)}
                              />
                            ) : (
                              user.fullName
                            )}
                          </td>
                          <td>
                            {editingUser === user._id ? (
                              <input 
                                type="email" 
                                className="form-control form-control-sm"
                                value={editForm.email}
                                onChange={(e) => this.handleFormChange('email', e.target.value)}
                              />
                            ) : (
                              user.email
                            )}
                          </td>
                          <td>
                            {editingUser === user._id ? (
                              <select 
                                className="form-select form-select-sm"
                                value={editForm.userType}
                                onChange={(e) => this.handleFormChange('userType', e.target.value)}
                              >
                                <option value="customer">Customer</option>
                                <option value="renter">Renter</option>
                              </select>
                            ) : (
                              <span className={`badge ${user.userType === 'renter' ? 'bg-success' : 'bg-primary'}`}>
                                {user.userType === 'renter' ? '🏠 Renter' : '🛒 Customer'}
                              </span>
                            )}
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            {editingUser === user._id ? (
                              <>
                                <button 
                                  className="btn btn-success btn-sm me-2"
                                  onClick={this.handleUpdateUser}
                                >
                                  <i className="fas fa-save"></i>
                                </button>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => this.setState({ editingUser: null })}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="btn btn-warning btn-sm me-2"
                                  onClick={() => this.handleEditUser(user)}
                                  disabled={user.username === 'admin'}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => this.handleDeleteUser(user._id)}
                                  disabled={user.username === 'admin'}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

  {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="row">
            <div className="col-12">
              <h4>Listings Management</h4>
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="card shadow">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Category</th>
                        <th>Price/Day</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(listing => (
                        <tr key={listing._id}>
                          <td>
                            {editingListing === listing._id ? (
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={editForm.name}
                                onChange={(e) => this.handleFormChange('name', e.target.value)}
                              />
                            ) : (
                              listing.name
                            )}
                          </td>
                          <td>{listing.owner}</td>
                          <td>
                            {editingListing === listing._id ? (
                              <select 
                                className="form-select form-select-sm"
                                value={editForm.category}
                                onChange={(e) => this.handleFormChange('category', e.target.value)}
                              >
                                <option value="vehicles">Vehicles</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="home">Home</option>
                                <option value="property">Property</option>
                                <option value="sports">Sports</option>
                                <option value="services">Services</option>
                              </select>
                            ) : (
                              <span className="badge bg-primary">
                                {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingListing === listing._id ? (
                              <div>
                                <div className="row g-1">
                                  <div className="col-4">
                                    <input 
                                      type="number" 
                                      className="form-control form-control-sm"
                                      placeholder="Hourly"
                                      value={editForm.pricingHourly || ''}
                                      onChange={(e) => this.handleFormChange('pricingHourly', e.target.value)}
                                    />
                                    <small className="text-muted">$/hr</small>
                                  </div>
                                  <div className="col-4">
                                    <input 
                                      type="number" 
                                      className="form-control form-control-sm"
                                      placeholder="Daily"
                                      value={editForm.pricingDaily || ''}
                                      onChange={(e) => this.handleFormChange('pricingDaily', e.target.value)}
                                    />
                                    <small className="text-muted">$/day</small>
                                  </div>
                                  <div className="col-4">
                                    <input 
                                      type="number" 
                                      className="form-control form-control-sm"
                                      placeholder="Monthly"
                                      value={editForm.pricingMonthly || ''}
                                      onChange={(e) => this.handleFormChange('pricingMonthly', e.target.value)}
                                    />
                                    <small className="text-muted">$/mo</small>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              this.formatPricing(listing)
                            )}
                          </td>
                          <td>
                            {editingListing === listing._id ? (
                              <div>
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm mb-1"
                                  placeholder="City"
                                  value={editForm.city}
                                  onChange={(e) => this.handleFormChange('city', e.target.value)}
                                />
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm"
                                  placeholder="District"
                                  value={editForm.district}
                                  onChange={(e) => this.handleFormChange('district', e.target.value)}
                                />
                              </div>
                            ) : (
                              `${listing.city}, ${listing.district}`
                            )}
                          </td>
                          <td>
                            {editingListing === listing._id ? (
                              <select 
                                className="form-select form-select-sm"
                                value={editForm.isActive}
                                onChange={(e) => this.handleFormChange('isActive', e.target.value === 'true')}
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            ) : (
                              <span className={`badge ${listing.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {listing.isActive ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td>{listing.views}</td>
                          <td>
                            {editingListing === listing._id ? (
                              <>
                                <button 
                                  className="btn btn-success btn-sm me-2"
                                  onClick={this.handleUpdateListing}
                                >
                                  <i className="fas fa-save"></i>
                                </button>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => this.setState({ editingListing: null })}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="btn btn-warning btn-sm me-2"
                                  onClick={() => this.handleEditListing(listing)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => this.handleDeleteListing(listing._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="row">
            <div className="col-12">
              <h4>Pending Renter Approvals</h4>
              <div className="card shadow">
                <div className="card-body">
                  {this.state.pendingRenters.length === 0 ? (
                    <p className="text-muted mb-0">No pending renters.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Requested</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.pendingRenters.map(u => (
                            <tr key={u._id}>
                              <td>{u.username}</td>
                              <td>{u.fullName}</td>
                              <td>{u.email}</td>
                              <td>{u.phone || '-'}</td>
                              <td>{u.location || '-'}</td>
                              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button className="btn btn-success btn-sm me-2" onClick={()=>this.approveRenter(u._id, 'approved')}>Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={()=>this.approveRenter(u._id, 'rejected')}>Reject</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
