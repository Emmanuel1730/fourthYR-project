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

      // Block admins from using this login page
      if (user.role === "ADMIN") {
        setError("Admins must use the admin portal to sign in.");
        return;
      }

      // Store auth tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on user role automatically
      if (user.role === "STUDENT") {
        navigate("/student");
      } else if (user.role === "TEACHER") {
        navigate("/teacher");
      } else {
        setError("Invalid user role. Please contact support.");
      }
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
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/25">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-2">Sign in to continue to your dashboard</p>
          </div>

          {/* Login Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
            {/* Error Message */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                  disabled={loading}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  disabled={loading}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-xl text-base font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="mt-6 pt-5 border-t border-gray-700">
              <p className="text-sm text-center text-gray-400">
                Don't have a school account?{' '}
                <Link to="/school/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
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