import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./commits.css";

const CommitDetail = () => {
  const { commitId } = useParams();
  const navigate = useNavigate();
  const [commit, setCommit] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchCommitDetails();
  }, [commitId]);

  const fetchCommitDetails = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:3002/commit/${commitId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommit(response.data.commit);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching commit details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-layout">
          <div className="loading">Loading commit details...</div>
        </div>
      </>
    );
  }

  if (!commit) {
    return (
      <>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-layout">
          <div className="error">Commit not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        <div className="commit-detail-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="commit-header-detail">
            <h1 className="commit-title">{commit.message}</h1>
            <div className="commit-metadata">
              <div className="meta-item">
                <strong>Author:</strong> {commit.author?.username || "Unknown"}
              </div>
              <div className="meta-item">
                <strong>Date:</strong> {formatDate(commit.createdAt)}
              </div>
              <div className="meta-item">
                <strong>Commit ID:</strong> <code>{commit.commitId}</code>
              </div>
              <div className="meta-item">
                <strong>Repository:</strong> {commit.repositoryId?.name}
              </div>
            </div>
          </div>

          <div className="files-section">
            <h2>Changed Files ({files.length})</h2>
            {files.length === 0 ? (
              <p className="no-files">No files in this commit</p>
            ) : (
              <div className="files-list">
                {files.map((file, index) => (
                  <div key={index} className="file-card">
                    <div className="file-header">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.filename}</span>
                      <span className="file-size">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <pre className="file-content">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommitDetail;
