import { useState } from "react";
import Home from "./Home";
import MyJobs from "./MyJobs";
import Profile from "./Profile";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="dashboard-container" style={{ padding: "1rem" }}>
      {/* Tabs */}
      <nav style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "home" ? "#3b82f6" : "#e0e7ff",
            color: activeTab === "home" ? "white" : "#1e293b",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("myjobs")}
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "myjobs" ? "#3b82f6" : "#e0e7ff",
            color: activeTab === "myjobs" ? "white" : "#1e293b",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          My Jobs
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "profile" ? "#3b82f6" : "#e0e7ff",
            color: activeTab === "profile" ? "white" : "#1e293b",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Profile
        </button>
      </nav>

      {/* Content */}
      <div>
        {activeTab === "home" && <Home />}
        {activeTab === "myjobs" && <MyJobs />}
        {activeTab === "profile" && <Profile />}
      </div>
    </div>
  );
}
