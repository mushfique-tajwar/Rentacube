import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

export default class CreateUser extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeFullName = this.onChangeFullName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeUserType = this.onChangeUserType.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      fullName: '',
      email: '',
      password: '',
      userType: 'renter', // Default to renter
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

  onChangeUserType(e) {
    this.setState({
      userType: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true, message: '' });

    const user = {
      username: this.state.username,
      fullName: this.state.fullName,
      email: this.state.email,
      password: this.state.password,
      userType: this.state.userType
    };

    console.log('Submitting user:', user);

    axios.post('http://localhost:3000/users/add', user)
      .then(res => {
        console.log('User created successfully:', res.data);
        // Save username, fullName and userType to localStorage for navbar display
        localStorage.setItem('username', this.state.username);
        localStorage.setItem('fullName', res.data.fullName || this.state.fullName);
        localStorage.setItem('userType', res.data.userType || this.state.userType);
        localStorage.setItem('isAdmin', JSON.stringify(res.data.isAdmin || false));
        localStorage.setItem('isLoggedIn', 'true');
        this.setState({
          message: 'User created successfully!',
          isLoading: false,
          username: '',
          fullName: '',
          email: '',
          password: '',
          userType: 'renter'
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
      <div className="container">
        <h2>Create User</h2>
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
            <label className="form-label mb-2">Account Type:</label>
            <select 
              className="form-select"
              value={this.state.userType}
              onChange={this.onChangeUserType}
              required
            >
              <option value="renter">🏠 Renter - I want to rent items</option>
              <option value="lister">📋 Lister - I want to rent out my items</option>
            </select>
            <div className="form-text">
              Choose "Renter" to browse and rent items, or "Lister" to create and manage your own listings.
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
      </div>
    );
  }
}