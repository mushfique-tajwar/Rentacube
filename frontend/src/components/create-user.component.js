import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class CreateUser extends Component {
  render() {
    return (
      <div className="container">
        <h2>Create User</h2>
        <form>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" className="form-control" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" className="form-control" />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary">Create User</button>
        </form>
      </div>
    );
  }
}