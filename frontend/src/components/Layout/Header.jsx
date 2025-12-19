import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          Typing Speed Calculator
        </Link>
        <nav className="header__nav">
          {isAuthenticated ? (
            <>
              <Link to="/" className="header__link">Typing</Link>
              <Link to="/dashboard" className="header__link">Dashboard</Link>
              <Link to="/leaderboard" className="header__link">Leaderboard</Link>
              <span className="header__user">{user?.username}</span>
              <button onClick={handleLogout} className="header__button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header__link">Login</Link>
              <Link to="/register" className="header__button header__button--primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

