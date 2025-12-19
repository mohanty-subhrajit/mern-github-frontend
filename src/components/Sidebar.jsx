import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [recentRepos, setRecentRepos] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchRecentRepos();
  }, []);

  const fetchRecentRepos = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) return;

    try {
      const response = await axios.get(
        `http://localhost:3002/repo/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRecentRepos(response.data.repositories?.slice(0, 8) || []);
    } catch (err) {
      console.error("Error fetching recent repos:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={toggleSidebar}>
            ×
          </button>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Navigation</h3>
          <nav className="sidebar-nav">
            <Link
              to="/"
              className={`sidebar-link ${isActive("/") ? "active" : ""}`}
              onClick={toggleSidebar}
            >
              <span className="icon">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/profile"
              className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}
              onClick={toggleSidebar}
            >
              <span className="icon">👤</span>
              <span>Profile</span>
            </Link>
            <Link
              to="/repositories"
              className={`sidebar-link ${isActive("/repositories") ? "active" : ""}`}
              onClick={toggleSidebar}
            >
              <span className="icon">📦</span>
              <span>Repositories</span>
            </Link>
            <Link
              to="/starred"
              className={`sidebar-link ${isActive("/starred") ? "active" : ""}`}
              onClick={toggleSidebar}
            >
              <span className="icon">⭐</span>
              <span>Starred</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Recent Repositories</h3>
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Find a repository..."
              className="sidebar-search-input"
            />
          </div>
          <div className="recent-repos">
            {recentRepos.length === 0 ? (
              <p className="no-repos">No repositories yet</p>
            ) : (
              recentRepos.map((repo) => (
                <div key={repo._id} className="recent-repo-item">
                  <span className="repo-icon">📁</span>
                  <div className="repo-info">
                    <span className="repo-name">{repo.name}</span>
                    <span className="repo-visibility">
                      {repo.visibility ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
