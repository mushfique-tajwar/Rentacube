import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from './components/navbar.component';
import CreateUser from './components/create-user.component';


function App() {
  return (
    <Router>
      <Navbar />
      <br/>
      <Routes>
        <Route path="/" element={<h1>Welcome to Rentacube</h1>} />
        <Route path="/about" element={<h1>About Rentacube</h1>} />
        <Route path="/contact" element={<h1>Contact Us</h1>} />
        <Route path="/user" element={<h1>User Profile</h1>} />
        <Route path="/create-user" element={<CreateUser />} />
      </Routes>
    </Router>
  );
}

export default App;
