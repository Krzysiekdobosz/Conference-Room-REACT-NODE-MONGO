import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isDemo } from '../api';
import { resetDemo } from '../api/mock';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/rooms');
  };

  const handleReset = () => {
    resetDemo();
    logout();
    window.location.reload();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {isDemo && (
        <div className="demo-banner">
          <span>
            Demo version with test data &ndash; changes are saved only in your browser.
          </span>
          <button type="button" className="link-button" onClick={handleReset}>
            Reset data
          </button>
        </div>
      )}
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/rooms" className="brand" onClick={closeMenu}>
            <span className="brand__mark">R</span>
            RoomBook
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <nav id="main-nav" className={`nav ${menuOpen ? 'nav--open' : ''}`}>
            <NavLink to="/rooms" onClick={closeMenu}>Rooms</NavLink>
            {user && <NavLink to="/reservations" onClick={closeMenu}>My reservations</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
            <div className="nav__account">
              {user ? (
                <>
                  <span className="nav__user">{user.name}</span>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu}>Log in</NavLink>
                  <Link to="/register" className="btn btn--primary btn--sm" onClick={closeMenu}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="container page">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">RoomBook &middot; React, Node.js, Express, MongoDB</div>
      </footer>
    </>
  );
};
