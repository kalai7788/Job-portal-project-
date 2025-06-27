// src/components/dashboard/Profile.jsx

import { useState, useEffect } from "react";
import { auth, db, storage } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Layout from "../Layout";

export default function Profile() {
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const profileRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSummary(data.summary || "");
        setSkills(data.skills ? data.skills.join(", ") : "");
        setEducation(data.education || "");
        setIsPublic(data.isPublic || false);
        setProfileImageUrl(data.profileImageUrl || "");
        setResumeUrl(data.resumeUrl || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Handle image change for preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImageUrl(e.target.result); // Local preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle resume change for preview
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeUrl(e.target.result); // Local preview
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  // Save profile data including image and resume
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setMessage("");
    setLoading(true);

    try {
      let imageUrl = profileImageUrl;
      let resumeDownloadUrl = resumeUrl;

      // Upload profile image if changed
      if (imageFile) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Upload resume if changed
      if (resumeFile) {
        const resumeRef = ref(storage, `resumes/${user.uid}/resume.pdf`);
        await uploadBytes(resumeRef, resumeFile);
        resumeDownloadUrl = await getDownloadURL(resumeRef);
      }

      const profileRef = doc(db, "users", user.uid);
      await setDoc(
        profileRef,
        {
          summary: summary.trim(),
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          education: education.trim(),
          isPublic,
          profileImageUrl: imageUrl,
          resumeUrl: resumeDownloadUrl,
        },
        { merge: true }
      );

      setProfileImageUrl(imageUrl);
      setResumeUrl(resumeDownloadUrl);
      setImageFile(null);
      setResumeFile(null);

      setMessage("Profile saved successfully!");
    } catch (error) {
      setMessage("Error saving profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading profile...</p>
    );

  // Calculate profile completion
  const totalFields = 6; // Added resume field
  const filledFields = [
    summary,
    skills && skills.split(",").filter(Boolean).length > 0,
    education,
    profileImageUrl,
    isPublic,
    resumeUrl,
  ].filter(Boolean).length;

  const profileCompletion = Math.round((filledFields / totalFields) * 100);

  return (
    <Layout title="My Profile">
      <div className="global-container">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">My Profile</h2>
          <p className="text-gray-600">Update your public info and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Image & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center">
              <label className="font-semibold mb-3 text-lg">Profile Image</label>

              <div className="profile-image-container">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" />
                ) : (
                  <span className="text-gray-400 text-sm text-center px-4">Upload Image</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <p className="mt-2 text-sm text-gray-500">Click to change profile picture</p>
            </div>

            {/* Profile Completion */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">Profile Completeness</h3>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className={`h-2.5 rounded-full ${
                    profileCompletion >= 75 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>

              {/* Percentage Text */}
              <p className="text-xs text-gray-500 mt-1">
                {profileCompletion}% Complete
              </p>

              {/* Checklist */}
              <ul className="mt-3 space-y-1 text-sm">
                <li className={summary ? "text-green-600" : "text-gray-500"}>
                  • Summary {summary ? "✅" : "❌"}
                </li>
                <li className={skills.length > 0 ? "text-green-600" : "text-gray-500"}>
                  • Skills {skills.length > 0 ? "✅" : "❌"}
                </li>
                <li className={education ? "text-green-600" : "text-gray-500"}>
                  • Education & Qualification {education ? "✅" : "❌"}
                </li>
                <li className={profileImageUrl ? "text-green-600" : "text-gray-500"}>
                  • Profile Image {profileImageUrl ? "✅" : "❌"}
                </li>
                <li className={isPublic ? "text-green-600" : "text-gray-500"}>
                  • Public Visibility {isPublic ? "✅" : "❌"}
                </li>
                <li className={resumeUrl ? "text-green-600" : "text-gray-500"}>
                  • Resume Uploaded {resumeUrl ? "✅" : "❌"}
                </li>
              </ul>

              {/* Incomplete Message */}
              {profileCompletion < 100 && (
                <p className="text-yellow-600 text-sm mt-2 italic">
                  Your profile is not fully complete. Add missing details to increase visibility!
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <label className="block mb-2 font-semibold text-lg">About Me</label>
              <textarea
                className="w-full border rounded p-3 focus:outline-blue-500 resize-none"
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write about yourself, your experience, and what you're looking for..."
              />
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <label className="block mb-2 font-semibold text-lg">Skills</label>
              <input
                type="text"
                className="w-full border rounded p-3 focus:outline-blue-500"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Python"
              />

              <div className="flex flex-wrap gap-2 mt-3">
                {skills &&
                  skills
                    .split(",")
                    .map((skill) =>
                      skill.trim() ? (
                        <span
                          key={skill.trim()}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ) : null
                    )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <label className="block mb-2 font-semibold text-lg">Education & Qualification</label>
              <textarea
                className="w-full border rounded p-3 focus:outline-blue-500 resize-none"
                rows={3}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Your education background, certifications, or degrees"
              />
            </div>

            {/* Resume Upload */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <label className="block mb-2 font-semibold text-lg">Resume Upload</label>

              <div className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-blue-500 transition">
                <p className="text-sm text-gray-500 mb-1">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-400">PDF only, max 5MB</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Show Resume Link */}
              {resumeUrl && (
                <div className="mt-3">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Resume (PDF)
                  </a>
                </div>
              )}
            </div>

            {/* Public Toggle */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="w-5 h-5"
                />
                <span className="font-medium select-none">Make my profile public</span>
              </label>
            </div>

            {/* Save Button */}
            <button
              className="w-full bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition disabled:opacity-60"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>

            {/* Status Message */}
            {message && (
              <p
                className={`mt-4 text-center ${
                  message.startsWith("Error") ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}