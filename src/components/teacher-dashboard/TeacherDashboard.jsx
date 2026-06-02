import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  FiBook, 
  FiFileText, 
  FiUsers, 
  FiBarChart2, 
  FiUserPlus, 
  FiEdit, 
  FiUpload, 
  FiArrowRight,
  FiDownload,
  FiCalendar,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiAlertTriangle
} from "react-icons/fi";
import { 
  MdOutlineLibraryBooks, 
  MdOutlineQuiz, 
  MdOutlinePeople, 
  MdOutlineInsights,
  MdLocationOn,
  MdOutlineAddCircle,
  MdOutlineDescription
} from "react-icons/md";
import { FaChalkboardTeacher, FaBookOpen, FaUserGraduate } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { BiTrendingUp } from "react-icons/bi";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// =========================
// PASSWORD REQUIREMENTS COMPONENT
// =========================
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "At least 1 number", test: /\d/.test(password) },
    { label: "At least 1 uppercase letter", test: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", test: /[a-z]/.test(password) }
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {req.test ? (
            <FiCheck size={12} className="text-[#2ea043]" />
          ) : (
            <FiX size={12} className="text-[#6e7681]" />
          )}
          <span className={req.test ? "text-white" : "text-[#8b949e]"}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// =========================
// MAIN DASHBOARD COMPONENT
// =========================
const TeacherDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [teacherStats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  
  // Create student states
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    bio: "",
    dateOfBirth: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const [
          profileRes,
          resourcesRes,
          quizzesRes,
          statsRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/profiles/me`, { headers }),
          fetch(`${API_BASE}/resources`, { headers }),
          fetch(`${API_BASE}/quizzes/mine`, { headers }),
          fetch(`${API_BASE}/quizzes/teacher/stats`, { headers }),
        ]);

        if (profileRes.ok) {
          setUserData(await profileRes.json());
        }

        if (resourcesRes.ok) {
          const data = await resourcesRes.json();
          const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          const user = (() => {
            try {
              return JSON.parse(localStorage.getItem("user"));
            } catch {
              return {};
            }
          })();

          setResources(arr.filter((r) => r.uploaderId == user?.id).slice(0, 3));
        }

        if (quizzesRes.ok) {
          setQuizzes(await quizzesRes.json());
        }

        if (statsRes.ok) {
          setStats(await statsRes.json());
          setStatsError(false);
        } else {
          setStatsError(true);
        }
      } catch (err) {
        console.error(err);
        setStatsError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // =========================
  // CREATE STUDENT
  // =========================
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError(null);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setFormLoading(true);

    try {
      const res = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          bio: formData.bio || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          role: "STUDENT",
          schoolId: userData?.school?.id ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? `Request failed with status ${res.status}`);
      }

      setFormSuccess("Student added successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        bio: "",
        dateOfBirth: "",
      });

      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // HELPERS
  // =========================
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const displayName = userData ? `${userData.firstName} ${userData.lastName}` : "Teacher";
  const displaySchool = userData?.school?.name ?? "";

  // Determine if stats are available and valid
  const hasValidStats = !statsError && teacherStats;
  const totalStudents = hasValidStats ? teacherStats.totalStudents : 0;
  const avgScore = hasValidStats ? teacherStats.avgScore : 0;

  const stats = [
    {
      number: resources.length,
      label: "Materials Uploaded",
      icon: <FiBook className="text-[#2ea043]" size={24} />,
      color: "#2ea043"
    },
    {
      number: quizzes.length,
      label: "Quizzes Created",
      icon: <MdOutlineQuiz className="text-[#e3b341]" size={24} />,
      color: "#e3b341"
    },
    {
      number: statsError ? "⚠️" : totalStudents,
      label: statsError ? "Error Loading" : "Total Students",
      icon: <FiUsers className="text-[#58a6ff]" size={24} />,
      color: "#58a6ff",
      error: statsError
    },
    {
      number: statsError ? "—" : (hasValidStats ? `${avgScore}%` : "0%"),
      label: statsError ? "Failed to Load" : "Avg Class Score",
      icon: <IoStatsChart className="text-[#a371f7]" size={24} />,
      color: "#a371f7",
      error: statsError
    },
  ];

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2ea043] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-white">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="bg-[#0d1117] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-[#1a3a2a] border border-[#2ea043] rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <FaChalkboardTeacher className="text-[#2ea043]" />
                Welcome back, {displayName}!
              </h1>
              {displaySchool && (
                <p className="text-white text-sm flex items-center gap-1">
                  <MdLocationOn size={14} /> {displaySchool}
                </p>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#2ea043] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#3fb950] transition text-sm flex items-center gap-2"
              >
                <FiUserPlus size={16} /> Add Student
              </button>

              <Link
                to="/create-quiz"
                className="bg-[#e3a525] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#f0b429] transition text-sm flex items-center gap-2"
              >
                <FiEdit size={16} /> Create Quiz
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards - IMPROVED SPACING & VISIBILITY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[#161b22] border border-gray-800 p-6 rounded-lg hover:border-[#2ea043] hover:-translate-y-1 transition"
            >
              <div className="mb-2">{stat.icon}</div>
              <div 
                className={`text-3xl font-bold mb-1 ${stat.error ? 'text-[#f85149]' : 'text-white'}`}
              >
                {stat.number}
              </div>
              <div className={`text-sm font-medium ${stat.error ? 'text-[#f85149]' : 'text-white'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Student Progress - IMPROVED VISIBILITY & SPACING */}
        <div className="mb-8 bg-[#161b22] border border-[#21262d] rounded-lg p-5 hover:border-[#2ea043] transition">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <p className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <BiTrendingUp className="text-[#2ea043]" size={20} />
                Student Progress Overview
              </p>
              
              {statsError ? (
                <p className="text-sm text-[#f85149] flex items-center gap-2">
                  <FiAlertCircle size={14} /> Unable to load student progress data. Please refresh the page.
                </p>
              ) : (!hasValidStats || totalStudents === 0) ? (
                <div className="bg-[#0d1117] border border-dashed border-[#21262d] rounded-lg p-4 mt-2">
                  <p className="text-sm text-white flex items-center gap-2">
                    <FiUsers size={14} className="text-[#58a6ff]" />
                    No students yet. Add your first student to see class progress!
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white mt-1">
                  <FiUsers className="inline mr-2" size={14} />
                  <span className="font-semibold text-white">{totalStudents}</span> student{totalStudents !== 1 ? "s" : ""} have attempted your quizzes ·
                  Class average:{" "}
                  <span className="font-bold text-[#2ea043] text-base">
                    {avgScore}%
                  </span>
                </p>
              )}
            </div>

            <Link
              to="/student-progress"
              className={`text-sm font-semibold px-5 py-2.5 rounded-md transition flex-shrink-0 ${
                (!hasValidStats || totalStudents === 0) 
                  ? "bg-[#21262d] text-[#6e7681] cursor-not-allowed" 
                  : "bg-[#2ea043] text-white hover:bg-[#3fb950]"
              }`}
              onClick={(e) => {
                if (!hasValidStats || totalStudents === 0) {
                  e.preventDefault();
                }
              }}
            >
              View Progress <FiArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Materials - IMPROVED VISIBILITY */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaBookOpen size={22} /> My Recent Materials
            </h2>
            <Link
              to="/resources"
              className="bg-[#2ea043] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#3fb950] transition"
            >
              View All
            </Link>
          </div>

          {resources.length === 0 ? (
            <div className="bg-[#161b22] border border-gray-800 rounded-lg p-12 text-center">
              <div className="text-4xl mb-3 flex justify-center">
                <MdOutlineLibraryBooks size={48} className="text-gray-600" />
              </div>
              <p className="text-base text-white">
                No materials uploaded yet.
              </p>
              <Link
                to="/upload-material"
                className="inline-block mt-4 text-[#2ea043] hover:text-[#3fb950] text-sm font-semibold"
              >
                Upload your first material →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#161b22] border border-gray-800 rounded-lg p-5 hover:border-[#2ea043] transition cursor-pointer"
                  onClick={() => r.fileUrl && window.open(r.fileUrl, "_blank")}
                >
                  <div className="text-xs font-bold mb-2 text-[#58a6ff] uppercase tracking-wide">
                    {r.type || "Document"}
                  </div>
                  <h3 className="font-semibold text-white text-base mb-3 truncate">
                    {r.title}
                  </h3>
                  <div className="flex gap-4 text-xs text-white mb-3">
                    {r.targetClass?.name && (
                      <span className="flex items-center gap-1">
                        <FiCalendar size={12} /> {r.targetClass.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiDownload size={12} /> {r.downloadCount ?? 0} downloads
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-sm text-white mb-4 line-clamp-2 flex items-start gap-1">
                      <MdOutlineDescription className="mt-0.5 flex-shrink-0" size={14} />
                      {r.description}
                    </p>
                  )}
                  <button className="bg-[#2ea043] text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#3fb950] transition">
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiBarChart2 size={22} /> My Recent Quizzes
            </h2>
            <Link
              to="/create-quiz"
              className="bg-gray-700 border border-gray-600 text-white text-sm font-semibold px-5 py-2 rounded-md hover:border-[#2ea043] transition flex items-center gap-1"
            >
              <MdOutlineAddCircle /> Create New
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-[#161b22] border border-gray-800 rounded-lg p-12 text-center">
              <div className="text-4xl mb-3 flex justify-center">
                <MdOutlineQuiz size={48} className="text-gray-600" />
              </div>
              <p className="text-base text-white">
                No quizzes created yet.
              </p>
              <Link
                to="/create-quiz"
                className="inline-block mt-4 text-[#2ea043] hover:text-[#3fb950] text-sm font-semibold"
              >
                Create your first quiz →
              </Link>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#1a3a2a] px-5 py-3 text-sm font-bold text-white">
                <div>Title</div>
                <div>Subject</div>
                <div>Form</div>
                <div>Created</div>
              </div>

              {quizzes.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-5 py-4 border-b border-gray-800 last:border-none hover:bg-[#0d1117] transition"
                >
                  <div className="text-white font-medium truncate flex items-center gap-2">
                    <FiFileText size={14} className="text-[#2ea043]" />
                    {q.title}
                  </div>
                  <div className="text-white">{q.subject || "—"}</div>
                  <div className="text-white">{q.form || "—"}</div>
                  <div className="text-white flex items-center gap-1">
                    <FiCalendar size={12} />
                    {formatDate(q.createdAt)}
                  </div>
                </div>
              ))}

              {quizzes.length > 5 && (
                <div className="px-5 py-3 text-center border-t border-gray-800">
                  <Link
                    to="/create-quiz?view=saved"
                    className="text-sm text-[#58a6ff] hover:underline inline-flex items-center gap-1"
                  >
                    View all {quizzes.length} quizzes <FiArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* ADD STUDENT MODAL - ORIGINAL VERSION */}
      {/* ========================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #21262d",
            }}
          >
            <div
              className="px-5 py-4 flex justify-between items-center"
              style={{
                borderBottom: "1px solid #21262d",
              }}
            >
              <h2
                className="text-sm font-semibold flex items-center gap-2 text-white"
              >
                <FaUserGraduate size={16} />
                Add New Student
              </h2>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  color: "#8b949e",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="p-5">
              {formError && (
                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: "#3d1f1f",
                    border: "1px solid #f85149",
                    color: "#f85149",
                  }}
                >
                  <FiAlertCircle size={14} />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: "#1a2f1a",
                    border: "1px solid #2ea043",
                    color: "#3fb950",
                  }}
                >
                  <FiCheck size={14} />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleAddStudent}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    placeholder="First name"
                    className="bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    placeholder="Last name"
                    className="bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    placeholder="Email"
                    className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    placeholder="Password"
                    className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="mb-4">
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    rows="2"
                    placeholder="Bio"
                    className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-white resize-none"
                  />
                </div>

                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs"
                  style={{
                    backgroundColor: "#1c2330",
                    border: "1px solid #21262d",
                    color: "#8b949e",
                  }}
                >
                  Role:{" "}
                  <span className="text-[#388bfd] font-semibold">
                    STUDENT
                  </span>
                  <br />
                  School:{" "}
                  <span className="text-[#2ea043] font-semibold">
                    Automatically assigned from teacher account
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2ea043] text-white flex items-center gap-2"
                  >
                    {formLoading ? "Adding..." : <><FiUserPlus size={14} /> Add Student</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={formLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1c2330] border border-[#21262d] text-white flex items-center gap-2"
                  >
                    <FiX size={14} /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;