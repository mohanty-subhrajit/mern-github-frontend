import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import axios from "axios";

// GitHub-style contribution colors
const GITHUB_COLORS = {
  0: '#161b22',    // No contributions (dark background)
  1: '#0e4429',    // 1-2 contributions (dark green)
  2: '#006d32',    // 3-5 contributions
  3: '#26a641',    // 6-9 contributions
  4: '#39d353',    // 10+ contributions (bright green)
};

const HeatMapProfile = ({ userId }) => {
  const [activityData, setActivityData] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const currentUserId = userId || localStorage.getItem("userId");

      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user repositories
        const repoResponse = await axios.get(
          `http://localhost:3002/repo/user/${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userRepos = repoResponse.data.repositories || [];
        setRepositories(userRepos);

        // Fetch all commits from all repositories
        const commitPromises = userRepos.map(async (repo) => {
          try {
            const response = await axios.get(
              `http://localhost:3002/repo/${repo._id}/commits`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return response.data.commits || [];
          } catch (error) {
            console.error(`Error fetching commits for repo ${repo.name}:`, error);
            return [];
          }
        });

        const allCommitsArrays = await Promise.all(commitPromises);
        const allCommits = allCommitsArrays.flat();

        // Generate activity data for the last year
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);

        const activityMap = {};
        let currentDate = new Date(startDate);
        
        // Initialize all dates with 0 contributions
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split("T")[0];
          activityMap[dateStr] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count commits per day
        allCommits.forEach((commit) => {
          const commitDate = new Date(commit.createdAt).toISOString().split("T")[0];
          if (activityMap.hasOwnProperty(commitDate)) {
            activityMap[commitDate]++;
          }
        });

        // Convert to array format for HeatMap
        const data = Object.entries(activityMap).map(([date, count]) => ({
          date,
          count,
        }));

        setActivityData(data);
        const total = Object.values(activityMap).reduce((sum, count) => sum + count, 0);
        setTotalContributions(total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  if (loading) {
    return (
      <div className="heatmap-wrapper">
        <h4>Loading contribution activity...</h4>
      </div>
    );
  }

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-header">
        <h4>
          {totalContributions} contributions in the last year
        </h4>
        <div className="heatmap-legend">
          <span style={{ fontSize: '12px', color: '#8b949e', marginRight: '8px' }}>Less</span>
          {Object.entries(GITHUB_COLORS).map(([level, color]) => (
            <div
              key={level}
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                border: '1px solid #30363d',
                borderRadius: '2px',
                margin: '0 2px',
              }}
              title={`Level ${level}`}
            />
          ))}
          <span style={{ fontSize: '12px', color: '#8b949e', marginLeft: '8px' }}>More</span>
        </div>
      </div>
      <HeatMap
        className="HeatMapProfile"
        value={activityData}
        weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
        monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
        startDate={startDate}
        rectSize={11}
        space={3}
        rectProps={{
          rx: 2,
        }}
        panelColors={(value) => {
          if (value === 0) return GITHUB_COLORS[0];
          if (value <= 2) return GITHUB_COLORS[1];
          if (value <= 5) return GITHUB_COLORS[2];
          if (value <= 9) return GITHUB_COLORS[3];
          return GITHUB_COLORS[4];
        }}
      />
    </div>
  );
};

export default HeatMapProfile;
