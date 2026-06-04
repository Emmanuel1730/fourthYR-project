// Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Invalid email or password.");
      }

      const { accessToken, refreshToken, user } = data;

      if (user.role === "ADMIN") {
        setError("Admins must use the admin portal to sign in.");
        return;
      }

      if (user.role !== "STUDENT" && user.role !== "TEACHER") {
        setError("Unrecognized account role. Please contact your administrator.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "STUDENT") navigate("/student");
      else if (user.role === "TEACHER") navigate("/teacher");
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-200">WELCOME</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
            {/* Error Message */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                  disabled={loading}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  disabled={loading}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-center text-gray-400">
                Don't have a school account?{' '}
                <Link to="/school/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  Register a School
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        <p>© 2026 Malawi Edulib System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;