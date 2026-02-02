import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav>
      <div className="nav-left">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Link to="/">
          <div className="nav-brand">
            <img
              src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub Logo"
            />
            <h3>GitHub</h3>
          </div>
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/starred" className="nav-link">
          <span className="nav-icon">⭐</span>
          <p>Starred</p>
        </Link>
        <Link to="/create-repository" className="nav-link">
          <p>Create Repository</p>
        </Link>
        <Link to="/profile" className="nav-link">
          <p>Profile</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
