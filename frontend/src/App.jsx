import { useMemo, useState } from "react";
import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import { api } from "./api";
import Dashboard from "./pages/Dashboard";
import ResourcesPage from "./pages/ResourcesPage";
import BookingsPage from "./pages/BookingsPage";

function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const fn = isLogin ? api.login : api.signup;
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const res = await fn(payload);
      onAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="card auth-card">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={submit} className="stack">
        {!isLogin && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {!isLogin && (
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">student</option>
            <option value="faculty">faculty</option>
            <option value="admin">admin</option>
          </select>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">{isLogin ? "Login" : "Create account"}</button>
      </form>
      <button className="link-btn" onClick={() => setIsLogin((s) => !s)}>
        {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
      </button>
    </div>
  );
}

function Layout({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="container">
      <header className="header">
        <h1>Lab Booking Portal</h1>
        <div className="header-right">
          <span>
            {user.name} ({user.role})
          </span>
          <button
            onClick={() => {
              onLogout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <nav className="nav">
        <Link to="/">Dashboard</Link>
        <Link to="/resources">Resources</Link>
        <Link to="/bookings">Bookings</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/resources" element={<ResourcesPage user={user} />} />
        <Route path="/bookings" element={<BookingsPage user={user} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("session");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthed = useMemo(() => Boolean(session?.token), [session]);

  const handleAuth = (data) => {
    localStorage.setItem("session", JSON.stringify(data));
    setSession(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("session");
    setSession(null);
  };

  if (!isAuthed) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={<Layout user={session.user} token={session.token} onLogout={handleLogout} />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
