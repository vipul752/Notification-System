import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:7777";

function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserEmail(email);
        setIsLoggedIn(true);
      } else {
        setMessage(`❌ Signup failed: ${data.message}`);
      }
    } catch (err) {
      setMessage(`❌ Signup failed: ${err.message}`);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:7777/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserEmail(email);
        setIsLoggedIn(true);
      } else {
        setMessage(`❌ Login failed: ${data.message}`);
      }
    } catch (err) {
      setMessage(`❌ Login failed: ${err.message}`);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setEmail("");
    setMessage("");
  };

  if (isLoggedIn) {
    return (
      <div className="container home">
        <div className="welcome-icon">👋</div>
        <h1>Welcome!</h1>
        <p className="user-email">{userEmail}</p>
        <p className="success-text">
          You're successfully logged in. Check your email for a notification!
        </p>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🔔 Notification System</h1>
      <p>Test your email notification API</p>

      <div className="form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="buttons">
          <button onClick={handleSignup} disabled={loading || !email}>
            {loading ? "..." : "Signup"}
          </button>
          <button onClick={handleLogin} disabled={loading || !email}>
            {loading ? "..." : "Login"}
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default App;
