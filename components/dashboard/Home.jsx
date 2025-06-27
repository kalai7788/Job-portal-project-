import React, { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Layout from "../Layout";

export default function Home() {
  const [jobTitle, setJobTitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const [selectedJob, setSelectedJob] = useState(null);
  const [userSkills, setUserSkills] = useState([]);

  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  const jobData = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Chennai",
      salary: "₹30,000 - ₹50,000 a month",
      tags: ["React", "HTML", "CSS"],
      badges: ["Urgently hiring"],
      description: "Build beautiful UIs using modern web technologies.",
    },
    {
      id: 2,
      title: "Backend Developer",
      company: "DataWorks",
      location: "Bangalore",
      salary: "₹800,000 - ₹1,200,000 a year",
      tags: ["Node.js", "MongoDB", "Express"],
      badges: ["Hiring multiple candidates"],
      description: "Develop scalable backend systems for enterprise apps.",
    },
  ];

  useEffect(() => {
    const fetchUserSkills = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        const skills = data.skills || [];
        setUserSkills(skills);
      }
    };

    fetchUserSkills();
  }, []);

  const calculateMatch = (jobTags) => {
    if (!Array.isArray(userSkills) || !Array.isArray(jobTags)) return 0;

    const normalizedUserSkills = userSkills.map((s) =>
      s.trim().toLowerCase()
    );

    const matched = jobTags.filter((tag) =>
      normalizedUserSkills.includes(tag.toLowerCase())
    );

    return Math.round((matched.length / jobTags.length) * 100) || 0;
  };

  const filteredJobs = jobData.filter((job) =>
    job.title.toLowerCase().includes(jobTitle.toLowerCase()) &&
    (selectedLocation ? job.location === selectedLocation : true)
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOption === "salary") {
      const aSal = parseInt(a.salary.replace(/[^0-9]/g, "").split(" ")[0]);
      const bSal = parseInt(b.salary.replace(/[^0-9]/g, "").split(" ")[0]);
      return bSal - aSal;
    }
    return 0;
  });

  const handleApply = async () => {
    const user = auth.currentUser;
    if (!user || !selectedJob) return;

    setIsApplying(true);
    setApplyMessage("");

    try {
      const applyRef = doc(db, "users", user.uid, "appliedJobs", selectedJob.id.toString());

      await setDoc(applyRef, {
        ...selectedJob,
        appliedAt: new Date().toISOString(),
      });

      setApplyMessage("✅ Successfully Applied!");
    } catch (error) {
      console.error("Apply Error:", error);
      setApplyMessage("❌ Failed to apply. Please try again.");
    }

    setIsApplying(false);
  };

  return (
    <Layout>
      {/* Search Bar */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Find Jobs</h2>

        <form className="flex flex-wrap gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-lg min-w-[200px]"
          />

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border rounded-lg min-w-[180px]"
          >
            <option value="">All Locations</option>
            <option value="Chennai">Chennai</option>
            <option value="Bangalore">Bangalore</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-lg min-w-[180px]"
          >
            <option value="newest">Newest First</option>
            <option value="salary">Salary: High to Low</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Find Jobs
          </button>
        </form>
      </div>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Job Listings */}
        <div className="lg:w-2/3 space-y-4">
          {sortedJobs.length > 0 ? (
            sortedJobs.map((job) => {
              const matchScore = calculateMatch(job.tags);

              return (
                <div
                  key={job.id}
                  className="p-5 bg-white rounded-xl shadow-md relative hover:bg-blue-50 transition"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="absolute top-4 right-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        matchScore >= 80
                          ? "bg-green-100 text-green-800"
                          : matchScore >= 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {matchScore}% match
                    </span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    {job.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">
                    <strong>{job.company}</strong> • {job.location}
                  </p>
                  <p className="text-green-600 mt-1">{job.salary}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-6">
              No jobs found. Try changing filters.
            </p>
          )}
        </div>

        {/* Job Details Sidebar */}
        <aside className="lg:w-1/3 bg-white p-5 rounded-xl shadow-md sticky top-6 self-start">
          {selectedJob ? (
            <>
              <h2 className="text-xl font-bold mb-2">{selectedJob.title}</h2>
              <p className="text-gray-600 mb-1">
                <strong>{selectedJob.company}</strong> • {selectedJob.location}
              </p>
              <p className="text-green-600 mb-4">{selectedJob.salary}</p>

              <h3 className="font-semibold mb-2">Description</h3>
              <p className="mb-4 text-gray-700">{selectedJob.description}</p>

              <h3 className="font-semibold mb-2">Benefits</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
                {selectedJob.tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
              >
                {isApplying ? "Applying..." : "Apply"}
              </button>

              {applyMessage && (
                <p className="mt-2 text-center text-sm text-green-600">
                  {applyMessage}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500 italic">Click a job to view details</p>
          )}
        </aside>
      </main>
    </Layout>
  );
}
