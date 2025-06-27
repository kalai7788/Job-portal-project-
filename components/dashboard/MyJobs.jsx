import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Layout from "../Layout";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user) return;

      const jobsRef = collection(db, "users", user.uid, "appliedJobs");
      const snapshot = await getDocs(jobsRef);

      const jobList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setJobs(jobList);
      setLoading(false);
    };

    fetchAppliedJobs();
  }, [user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-800";
      case "In Review":
        return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled":
        return "bg-purple-100 text-purple-800";
      case "Offer":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateStatus = async (jobId, newStatus) => {
    const jobRef = doc(db, "users", user.uid, "appliedJobs", jobId);
    await updateDoc(jobRef, { status: newStatus });

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: newStatus } : j
      )
    );
  };

  const scheduleInterview = async (jobId, date) => {
    const jobRef = doc(db, "users", user.uid, "appliedJobs", jobId);
    await updateDoc(jobRef, { interviewDate: date });

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, interviewDate: date } : j
      )
    );
  };

  const upcomingInterviews = jobs.filter((j) => j.interviewDate);

  if (loading)
    return (
      <Layout title="My Jobs">
        <p className="text-center mt-10">Loading your applied jobs...</p>
      </Layout>
    );

  return (
    <Layout title="My Jobs">
      <div className="global-container">
        <h2 className="text-3xl font-bold mb-6 text-center">My Applied Jobs</h2>

        {/* Applied Jobs List */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {jobs.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              You haven't applied to any jobs yet.
            </p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>{job.company}</strong> • {job.location}
                </p>
                <p className="text-green-600 mb-3">{job.salary}</p>

                {/* Status Dropdown */}
                <label className="block text-xs text-gray-500 mb-1">
                  Application Status
                </label>
                <select
                  value={job.status || "Applied"}
                  onChange={(e) => updateStatus(job.id, e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-xs font-medium ${getStatusClass(
                    job.status || "Applied"
                  )}`}
                >
                  <option value="Applied">Applied</option>
                  <option value="In Review">In Review</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Interview Date Input */}
                <label className="block text-xs text-gray-500 mt-3 mb-1">
                  Interview Date
                </label>
                <input
                  type="datetime-local"
                  value={
                    job.interviewDate
                      ? new Date(job.interviewDate).toISOString().slice(0, 16)
                      : ""
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  onChange={(e) => scheduleInterview(job.id, e.target.value)}
                />
              </div>
            ))
          )}
        </div>

        {/* Upcoming Interviews Section */}
        {upcomingInterviews.length > 0 && (
          <div className="mt-10 bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">Upcoming Interviews</h3>
            <div className="space-y-4">
              {upcomingInterviews.map((job) => (
                <div
                  key={job.id}
                  className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded"
                >
                  <p className="font-medium">{job.title}</p>
                  <p className="text-gray-600">{job.company}</p>
                  <p className="text-sm text-purple-700 mt-1">
                    {new Date(job.interviewDate).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
