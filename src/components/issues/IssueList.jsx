import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from '../../config/api';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./issues.css";

const IssueList = () => {
  const { repoId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, open, closed
  const [repoName, setRepoName] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    fetchRepository();
    fetchIssues();
  }, [repoId]);

  const fetchRepository = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_URL}/repo/${repoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRepoName(response.data.name);
    } catch (err) {
      console.error("Error fetching repository:", err);
    }
  };

  const fetchIssues = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_URL}/issue/repo/${repoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIssues(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}/issue/update/${issueId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchIssues();
    } catch (err) {
      console.error("Error updating issue:", err);
      alert("Failed to update issue status!");
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/issue/delete/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchIssues();
      alert("Issue deleted successfully!");
    } catch (err) {
      console.error("Error deleting issue:", err);
      alert("Failed to delete issue!");
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === "all") return true;
    return issue.status === filter;
  });

  const openCount = issues.filter((i) => i.status === "open").length;
  const closedCount = issues.filter((i) => i.status === "closed").length;

  if (loading) return <div className="loading">Loading issues...</div>;

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
      <div className="issue-list-container">
      <div className="issue-header">
        <h2>Issues for {repoName}</h2>
        <button
          className="btn-create-issue"
          onClick={() => navigate(`/repo/${repoId}/issues/new`)}
        >
          New Issue
        </button>
      </div>

      <div className="issue-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({issues.length})
        </button>
        <button
          className={filter === "open" ? "active" : ""}
          onClick={() => setFilter("open")}
        >
          🟢 Open ({openCount})
        </button>
        <button
          className={filter === "closed" ? "active" : ""}
          onClick={() => setFilter("closed")}
        >
          🔴 Closed ({closedCount})
        </button>
      </div>

      <div className="issues-list">
        {filteredIssues.length === 0 ? (
          <div className="no-issues">
            <p>No {filter !== "all" ? filter : ""} issues found.</p>
            <button onClick={() => navigate(`/repo/${repoId}/issues/new`)}>
              Create the first issue
            </button>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue._id} className="issue-item">
              <div className="issue-status">
                {issue.status === "open" ? "🟢" : "🔴"}
              </div>
              <div className="issue-content">
                <h3
                  className="issue-title"
                  onClick={() => navigate(`/issue/${issue._id}`)}
                >
                  {issue.title}
                </h3>
                <p className="issue-meta">
                  #{issue._id.slice(-6)} opened by {issue.creator?.username} •{" "}
                  {new Date(issue.createdAt).toLocaleDateString()}
                </p>
                {issue.labels && issue.labels.length > 0 && (
                  <div className="issue-labels">
                    {issue.labels.map((label, index) => (
                      <span key={index} className="label">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="issue-actions">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                  className="status-select"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteIssue(issue._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
    </>
  );
};

export default IssueList;
