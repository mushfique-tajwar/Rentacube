import React, { Component } from 'react';
import axios from 'axios';

export default class SignIn extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      password: '',
      message: '',
      isLoading: false
    };
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true, message: '' });

    const loginData = {
      username: this.state.username,
      password: this.state.password
    };

    console.log('Attempting to sign in:', loginData);

    axios.post('http://localhost:3000/users/login', loginData)
      .then(res => {
        console.log('Sign in successful:', res.data);
        // Save username to localStorage for navbar display
        localStorage.setItem('username', this.state.username);
        localStorage.setItem('isLoggedIn', 'true');
        
        this.setState({
          message: 'Sign in successful! Redirecting...',
          isLoading: false,
          username: '',
          password: ''
        });
        
        // Redirect to homepage after successful sign in
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      })
      .catch(err => {
        console.error('Error signing in:', err.response?.data || err.message);
        this.setState({
          message: `Error: ${err.response?.data || 'Invalid username or password'}`,
          isLoading: false
        });
      });
  }

  render() {
    return (
      <div className="container">
        <h2>Sign In</h2>
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
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={this.state.isLoading}
          >
            {this.state.isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }
}
