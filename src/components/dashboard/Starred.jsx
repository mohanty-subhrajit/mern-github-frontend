import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from '../../config/api';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./dashboard.css";

const Starred = () => {
  const [starredRepos, setStarredRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchStarredRepos();
  }, []);

  const fetchStarredRepos = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/starred/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStarredRepos(response.data || []);
    } catch (err) {
      console.error("Error fetching starred repos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstar = async (repoId) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API_URL}/star/${userId}/${repoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Remove from local state
      setStarredRepos(starredRepos.filter((repo) => repo._id !== repoId));
    } catch (err) {
      console.error("Error unstarring repo:", err);
    }
  };

  const handleDeleteRepo = async (repoId, repoName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${repoName}"?\n\nThis will permanently delete:\n- The repository\n- All commits and files\n- All issues\n- This action cannot be undone!`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    try {
      const response = await axios.delete(
        `${API_URL}/repo/delete/${repoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from local state
      setStarredRepos(starredRepos.filter((repo) => repo._id !== repoId));
      alert(response.data.message || "Repository deleted successfully!");
    } catch (err) {
      console.error("Error deleting repo:", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to delete repository!");
    }
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        <div id="dashboard">
          <header className="dashboard-header">
            <h1>⭐ Starred Repositories</h1>
            <p className="subtitle">
              {starredRepos.length} {starredRepos.length === 1 ? "repository" : "repositories"}
            </p>
          </header>

          <div className="dashboard-sections">
            {loading ? (
              <div className="loading-message">Loading starred repositories...</div>
            ) : starredRepos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <h2>No starred repositories yet</h2>
                <p>Star repositories you want to keep track of.</p>
              </div>
            ) : (
              <div className="repos-list">
                {starredRepos.map((repo) => {
                  const currentUserId = localStorage.getItem("userId");
                  const isOwner = repo.owner?._id === currentUserId || repo.owner === currentUserId;
                  
                  return (
                  <div key={repo._id} className="repo-card">
                    <div className="repo-header">
                      <h3 className="repo-title">{repo.name}</h3>
                      <span className={`visibility-badge ${repo.visibility ? "public" : "private"}`}>
                        {repo.visibility ? "Public" : "Private"}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="repo-description">{repo.description}</p>
                    )}
                    <div className="repo-actions">
                      <button
                        className="btn-browse"
                        onClick={() => navigate(`/repo/${repo._id}`)}
                      >
                        📂 Browse
                      </button>
                      <button
                        className="btn-unstar"
                        onClick={() => handleUnstar(repo._id)}
                      >
                        ⭐ Unstar
                      </button>
                      {isOwner && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteRepo(repo._id, repo.name)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Starred;
