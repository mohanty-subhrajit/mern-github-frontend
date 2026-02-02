import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import API_URL from '../../config/api';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./repository.css";

const RepositoryBrowser = () => {
  const { repoId } = useParams();
  const [repository, setRepository] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [readme, setReadme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchRepository();
    fetchFiles();
    fetchReadme();
  }, [repoId]);

  const fetchRepository = async () => {
    try {
      const response = await axios.get(`${API_URL}/browse/${repoId}`);
      setRepository(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching repository:", err);
      setError(err.response?.data?.error || "Failed to load repository");
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/browse/${repoId}/files`);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadme = async () => {
    try {
      const response = await axios.get(`${API_URL}/browse/${repoId}/readme`);
      if (response.data.readme) {
        setReadme(response.data.readme);
      }
    } catch (err) {
      console.error("Error fetching README:", err);
    }
  };

  const handleFileClick = async (filename) => {
    setSelectedFile(filename);
    setFileContent("");
    setFileLoading(true);
    
    try {
      const response = await axios.get(
        `${API_URL}/browse/${repoId}/file/${filename}`
      );
      setFileContent(response.data.content);
    } catch (err) {
      console.error("Error fetching file content:", err);
      setFileContent("❌ Error loading file content\n\n" + (err.response?.data?.error || err.message));
    } finally {
      setFileLoading(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      js: '📜',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      json: '📋',
      md: '📝',
      txt: '📄',
      css: '🎨',
      html: '🌐',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      go: '🔷',
      rs: '🦀',
      xml: '📰',
      yml: '⚙️',
      yaml: '⚙️',
      sh: '🐚',
      env: '🔐',
    };
    return iconMap[ext] || '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        {error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Unable to Load Repository</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                🔄 Retry
              </button>
            </div>
          ) : (
          <div className="repo-browser-container">
          {loading ? (
            <div className="loading">Loading repository...</div>
          ) : (
            <>
              <div className="repo-header">
                <div className="repo-info-section">
                  <h1 className="repo-name">
                    <span className="repo-icon">📁</span>
                    {repository?.name}
                  </h1>
                  <p className="repo-description">
                    {repository?.description || "No description provided"}
                  </p>
                  <div className="repo-meta">
                    <span className="meta-item">
                      <strong>Owner:</strong> {repository?.owner?.username}
                    </span>
                    <span className="meta-item">
                      <strong>Visibility:</strong>{" "}
                      {repository?.visibility ? "Public" : "Private"}
                    </span>
                    <span className="meta-item">
                      <strong>Files:</strong> {files.length}
                    </span>
                  </div>
                  <div className="repo-actions">
                    <Link to={`/repo/${repoId}/commits`} className="action-btn">
                      📝 View Commits
                    </Link>
                    <Link to={`/repo/${repoId}/issues`} className="action-btn">
                      🐛 View Issues
                    </Link>
                  </div>
                </div>
              </div>

              <div className="browser-layout">
                <div className="file-tree-panel">
                  <div className="panel-header">
                    <h3>Files</h3>
                    <span className="file-count">{files.length} files</span>
                  </div>
                  
                  {files.length === 0 ? (
                    <div className="empty-state">
                      <p>No files in repository</p>
                      <small>Push files using CLI to see them here</small>
                    </div>
                  ) : (
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className={`file-item ${selectedFile === file.filename ? 'active' : ''}`}
                          onClick={() => handleFileClick(file.filename)}
                        >
                          <span className="file-icon">
                            {getFileIcon(file.filename)}
                          </span>
                          <div className="file-details">
                            <span className="file-name">{file.filename}</span>
                            <span className="file-size">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="file-content-panel">
                  {selectedFile ? (
                    <>
                      <div className="content-header">
                        <h3>{selectedFile}</h3>
                        <button
                          className="close-btn"
                          onClick={() => setSelectedFile(null)}
                        >
                          ✕
                        </button>
                      </div>
                      {fileLoading ? (
                        <div className="file-loading">
                          <div className="spinner"></div>
                          <p>Loading file content...</p>
                        </div>
                      ) : (
                        <pre className="code-viewer">
                          <code>{fileContent}</code>
                        </pre>
                      )}
                    </>
                  ) : readme ? (
                    <>
                      <div className="content-header">
                        <h3>📝 README</h3>
                      </div>
                      <div className="readme-content">
                        <pre>{readme}</pre>
                      </div>
                    </>
                  ) : (
                    <div className="empty-view">
                      <div className="empty-icon">👈</div>
                      <h3>Select a file to view</h3>
                      <p>Click on any file from the list to see its content</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        )}
      </div>
    </>
  );
};

export default RepositoryBrowser;
