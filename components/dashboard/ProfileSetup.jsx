// src/components/dashboard/ProfileSetup.jsx

import { useState, useEffect } from "react";
import { auth, db, storage } from "../../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = auth.currentUser;

  // Redirect if profile already exists
  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        navigate("/profile");
      }
    };

    checkProfile();
  }, [user, navigate]);

  // Fetch existing data if any
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setName(data.name || "");
        setQualification(data.qualification || "");
        setSkills(data.skills || []);
        setResumeUrl(data.resumeUrl || "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleSkillAdd = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill("");
    }
  };

  const handleSkillRemove = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    let uploadedResumeUrl = resumeUrl;

    if (resumeFile) {
      const resumeRef = ref(storage, `resumes/${user.uid}`);
      await uploadBytes(resumeRef, resumeFile);
      uploadedResumeUrl = await getDownloadURL(resumeRef);
    }

    await setDoc(doc(db, "users", user.uid), {
      name,
      qualification,
      skills,
      resumeUrl: uploadedResumeUrl,
    });

    setLoading(false);
    navigate("/profile");
  };

  return (
    <div className="global-container">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block mb-1 font-semibold">Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            className="w-full border rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Qualification */}
        <div>
          <label className="block mb-1 font-semibold">Qualification</label>
          <input
            type="text"
            placeholder="Your qualification"
            className="w-full border rounded p-2"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            required
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block mb-1 font-semibold">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a skill"
              className="flex-1 border rounded p-2"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSkillAdd}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleSkillRemove(skill)}
                  className="ml-2 text-red-500 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block mb-1 font-semibold">Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />
          {resumeUrl && (
            <div className="mt-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Preview Resume
              </a>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}