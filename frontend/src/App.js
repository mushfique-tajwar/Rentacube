import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from './components/navbar.component';
import CreateUser from './components/create-user.component';
import SignIn from './components/signin.component';
import Dashboard from './components/dashboard.component';
import Homepage from './components/homepage.component';


function App() {
  return (
    <Router>
        <Navbar />
          <br/>
          <div className="container-fluid">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<h1>About Rentacube</h1>} />
            <Route path="/contact" element={<h1>Contact Us</h1>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          </div>
      </Router>
  );
}

export default App;
