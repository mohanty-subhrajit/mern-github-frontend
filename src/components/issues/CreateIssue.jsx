import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from '../../config/api';
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./issues.css";

const CreateIssue = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    labels: "",
  });
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const labelsArray = formData.labels
        ? formData.labels.split(",").map((l) => l.trim())
        : [];

      const response = await axios.post(
        `${API_URL}/issue/create/${repoId}`,
        {
          title: formData.title,
          description: formData.description,
          labels: labelsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Issue created successfully!");
      navigate(`/repo/${repoId}/issues`);
    } catch (err) {
      console.error("Error creating issue:", err);
      alert("Failed to create issue!");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
      <div className="create-issue-container">
        <div className="create-issue-header">
          <h2>Create New Issue</h2>
          <button
            className="btn-back"
            onClick={() => navigate(`/repo/${repoId}/issues`)}
          >
            ← Back to Issues
          </button>
        </div>

        <form onSubmit={handleSubmit} className="issue-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Issue title"
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
              placeholder="Describe the issue in detail..."
              rows="8"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="labels">Labels (comma-separated)</label>
            <input
              type="text"
              id="labels"
              name="labels"
              value={formData.labels}
              onChange={handleChange}
              placeholder="bug, enhancement, documentation"
            />
            <small>Separate multiple labels with commas</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(`/repo/${repoId}/issues`)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
};

export default CreateIssue;
