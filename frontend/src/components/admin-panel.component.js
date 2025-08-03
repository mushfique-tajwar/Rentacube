import React, { Component } from 'react';
import axios from 'axios';

export default class AdminPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'users',
      users: [],
      listings: [],
      isLoading: false,
      message: '',
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

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab, message: '', editingUser: null, editingListing: null });
  }

  handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      axios.delete(`http://localhost:3000/users/admin/delete/${userId}`, {
        data: { adminUsername: 'admin' }
      })
        .then(() => {
          this.setState({ message: 'User deleted successfully!' });
          this.fetchUsers();
        })
        .catch(error => {
          this.setState({ message: 'Error deleting user: ' + (error.response?.data || error.message) });
        });
    }
  }

  handleDeleteListing = (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      axios.delete(`http://localhost:3000/listings/admin/delete/${listingId}`, {
        data: { adminUsername: 'admin' }
      })
        .then(() => {
          this.setState({ message: 'Listing deleted successfully!' });
          this.fetchListings();
        })
        .catch(error => {
          this.setState({ message: 'Error deleting listing: ' + (error.response?.data || error.message) });
        });
    }
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
    this.setState({
      editingListing: listing._id,
      editForm: {
        ...this.state.editForm,
        name: listing.name,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
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
    
    axios.put(`http://localhost:3000/listings/admin/update/${editingListing}`, {
      name: editForm.name,
      description: editForm.description,
      pricePerDay: editForm.pricePerDay,
      district: editForm.district,
      city: editForm.city,
      category: editForm.category,
      isActive: editForm.isActive,
      adminUsername: 'admin'
    })
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
                                <option value="renter">Renter</option>
                                <option value="lister">Lister</option>
                              </select>
                            ) : (
                              <span className={`badge ${user.userType === 'lister' ? 'bg-success' : 'bg-primary'}`}>
                                {user.userType === 'lister' ? '📋 Lister' : '🏠 Renter'}
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
                              <input 
                                type="number" 
                                className="form-control form-control-sm"
                                value={editForm.pricePerDay}
                                onChange={(e) => this.handleFormChange('pricePerDay', e.target.value)}
                              />
                            ) : (
                              `$${listing.pricePerDay}`
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
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
