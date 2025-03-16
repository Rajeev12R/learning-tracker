import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Profile from "../components/Profile";
import { FaGithub, FaStar, FaCodeBranch, FaCircle, FaSync } from 'react-icons/fa';

axios.defaults.withCredentials = true;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/auth/user");
      console.log("User data:", res.data); 
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Auth error:", err);
      if (err.response?.status === 401) {
        navigate("/");
      }
      throw err;
    }
  };

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await fetchUserData();
      if (!userData?.githubToken) {
        throw new Error("GitHub token not found");
      }

      const res = await axios.get("http://localhost:3000/github/repos");
      console.log("Repos data:", res.data);

      if (Array.isArray(res.data)) {
        setRepos(res.data);
      } else {
        console.error("Invalid repos data format:", res.data);
        throw new Error("Invalid repository data received");
      }
    } catch (err) {
      console.error("Error fetching repos:", err);
      if (err.response?.status === 401) {
        setError("GitHub authentication expired. Please reconnect your GitHub account.");
      } else {
        setError(err.message || "Failed to load repositories. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReconnectGitHub = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await fetchUserData();
        await fetchRepositories();
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      }
    };

    initializeDashboard();
  }, [navigate]);

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      HTML: '#e34c26',
      CSS: '#563d7c',
    };
    return colors[language] || '#8e8e8e';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {user ? <Profile user={user} /> : <p>Loading profile...</p>}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaGithub className="mr-2" />
                  Your Repositories
                </h2>
                <div className="flex items-center space-x-4">
                  {!loading && (
                    <button
                      onClick={fetchRepositories}
                      className="text-gray-600 hover:text-gray-900"
                      title="Refresh repositories"
                    >
                      <FaSync className={loading ? 'animate-spin' : ''} />
                    </button>
                  )}
                  <a
                    href={`https://github.com/${user?.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All on GitHub
                  </a>
                </div>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                    {error.includes("expired") && (
                      <button
                        onClick={handleReconnectGitHub}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaGithub className="mr-2" />
                        Reconnect GitHub
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!loading && !error && repos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No repositories found
                </div>
              )}

              <div className="space-y-4">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {repo.name}
                        </a>
                        {repo.description && (
                          <p className="mt-1 text-gray-600 text-sm">{repo.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      {repo.language && (
                        <div className="flex items-center">
                          <FaCircle
                            className="mr-1"
                            style={{ color: getLanguageColor(repo.language) }}
                            size={12}
                          />
                          <span className="text-gray-600">{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <FaStar className="mr-1" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaCodeBranch className="mr-1" />
                        <span>{repo.forks_count}</span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
