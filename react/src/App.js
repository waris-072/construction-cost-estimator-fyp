import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layouts/Header';
import Footer from './components/Layouts/Footer';
import Home from './components/Pages/Home';
import Estimation from './components/Pages/Estimation';
import Results from './components/Pages/Results';
import Help from './components/Pages/Help';
import Login from './components/Pages/Login';
import Signup from './components/Pages/Signup'; 
import Profile from './components/Pages/Profile';
import AdminPanel from './components/Pages/AdminPanel';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/estimate" element={<Estimation />} />
            <Route path="/results" element={<Results />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;