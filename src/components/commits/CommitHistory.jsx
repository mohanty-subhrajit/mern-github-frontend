import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import API_URL from '../../config/api';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./commits.css";

const CommitHistory = () => {
  const { repoId } = useParams();
  const [commits, setCommits] = useState([]);
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchRepoAndCommits();
  }, [repoId]);

  const fetchRepoAndCommits = async () => {
    const token = localStorage.getItem("token");

    try {
      // Fetch repository details
      const repoResponse = await axios.get(
        `${API_URL}/repo/${repoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRepo(repoResponse.data);

      // Fetch commits
      const commitsResponse = await axios.get(
        `${API_URL}/repo/${repoId}/commits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommits(commitsResponse.data.commits || []);
    } catch (err) {
      console.error("Error fetching commits:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        <div className="commits-container">
          {loading ? (
            <div className="loading">Loading commits...</div>
          ) : (
            <>
              <div className="commits-header">
                <div className="repo-info">
                  <h1>📁 {repo?.name}</h1>
                  <p className="repo-desc">{repo?.description}</p>
                </div>
                <div className="commit-count">
                  <span className="count-badge">{commits.length}</span>
                  <span>Commits</span>
                </div>
              </div>

              {commits.length === 0 ? (
                <div className="empty-commits">
                  <div className="empty-icon">📝</div>
                  <h2>No commits yet</h2>
                  <p>Push commits using the CLI to see them here</p>
                  <code className="cli-hint">mern-github push</code>
                </div>
              ) : (
                <div className="commits-list">
                  {commits.map((commit) => (
                    <Link
                      key={commit._id}
                      to={`/commit/${commit.commitId}`}
                      className="commit-card"
                    >
                      <div className="commit-info">
                        <h3 className="commit-message">{commit.message}</h3>
                        <div className="commit-meta">
                          <span className="commit-author">
                            👤 {commit.author?.username || "Unknown"}
                          </span>
                          <span className="commit-date">
                            🕒 {formatDate(commit.createdAt)}
                          </span>
                          <span className="commit-files">
                            📄 {commit.files?.length || 0} files
                          </span>
                        </div>
                      </div>
                      <div className="commit-id">
                        <code>{commit.commitId.substring(0, 7)}</code>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CommitHistory;
