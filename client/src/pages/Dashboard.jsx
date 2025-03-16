import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Profile from "../components/Profile";
import { FaGithub, FaCode, FaDatabase, FaTools, FaClock, FaStar, FaCodeBranch, FaSync, FaServer } from 'react-icons/fa';

axios.defaults.withCredentials = true;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repoData, setRepoData] = useState({
    repos: [],
    stats: null,
    totalRepos: 0
  });
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
      console.log("Repository data:", res.data);

      setRepoData(res.data);
    } catch (err) {
      console.error("Error fetching repositories:", err);
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
    fetchRepositories();
  }, [navigate]);

  const renderStats = () => {
    const stats = repoData.stats;
    if (!stats) return null;

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">Repositories</h3>
            <p className="text-2xl font-bold">{repoData.totalRepos}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Total Stars</h3>
            <p className="text-2xl font-bold">{stats.totalStars}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-700">Total Forks</h3>
            <p className="text-2xl font-bold">{stats.totalForks}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-700">Repository Size</h3>
            <p className="text-2xl font-bold">{(stats.totalSize / 1024).toFixed(1)} MB</p>
          </div>
        </div>

        {/* Last Commit Info */}
        {stats.lastCommitInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">Latest Activity</h3>
            <div className="mt-2">
              <p><strong>Repository:</strong> {stats.lastCommitInfo.repo}</p>
              <p><strong>Last Commit:</strong> {new Date(stats.lastCommitInfo.date).toLocaleString()}</p>
              <p><strong>Message:</strong> {stats.lastCommitInfo.message}</p>
              <p><strong>Author:</strong> {stats.lastCommitInfo.author}</p>
            </div>
          </div>
        )}

        {/* Tech Stacks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center">
              <FaCode className="mr-2" /> Frontend
            </h3>
            <div className="mt-2">
              {Object.entries(stats.techStacks.frontend).map(([tech, count]) => (
                <div key={tech} className="flex justify-between items-center">
                  <span>{tech}</span>
                  <span className="text-gray-500">{count} repos</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center">
              <FaServer className="mr-2" /> Backend
            </h3>
            <div className="mt-2">
              {Object.entries(stats.techStacks.backend).map(([tech, count]) => (
                <div key={tech} className="flex justify-between items-center">
                  <span>{tech}</span>
                  <span className="text-gray-500">{count} repos</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center">
              <FaDatabase className="mr-2" /> Databases
            </h3>
            <div className="mt-2">
              {Object.entries(stats.techStacks.database).map(([tech, count]) => (
                <div key={tech} className="flex justify-between items-center">
                  <span>{tech}</span>
                  <span className="text-gray-500">{count} repos</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center">
              <FaTools className="mr-2" /> Tools & Testing
            </h3>
            <div className="mt-2">
              {Object.entries(stats.techStacks.tools).map(([tech, count]) => (
                <div key={tech} className="flex justify-between items-center">
                  <span>{tech}</span>
                  <span className="text-gray-500">{count} repos</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Languages</h3>
          <div className="space-y-2">
            {Object.entries(stats.topLanguages).slice(0, 5).map(([language, bytes]) => {
              const percentage = (bytes / Object.values(stats.topLanguages).reduce((a, b) => a + b, 0) * 100).toFixed(1);
              return (
                <div key={language} className="relative">
                  <div className="flex justify-between mb-1">
                    <span>{language}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
          <div className="space-y-2">
            {Object.entries(stats.activityByMonth)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .slice(0, 6)
              .map(([month, count]) => (
                <div key={month} className="flex justify-between items-center">
                  <span>{new Date(month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                  <span>{count} updates</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
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
                  Repository Overview
                </h2>
                <button
                  onClick={fetchRepositories}
                  className="text-gray-600 hover:text-gray-900"
                  title="Refresh data"
                >
                  <FaSync className={loading ? 'animate-spin' : ''} />
                </button>
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

              {!loading && !error && renderStats()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
