import { useState } from "react";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleSignup} className="auth-form">
        <h2 className="auth-title">Sign Up</h2>

        {error && <div className="auth-error">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">
          Sign Up
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}
