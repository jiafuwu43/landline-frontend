import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ResultsPage from './pages/ResultsPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { User } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {user ? (
              <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                <h1 style={{ margin: 0 }}>Landline Shuttle Booking</h1>
              </Link>
            ) : (
              <h1 style={{ margin: 0 }}>Landline Shuttle Booking</h1>
            )}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {user ? (
                <>
                  <Link to="/my-bookings" style={{ color: 'white', textDecoration: 'none' }}>My Bookings</Link>
                  <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Search</Link>
                  <span style={{ color: 'white' }}>{user.email}</span>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: 'transparent', 
                      border: '1px solid white', 
                      color: 'white', 
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" style={{ color: 'white', textDecoration: 'none' }}>Sign In</Link>
                  <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <ConfirmationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;