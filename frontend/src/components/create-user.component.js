import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default class CreateUser extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeFullName = this.onChangeFullName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
  this.onChangePassword = this.onChangePassword.bind(this);
  this.onChangePassword2 = this.onChangePassword2.bind(this);
  this.onChangePhone = this.onChangePhone.bind(this);
  this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onChangeUserType = this.onChangeUserType.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      fullName: '',
      email: '',
  password: '',
  password2: '',
  phone: '',
  location: '',
      userType: 'customer', // Default to customer
      message: '',
      isLoading: false
    };
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangeFullName(e) {
    this.setState({
      fullName: e.target.value
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }
  onChangePassword2(e) {
    this.setState({ password2: e.target.value });
  }
  onChangePhone(e) {
    this.setState({ phone: e.target.value });
  }
  onChangeLocation(e) {
    this.setState({ location: e.target.value });
  }

  onChangeUserType(e) {
    const nextType = e.target.value;
    this.setState({ userType: nextType }, () => {
      if (nextType === 'renter' && !this.state.phone) {
        this.setState({ message: 'Phone number is required to register as a renter.' });
      }
    });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true, message: '' });

    if (this.state.password !== this.state.password2) {
      this.setState({ isLoading: false, message: 'Error: Passwords do not match' });
      return;
    }

  const user = {
      username: this.state.username,
      fullName: this.state.fullName,
      email: this.state.email,
  password: this.state.password,
  phone: this.state.phone,
  location: this.state.location,
      userType: this.state.userType
    };

    console.log('Submitting user:', user);

    axios.post('http://localhost:3000/users/add', user)
      .then(res => {
        console.log('User created successfully:', res.data);
        // Save username, fullName and userType to localStorage for navbar display
  localStorage.setItem('username', this.state.username);
  localStorage.setItem('fullName', res.data.fullName || this.state.fullName);
  if (res.data.email || this.state.email) localStorage.setItem('email', res.data.email || this.state.email);
  localStorage.setItem('userType', res.data.userType || this.state.userType);
    if (res.data.approvalStatus) localStorage.setItem('approvalStatus', res.data.approvalStatus);
  localStorage.setItem('phone', res.data.phone || this.state.phone || '');
  localStorage.setItem('isAdmin', JSON.stringify(res.data.isAdmin || false));
  if (res.data.createdAt) localStorage.setItem('createdAt', res.data.createdAt);
        localStorage.setItem('isLoggedIn', 'true');
        this.setState({
          message: 'User created successfully!',
          isLoading: false,
          username: '',
          fullName: '',
          email: '',
          password: '',
          userType: 'customer',
          password2: '',
          phone: '',
          location: ''
        });
        // Redirect based on user type - admin goes to admin panel, others go to homepage
        setTimeout(() => {
          if (res.data.isAdmin) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
          }
        }, 1500);
      })
      .catch(err => {
        console.error('Error creating user:', err.response?.data || err.message);
        this.setState({
          message: `Error: ${err.response?.data || err.message}`,
          isLoading: false
        });
      });
  }
  render() {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="card shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
          <div className="card-body">
            <h2 className="text-center mb-4">Create User</h2>
            {this.state.message && (
              <div className={`alert ${this.state.message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                {this.state.message}
              </div>
            )}
            <form onSubmit={this.onSubmit}>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Username:</label>
            <input 
              type="text" 
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}
              required
              minLength="3"
              maxLength="20"
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Full Name:</label>
            <input 
              type="text" 
              className="form-control"
              value={this.state.fullName}
              onChange={this.onChangeFullName}
              required
              minLength="2"
              maxLength="50"
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Email:</label>
            <input 
              type="email" 
              className="form-control"
              value={this.state.email}
              onChange={this.onChangeEmail}
              required
              placeholder="Enter your email address"
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Password:</label>
            <input 
              type="password" 
              className="form-control"
              value={this.state.password}
              onChange={this.onChangePassword}
              required
              minLength="6"
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Confirm Password:</label>
            <input 
              type="password" 
              className="form-control"
              value={this.state.password2}
              onChange={this.onChangePassword2}
              required
              minLength="6"
              placeholder="Re-enter your password"
            />
            {this.state.password && this.state.password2 && this.state.password !== this.state.password2 && (
              <div className="form-text text-danger">Passwords do not match</div>
            )}
          </div>
      <div className="form-group mb-3">
            <label className="form-label mb-2">Phone Number:</label>
            <input 
              type="tel" 
              className="form-control"
              value={this.state.phone}
              onChange={this.onChangePhone}
        placeholder={this.state.userType === 'renter' ? 'Required for renters' : 'Optional phone number'}
        required={this.state.userType === 'renter'}
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Location:</label>
            <input 
              type="text" 
              className="form-control"
              value={this.state.location}
              onChange={this.onChangeLocation}
              placeholder="City, District"
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label mb-2">Account Type:</label>
            <select 
              className="form-select"
              value={this.state.userType}
              onChange={this.onChangeUserType}
              required
            >
              <option value="customer">🛒 Customer - I want to rent items</option>
              <option value="renter">🏠 Renter - I want to rent out my items</option>
            </select>
            <div className="form-text">
              Choose "Customer" to browse and rent items, or "Renter" to create and manage your own listings.
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={this.state.isLoading}
          >
              {this.state.isLoading ? 'Creating User...' : 'Create User'}
            </button>
          </form>
          
          <div className="mt-3 text-center">
            <p>Already have an account? <Link to="/signin">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
    );
  }
}