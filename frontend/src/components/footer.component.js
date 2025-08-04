import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Footer extends Component {
  render() {
    return (
      <footer className="bg-secondary text-light mt-auto py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5>Rentacube</h5>
              <p>Your trusted platform for renting and lending items in your community.</p>
            </div>
            <div className="col-md-3">
              <h6>Quick Links</h6>
              <ul className="list-unstyled">
                <li><Link to="/about" className="text-light text-decoration-none">About</Link></li>
                <li><Link to="/contact" className="text-light text-decoration-none">Contact</Link></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6>Follow Us</h6>
              <div className="d-flex">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                  <i className="fab fa-github fa-lg"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                  <i className="fab fa-linkedin fa-lg"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                  <i className="fab fa-facebook fa-lg"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                  <i className="fab fa-instagram fa-lg"></i>
                </a>
              </div>
            </div>
          </div>
          <hr className="my-4" />
          <div className="row">
            <div className="col-md-12 text-center">
              <p className="mb-0 text-muted">&copy; 2025 Rentacube. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}
