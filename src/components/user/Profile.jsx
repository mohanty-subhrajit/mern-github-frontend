import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from '../../config/api';
import "./profile.css";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon, PeopleIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [starredRepos, setStarredRepos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { setCurrentUser } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (userId) {
        try {
          const response = await axios.get(
            `${API_URL}/userProfile/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };

    const fetchStarredRepos = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${API_URL}/starred/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStarredRepos(response.data);
      } catch (err) {
        console.error("Error fetching starred repos:", err);
      }
    };

    const fetchConnections = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${API_URL}/connections/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFollowers(response.data.followers);
        setFollowing(response.data.following);
      } catch (err) {
        console.error("Error fetching connections:", err);
      }
    };

    fetchUserDetails();
    fetchStarredRepos();
    fetchConnections();
  }, []);

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-layout">
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current={activeTab === "overview" ? "page" : undefined}
          icon={BookIcon}
          onClick={() => setActiveTab("overview")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "overview" ? "white" : "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "starred" ? "page" : undefined}
          icon={RepoIcon}
          onClick={() => setActiveTab("starred")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "starred" ? "white" : "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Starred Repositories
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "connections" ? "page" : undefined}
          icon={PeopleIcon}
          onClick={() => setActiveTab("connections")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "connections" ? "white" : "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Connections
        </UnderlineNav.Item>
      </UnderlineNav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);

          window.location.href = "/auth";
        }}
        style={{ position: "fixed", bottom: "50px", right: "50px" }}
        id="logout"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image"></div>

          <div className="name">
            <h3>{userDetails.username}</h3>
            <p>{userDetails.email}</p>
          </div>

          <div className="follower">
            <p>{followers.length} Followers</p>
            <p>{following.length} Following</p>
          </div>
        </div>

        <div className="heat-map-section">
          {activeTab === "overview" && <HeatMapProfile userId={userDetails._id} />}

          {activeTab === "starred" && (
            <div>
              <h3>Starred Repositories</h3>
              {starredRepos.length === 0 ? (
                <p className="empty-state">No starred repositories yet.</p>
              ) : (
                <div className="repo-card-wrapper">
                  {starredRepos.map((repo) => (
                    <div key={repo._id} className="repo">
                      <h4 className="repo-name">{repo.name}</h4>
                      <p className="description">{repo.description || "No description"}</p>
                      <small className="visibility">Visibility: {repo.visibility ? "Public" : "Private"}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "connections" && (
            <div>
              <h3>Followers ({followers.length})</h3>
              {followers.length === 0 ? (
                <p className="empty-state">No followers yet.</p>
              ) : (
                <div className="connections-grid">
                  {followers.map((user) => (
                    <div key={user._id} className="connection-card">
                      <h5>{user.username}</h5>
                      <p>{user.email}</p>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="section-heading">Following ({following.length})</h3>
              {following.length === 0 ? (
                <p className="empty-state">Not following anyone yet.</p>
              ) : (
                <div className="connections-grid">
                  {following.map((user) => (
                    <div key={user._id} className="connection-card">
                      <h5>{user.username}</h5>
                      <p>{user.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default Profile;
