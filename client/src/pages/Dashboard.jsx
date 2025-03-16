import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Profile from "../components/Profile";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/user", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => navigate("/")); // Redirect if not authenticated
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {user ? <Profile user={user} /> : <p>Loading...</p>}
    </div>
  );
};

export default Dashboard;
