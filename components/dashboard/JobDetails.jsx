// src/components/dashboard/JobDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Layout from "../Layout";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Example job data (replace with real data later)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockJobs = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Chennai",
      salary: "₹30,000 - ₹50,000 a month",
      tags: ["Full-time", "Remote", "Health insurance"],
      badges: ["Urgently hiring"],
      description: "Looking for a React developer with 2+ years of experience.",
    },
    {
      id: "2",
      title: "Backend Developer",
      company: "DataWorks",
      location: "Bangalore",
      salary: "₹800,000 - ₹1,200,000 a year",
      tags: ["Permanent", "Work from office", "Flexible hours"],
      badges: ["Hiring multiple candidates"],
      description: "Seeking Node.js developer for cloud services backend.",
    },
  ];

  useEffect(() => {
    const fetchJob = async () => {
      const foundJob = mockJobs.find((j) => j.id === id);
      if (!foundJob) {
        // eslint-disable-next-line no-undef
        setMessage("Job not found.");
        setLoading(false);
        return;
      }

      setJob(foundJob);

      const user = auth.currentUser;
      if (user) {
        const appliedRef = doc(db, "users", user.uid, "appliedJobs", id);
        const snap = await getDoc(appliedRef);
        setApplied(snap.exists());
      }

      setLoading(false);
    };

    fetchJob();
  }, [id, mockJobs]);

  const handleApply = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to apply.");
      navigate("/login");
      return;
    }

    try {
      const appliedRef = doc(db, "users", user.uid, "appliedJobs", id);
      await setDoc(appliedRef, job);
      setApplied(true);
      alert("Successfully applied!");
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center mt-10">Loading job details...</p>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <p className="text-center mt-10 text-red-600">Job not found.</p>
      </Layout>
    );
  }

  return (
    <Layout title={job.title}>
      <div className="global-container">
        {/* Badges */}
        <div className="mb-4 flex gap-2">
          {job.badges.map((badge, index) => (
            <span
              key={index}
              className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Title & Company */}
        <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
        <p className="text-gray-600 mb-1">
          <strong>{job.company}</strong> • {job.location}
        </p>
        <p className="text-green-600 mb-4">{job.salary}</p>

        {/* Benefits */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Benefits</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {job.tags.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
        </div>

        {/* Description */}
        <div className="mb-6 bg-white p-5 rounded shadow">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={applied}
          className={`w-full py-3 rounded-lg font-medium transition ${
            applied
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {applied ? "Already Applied" : "Apply Now"}
        </button>
      </div>
    </Layout>
  );
}