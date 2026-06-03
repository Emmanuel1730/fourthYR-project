// Signup.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Signup = () => {
  const [role, setRole] = useState("STUDENT");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [bio, setBio] = useState("");
  const [level, setLevel] = useState("Form 1");
  const [libraryCardNumber, setLibraryCardNumber] = useState("");

  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/school`);
        if (!response.ok) throw new Error("Failed to fetch schools");
        const data = await response.json();
        setSchools(data);
      } catch (err) {
        setSchoolsError("Could not load schools. Please refresh the page.");
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      password,
      role,
      schoolId,
      libraryCardNumber,
      bio: role === "STUDENT" ? `${bio} | Level: ${level}` : bio,
      dateOfBirth,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Registration failed. Please try again.";
        setError(message);
        return;
      }

      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      const userRole = data.user.role;
      if (userRole === "STUDENT") navigate("/student");
      else if (userRole === "TEACHER") navigate("/teacher");
      else if (userRole === "ADMIN") navigate("/admin");
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join the Malawi Edulib System</p>
          </div>

          {/* Signup Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
            {/* Role Toggle */}
            <div className="flex mb-5 bg-gray-900/50 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  role === "STUDENT" 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-gray-400 hover:text-gray-200"
                }`}>
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  role === "TEACHER" 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-gray-400 hover:text-gray-200"
                }`}>
                Teacher
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl text-sm flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Library Card Number</label>
                <input
                  type="text"
                  value={libraryCardNumber}
                  onChange={(e) => setLibraryCardNumber(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              {role === "STUDENT" && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Form Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">School</label>
                {schoolsError ? (
                  <p className="text-sm text-red-400">{schoolsError}</p>
                ) : (
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    disabled={schoolsLoading}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                    required
                  >
                    <option value="">{schoolsLoading ? "Loading schools..." : "Select School"}</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || schoolsLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  `Sign up as ${role === "STUDENT" ? "Student" : "Teacher"}`
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-sm text-gray-400 mt-5 text-center">
              Already have an account?{" "}
              <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        © 2026 Malawi Edulib System
      </footer>
    </div>
  );
};

export default Signup;