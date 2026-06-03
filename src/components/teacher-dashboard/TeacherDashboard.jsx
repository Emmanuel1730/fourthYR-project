import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiBook, FiFileText, FiUsers, FiBarChart2, FiUserPlus, FiEdit, 
  FiUpload, FiArrowRight, FiDownload, FiCalendar, FiX, FiCheck, 
  FiAlertCircle, FiTrendingUp, FiAward, FiClock
} from "react-icons/fi";
import { MdOutlineLibraryBooks, MdOutlineQuiz, MdOutlinePeople, MdOutlineSchool, MdLocationOn } from "react-icons/md";
import { FaChalkboardTeacher, FaBookOpen, FaUserGraduate } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TeacherDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [teacherStats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", bio: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, resourcesRes, quizzesRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/profiles/me`, { headers }),
          fetch(`${API_BASE}/resources`, { headers }),
          fetch(`${API_BASE}/quizzes/mine`, { headers }),
          fetch(`${API_BASE}/quizzes/teacher/stats`, { headers }),
        ]);

        if (profileRes.ok) setUserData(await profileRes.json());
        if (resourcesRes.ok) {
          const data = await resourcesRes.json();
          const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          const user = (() => { 
            try { 
              return JSON.parse(localStorage.getItem("user") || "{}"); 
            } catch { 
              return {}; 
            } 
          })();
          // Fix: Use == instead of === for type coercion or convert both to strings
          setResources(arr.filter((r) => String(r.uploaderId) === String(user?.id)).slice(0, 3));
        }
        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          // Handle paginated response if needed
          setQuizzes(Array.isArray(quizzesData?.data) ? quizzesData.data : Array.isArray(quizzesData) ? quizzesData : []);
        }
        if (statsRes.ok) { 
          const statsData = await statsRes.json();
          setStats(statsData); 
          setStatsError(false); 
        } else {
          setStatsError(true);
        }
      } catch (err) { 
        console.error("Error loading dashboard data:", err);
        setStatsError(true); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, []); // Add headers to dependency array if needed, but it's created each render

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError(null); 
    setFormSuccess(null);
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setFormError("Please fill in all required fields"); 
      return;
    }
    
    // Add email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return;
    }
    
    // Add password validation (at least 6 characters)
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }
    
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profiles`, {
        method: "POST", 
        headers,
        body: JSON.stringify({
          firstName: formData.firstName.trim(), 
          lastName: formData.lastName.trim(),
          email: formData.email.trim(), 
          password: formData.password,
          bio: formData.bio?.trim() || undefined,
          role: "STUDENT", 
          schoolId: userData?.school?.id ?? undefined,
        }),
      });
      
      if (!res.ok) { 
        const data = await res.json().catch(() => ({})); 
        throw new Error(data?.message || data?.error || `Request failed with status ${res.status}`); 
      }
      
      setFormSuccess("Student added successfully!");
      setFormData({ firstName: "", lastName: "", email: "", password: "", bio: "" });
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const displayName = userData ? `${userData.firstName} ${userData.lastName}` : "Teacher";
  const displaySchool = userData?.school?.name ?? "";
  const hasValidStats = !statsError && teacherStats && teacherStats.totalStudents !== undefined;
  const totalStudents = hasValidStats ? teacherStats.totalStudents : 0;
  const avgScore = hasValidStats && teacherStats.avgScore !== undefined ? Math.round(teacherStats.avgScore) : 0;

  const stats = [
    { number: resources.length, label: "Materials", icon: <FiBook size={24} />, gradient: "from-blue-500 to-cyan-500" },
    { number: quizzes.length, label: "Quizzes", icon: <MdOutlineQuiz size={24} />, gradient: "from-amber-500 to-orange-500" },
    { number: statsError ? "⚠️" : totalStudents, label: "Students", icon: <FiUsers size={24} />, gradient: "from-emerald-500 to-teal-500", error: statsError },
    { number: statsError ? "—" : (hasValidStats ? `${avgScore}%` : "0%"), label: "Class Avg", icon: <IoStatsChart size={24} />, gradient: "from-purple-500 to-pink-500", error: statsError },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-base font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-emerald-100/40 to-teal-100/40 dark:from-emerald-900/40 dark:to-teal-900/40 backdrop-blur-sm border border-emerald-200/40 dark:border-emerald-500/20 rounded-2xl p-8 mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <FaChalkboardTeacher size={20} className="text-white" />
                </div>
                Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{displayName}</span>!
              </h1>
              {displaySchool && (
                <p className="text-gray-700 dark:text-gray-300 text-base flex items-center gap-2">
                  <MdLocationOn size={16} className="text-emerald-400" /> {displaySchool}
                </p>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <FiUserPlus size={16} /> Add Student
              </button>
              <Link to="/create-quiz"
                className="bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25">
                <FiEdit size={16} /> Create Quiz
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
              <div className="text-gray-700 dark:text-gray-300 mb-2">{stat.icon}</div>
              <div className={`text-3xl font-extrabold ${stat.error ? 'text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{stat.number}</div>
              <div className={`text-sm font-semibold mt-1 ${stat.error ? 'text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Student Progress Overview */}
        <div className="mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-100/20 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <FiTrendingUp size={16} className="text-emerald-400" />
                </div>
                Student Progress Overview
              </p>
              {statsError ? (
                <p className="text-base text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                  <FiAlertCircle size={16} /> Unable to load student progress data
                </p>
              ) : (!hasValidStats || totalStudents === 0) ? (
                <div className="bg-gray-50/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2">
                  <p className="text-base text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiUsers size={16} className="text-blue-400" /> No students yet. Add your first student to see progress!
                  </p>
                </div>
              ) : (
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1 font-medium">
                  <FiUsers className="inline mr-2" size={16} />
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{totalStudents}</span> student{totalStudents !== 1 ? "s" : ""} have attempted quizzes · 
                  Class average: <span className="font-extrabold text-emerald-400 text-xl">{avgScore}%</span>
                </p>
              )}
            </div>
            <Link to="/student-progress"
              className={`text-base font-semibold px-6 py-2.5 rounded-xl transition-all flex-shrink-0 ${
                (!hasValidStats || totalStudents === 0) 
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed pointer-events-none" 
                  : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25"
              }`}>
              View Progress <FiArrowRight size={16} className="inline ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Materials */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FaBookOpen size={18} className="text-blue-400" />
              </div>
              My Recent Materials
            </h2>
            <Link to="/resources" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              View All
            </Link>
          </div>

          {resources.length === 0 ? (
            <div className="bg-gray-50/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-100/30 dark:bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdOutlineLibraryBooks size={40} className="text-gray-500" />
              </div>
              <p className="text-gray-700 dark:text-gray-400 text-base">No materials uploaded yet</p>
              <Link to="/resources" className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
                Upload your first material →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {resources.map((r) => (
                <div key={r.id} onClick={() => r.fileUrl && window.open(r.fileUrl, "_blank")}
                  className="bg-white/90 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer">
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-2">{r.type || "Document"}</div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-3 truncate">{r.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {r.targetClass?.name && <span className="flex items-center gap-1 font-medium"><FiCalendar size={14} /> {r.targetClass.name}</span>}
                    <span className="flex items-center gap-1 font-medium"><FiDownload size={14} /> {r.downloadCount ?? 0} downloads</span>
                  </div>
                  {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{r.description}</p>}
                  <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <FiBarChart2 size={18} className="text-amber-400" />
              </div>
              My Recent Quizzes
            </h2>
            <Link to="/create-quiz" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
              <FiEdit size={14} /> Create New
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-gray-50/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-100/30 dark:bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdOutlineQuiz size={40} className="text-gray-500" />
              </div>
              <p className="text-gray-700 dark:text-gray-400 text-base">No quizzes created yet</p>
              <Link to="/create-quiz" className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
                Create your first quiz →
              </Link>
            </div>
          ) : (
            <div className="bg-white/90 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50/90 dark:bg-gray-700/30 px-5 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                <div>Title</div>
                <div>Subject</div>
                <div>Form</div>
                <div>Created</div>
              </div>
              {quizzes.slice(0, 5).map((q) => (
                <div key={q.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                  <div className="text-gray-900 dark:text-gray-100 font-semibold truncate flex items-center gap-2 text-base">
                    <FiFileText size={16} className="text-emerald-400" /> {q.title}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">{q.subject || "—"}</div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">{q.form || "—"}</div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1"><FiCalendar size={14} /> {formatDate(q.createdAt)}</div>
                </div>
              ))}
              {quizzes.length > 5 && (
                <div className="px-5 py-3 text-center border-t border-gray-200 dark:border-gray-700">
                  <Link to="/create-quiz?view=saved" className="text-base text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold">
                    View all {quizzes.length} quizzes <FiArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-fadeIn shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <FaUserGraduate size={18} className="text-white" /> Add New Student
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              {formError && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 font-medium">
                  <FiAlertCircle size={16} /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-medium">
                  <FiCheck size={16} /> {formSuccess}
                </div>
              )}
              <form onSubmit={handleAddStudent}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleFormChange} 
                    disabled={formLoading}
                    placeholder="First name *" 
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50" 
                    required
                  />
                  <input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleFormChange} 
                    disabled={formLoading}
                    placeholder="Last name *" 
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50" 
                    required
                  />
                </div>
                <div className="mb-3">
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleFormChange} 
                    disabled={formLoading}
                    placeholder="Email address *" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50" 
                    required
                  />
                </div>
                <div className="mb-3">
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleFormChange} 
                    disabled={formLoading}
                    placeholder="Password (min. 6 characters) *" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50" 
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleFormChange} 
                    disabled={formLoading}
                    rows={3} 
                    placeholder="Bio (optional)" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder-gray-500 disabled:opacity-50" 
                  />
                </div>
                <div className="mb-5 px-4 py-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Role:</span> 
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">STUDENT</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold">School:</span> 
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Auto-assigned</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={formLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={16} /> Add Student
                      </>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} disabled={formLoading}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 transition-all disabled:opacity-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;