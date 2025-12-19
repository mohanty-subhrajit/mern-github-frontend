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
        <Link to="/create-repository">
          <p>Create a Repository</p>
        </Link>
        <Link to="/profile">
          <p>Profile</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
