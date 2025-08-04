import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from './components/navbar.component';
import Footer from './components/footer.component';
import CreateUser from './components/create-user.component';
import SignIn from './components/signin.component';
import Dashboard from './components/dashboard.component';
import Homepage from './components/homepage.component';
import CreateListing from './components/create-listing.component';
import AdminPanel from './components/admin-panel.component';


function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <br/>
        <div className="container-fluid flex-grow-1">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<h1>About Rentacube</h1>} />
            <Route path="/contact" element={<h1>Contact Us</h1>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<CreateUser />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
