import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSignOutAlt, FaUser, FaEnvelope, FaGithub, FaGoogle } from 'react-icons/fa';

const Profile = ({ user }) => {
  const navigate = useNavigate();

  // Debug log to see the user object structure
  console.log('User object:', user);
  console.log('User photos:', user?.photos);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout", {
        withCredentials: true,
      });
      console.log("Logout successful");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const getProviderIcon = () => {
    // Since we know it's GitHub from the githubId field
    return <FaGithub className="text-gray-800" />;
  };

  // Function to get avatar URL with fallback
  const getAvatarUrl = () => {
    if (user?.profilePic) {
      return user.profilePic;
    }
    // Fallback to default avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 flex justify-center">
              <img
                src={getAvatarUrl()}
                alt={`${user?.name || 'User'}'s Avatar`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
                }}
              />
            </div>

            {/* User Info */}
            <div className="mt-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <div className="mt-2 flex items-center justify-center space-x-2 text-gray-600">
                {getProviderIcon()}
                <span className="text-sm capitalize">
                  Connected with GitHub
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="mt-8 max-w-lg mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                {user.email && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <FaEnvelope className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaUser className="text-gray-400" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaGithub className="text-gray-400" />
                  <span>GitHub ID: {user.githubId}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaSignOutAlt className="mr-2" />
                Sign Out
              </button>
            </div>

            {/* Stats Section */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-gray-100 pt-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="mt-1 text-sm font-medium text-gray-500">Learning Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="mt-1 text-sm font-medium text-gray-500">Completed Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="mt-1 text-sm font-medium text-gray-500">Achievements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-900">Start Learning</h3>
            <p className="mt-2 text-sm text-gray-500">Begin your learning journey with personalized tracks.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-900">View Progress</h3>
            <p className="mt-2 text-sm text-gray-500">Track your learning progress and achievements.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
