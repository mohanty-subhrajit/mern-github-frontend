import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from '../../config/api';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./issues.css";

const IssueDetail = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "open",
    labels: "",
  });

  useEffect(() => {
    fetchIssue();
  }, [issueId]);

  const fetchIssue = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_URL}/issue/${issueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIssue(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        labels: response.data.labels?.join(", ") || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching issue:", err);
      alert("Failed to load issue!");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const labelsArray = formData.labels
        ? formData.labels.split(",").map((l) => l.trim())
        : [];

      await axios.put(
        `${API_URL}/issue/update/${issueId}`,
        {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          labels: labelsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Issue updated successfully!");
      setIsEditing(false);
      fetchIssue();
    } catch (err) {
      console.error("Error updating issue:", err);
      alert("Failed to update issue!");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/issue/delete/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Issue deleted successfully!");
      navigate(`/repo/${issue.repository._id}/issues`);
    } catch (err) {
      console.error("Error deleting issue:", err);
      alert("Failed to delete issue!");
    }
  };

  if (loading) return <div className="loading">Loading issue...</div>;
  if (!issue) return <div className="error">Issue not found</div>;

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
      <div className="issue-detail-container">
        <div className="issue-detail-header">
          <button
            className="btn-back"
            onClick={() => navigate(`/repo/${issue.repository._id}/issues`)}
          >
            ← Back to Issues
          </button>
          <div className="issue-actions-header">
            {!isEditing && (
              <>
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="issue-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="labels">Labels</label>
              <input
                type="text"
                id="labels"
                name="labels"
                value={formData.labels}
                onChange={handleChange}
                placeholder="bug, enhancement"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    title: issue.title,
                    description: issue.description,
                    status: issue.status,
                    labels: issue.labels?.join(", ") || "",
                  });
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Update Issue
              </button>
            </div>
          </form>
        ) : (
          <div className="issue-detail-content">
            <div className="issue-title-row">
              <h1>{issue.title}</h1>
              <span className={`status-badge ${issue.status}`}>
                {issue.status === "open" ? "🟢 Open" : "🔴 Closed"}
              </span>
            </div>

            <div className="issue-meta-detail">
              <p>
                <strong>Created by:</strong> {issue.creator?.username} •{" "}
                {new Date(issue.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Repository:</strong> {issue.repository?.name}
              </p>
              {issue.assignee && (
                <p>
                  <strong>Assignee:</strong> {issue.assignee.username}
                </p>
              )}
            </div>

            {issue.labels && issue.labels.length > 0 && (
              <div className="issue-labels-detail">
                <strong>Labels:</strong>
                {issue.labels.map((label, index) => (
                  <span key={index} className="label">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="issue-description-detail">
              <h3>Description</h3>
              <p>{issue.description}</p>
            </div>

            <div className="issue-timeline">
              <p className="timeline-item">
                <strong>Last updated:</strong>{" "}
                {new Date(issue.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default IssueDetail;
