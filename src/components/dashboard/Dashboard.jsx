import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from '../../config/api';
import "./dashboard.css";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const [publicSearchResults, setPublicSearchResults] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `${API_URL}/repo/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${API_URL}/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchStarredRepos = async () => {
      try {
        const response = await fetch(
          `${API_URL}/starred/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setStarredRepos(data.map((repo) => repo._id) || []);
      } catch (err) {
        console.error("Error while fetching starred repos: ", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
    fetchStarredRepos();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const handleStarRepo = async (repoId) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_URL}/star/${userId}/${repoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isStarred) {
        setStarredRepos([...starredRepos, repoId]);
      } else {
        setStarredRepos(starredRepos.filter((id) => id !== repoId));
      }

      alert(response.data.message);
    } catch (err) {
      console.error("Error starring repo:", err);
      alert("Failed to star repository!");
    }
  };

  const handleSearchPublicRepos = async (e) => {
    e.preventDefault();
    if (!publicSearchQuery) return;

    try {
      const response = await axios.get(
        `${API_URL}/repo/search?query=${publicSearchQuery}`
      );
      setPublicSearchResults(response.data);
    } catch (err) {
      console.error("Error searching repos:", err);
    }
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
        <section id="dashboard">
        <main>
          <div className="dashboard-sections">
            <div className="suggested-section">
              <h3>Suggested Repositories</h3>
              <div className="suggested-repos-grid">
                {suggestedRepositories.slice(0, 6).map((repo) => {
                  const isStarred = starredRepos.includes(repo._id);
                  return (
                    <div key={repo._id} className="suggested-repo-card">
                      <h4 className="repo-title">{repo.name}</h4>
                      <p className="repo-desc">{repo.description || "No description"}</p>
                      <button
                        onClick={() => handleStarRepo(repo._id)}
                        className={isStarred ? "btn-starred" : "btn-star"}
                      >
                        {isStarred ? "⭐ Starred" : "☆ Star"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="repos-section">
              <h2>Your Repositories</h2>
              <div id="search">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search your repos..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="repos-list">
                {searchResults.map((repo) => {
            return (
              <div key={repo._id} className="user-repo-card">
                <div className="repo-info">
                  <h4 className="repo-title">{repo.name}</h4>
                  <p className="repo-desc">{repo.description || "No description"}</p>
                </div>
                <div className="repo-actions">
                  <button
                    onClick={() => window.location.href = `/repo/${repo._id}/commits`}
                    className="btn-commits"
                  >
                    📝 Commits
                  </button>
                  <button
                    onClick={() => window.location.href = `/repo/${repo._id}/issues`}
                    className="btn-issues"
                  >
                    Issues
                  </button>
                </div>
              </div>
            );
          })}
              </div>
            </div>

            <div className="search-section">
              <h3>Search Public Repositories</h3>
              <form onSubmit={handleSearchPublicRepos} className="search-form">
                <input
                  type="text"
                  value={publicSearchQuery}
                  placeholder="Search public repos..."
                  onChange={(e) => setPublicSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="btn-search">
                  Search
                </button>
              </form>
              <div className="search-results">
                {publicSearchResults.map((repo) => {
                  const isStarred = starredRepos.includes(repo._id);
                  return (
                    <div key={repo._id} className="search-result-card">
                      <h5 className="repo-title">{repo.name}</h5>
                      <p className="repo-desc">{repo.description}</p>
                      <p className="repo-owner">By: {repo.owner?.username}</p>
                      <button
                        onClick={() => handleStarRepo(repo._id)}
                        className={isStarred ? "btn-starred-sm" : "btn-star-sm"}
                      >
                        {isStarred ? "⭐ Starred" : "☆ Star"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </section>
      </div>
    </>
  );
};

export default Dashboard;
