import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/dashboard/Home";
import MyJobs from "./components/dashboard/MyJobs";
import Profile from "./components/dashboard/Profile";
import ProfileSetup from "./components/dashboard/ProfileSetup";
import JobDetails from "./components/dashboard/JobDetails";
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Pages */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myjobs" element={<MyJobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/job/:id" element={<JobDetails />} />
      </Routes>
    </Router>
  );
}
