import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/api";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./repository.css";

const CreateRepository = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: true, // true = public, false = private
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Repository name is required!");
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setError("You must be logged in to create a repository!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/repo/create`,
        {
          owner: userId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          visibility: formData.visibility,
          content: [],
          issues: [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Repository created successfully!");
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating repository:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create repository. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        <div className="create-repo-container">
          <div className="create-repo-header">
            <h1>Create a new repository</h1>
            <p className="subtitle">
              A repository contains all project files, including the revision history.
            </p>
          </div>

          <form className="create-repo-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Repository name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="my-awesome-project"
                className="form-input"
                required
              />
              <p className="form-hint">
                Great repository names are short and memorable.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description <span className="optional">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of your repository"
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Visibility</label>
              <div className="visibility-options">
                <label className="visibility-option">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.visibility === true}
                    onChange={() => setFormData({ ...formData, visibility: true })}
                  />
                  <div className="visibility-content">
                    <div className="visibility-title">
                      <span className="visibility-icon">🌍</span>
                      <strong>Public</strong>
                    </div>
                    <p className="visibility-desc">
                      Anyone on the internet can see this repository
                    </p>
                  </div>
                </label>

                <label className="visibility-option">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.visibility === false}
                    onChange={() => setFormData({ ...formData, visibility: false })}
                  />
                  <div className="visibility-content">
                    <div className="visibility-title">
                      <span className="visibility-icon">🔒</span>
                      <strong>Private</strong>
                    </div>
                    <p className="visibility-desc">
                      Only you can see this repository
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-create"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create repository"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRepository;
