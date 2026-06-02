import { useState, useEffect } from "react";
import { 
  FiBook, FiUsers, FiCheck, FiAlertCircle, FiX, FiPlus, FiFolder, FiGrid, FiArrowLeft
} from "react-icons/fi";
import { MdOutlineLibraryBooks, MdOutlineSchool, MdOutlineClass, MdAssignment } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { BiBookOpen } from "react-icons/bi";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TYPE_STYLE = {
  "Lesson Plan":  { bg: "from-amber-500/20 to-amber-600/20", color: "#fbbf24", icon: "📋" },
  "Worksheet":    { bg: "from-emerald-500/20 to-teal-500/20", color: "#10b981", icon: "📝" },
  "Presentation": { bg: "from-purple-500/20 to-pink-500/20", color: "#a78bfa", icon: "🎯" },
  "Book":         { bg: "from-blue-500/20 to-cyan-500/20", color: "#60a5fa", icon: "📚" },
  "Quiz":         { bg: "from-red-500/20 to-orange-500/20", color: "#f87171", icon: "❓" },
  "PDF":          { bg: "from-blue-500/20 to-cyan-500/20", color: "#60a5fa", icon: "📄" },
  "VIDEO":        { bg: "from-orange-500/20 to-red-500/20", color: "#fb923c", icon: "🎬" },
};

const getTypeStyle = (type) => TYPE_STYLE[type] ?? { bg: "from-gray-500/20 to-gray-600/20", color: "#9ca3af", icon: "📁" };

export default function MyClasses() {
  const [classes, setClasses]       = useState([]);
  const [allResources, setAll]      = useState([]);
  const [selected, setSelected]     = useState(null);
  const [classResources, setClassRes] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [clsRes, resRes] = await Promise.all([
          fetch(`${API_BASE}/classes`, { headers }),
          fetch(`${API_BASE}/resources`, { headers }),
        ]);
        if (clsRes.ok)  setClasses(await clsRes.json());
        if (resRes.ok) {
          const data = await resRes.json();
          const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setAll(arr);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/classes/${selected.id}/resources`, { headers });
        if (res.ok) {
          const data = await res.json();
          setClassRes(data.map((cr) => cr.resource));
        }
      } catch {}
    };
    load();
  }, [selected]);

  const assignResource = async (resource) => {
    try {
      const res = await fetch(
        `${API_BASE}/classes/${selected.id}/resources/${resource.id}`,
        { method: "POST", headers }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to assign resource");
      }
      setClassRes((prev) => [...prev, resource]);
      showToast(`✨ "${resource.title}" assigned to ${selected.name}`);
      setShowAssign(false);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const removeResource = async (resourceId) => {
    try {
      const res = await fetch(
        `${API_BASE}/classes/${selected.id}/resources/${resourceId}`,
        { method: "DELETE", headers }
      );
      if (!res.ok) throw new Error("Failed to remove resource");
      setClassRes((prev) => prev.filter((r) => r.id !== resourceId));
      showToast("Resource removed from class");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 p-6">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toast-animation {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {toast && (
        <div className="fixed top-6 right-6 z-50 toast-animation">
          <div className={`px-5 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 backdrop-blur-sm ${
            toast.type === "error" 
              ? "bg-red-500/20 border border-red-500/50 text-red-400" 
              : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
          }`}>
            {toast.type === "error" ? <IoWarningOutline /> : <FiCheck />} {toast.msg}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <MdOutlineSchool size={20} className="text-white" />
              </div>
              My Classes
            </h1>
            <p className="text-gray-400 text-sm">Manage your classes and assign learning resources to students</p>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { number: classes.length, label: "Total Classes", icon: <MdOutlineClass />, gradient: "from-blue-500 to-cyan-500" },
            { number: classes.reduce((s, c) => s + (c.students ?? 0), 0), label: "Students", icon: <FaUserGraduate />, gradient: "from-emerald-500 to-teal-500" },
            { number: allResources.length, label: "Resources", icon: <MdOutlineLibraryBooks />, gradient: "from-purple-500 to-pink-500" },
            { number: classes.length, label: "Active Classes", icon: <FiGrid />, gradient: "from-orange-500 to-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="relative overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
              <div className="text-gray-400 mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.number}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Class List */}
          <div>
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <MdOutlineClass size={14} className="text-emerald-400" />
              </div>
              Your Classes
            </h2>
            {classes.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                <BiBookOpen className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-sm">No classes found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <button key={cls.id} onClick={() => { setSelected(cls); setShowAssign(false); }}
                    className={`w-full text-left rounded-xl p-4 transition-all duration-300 ${
                      selected?.id === cls.id 
                        ? "bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                        : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                    } border`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold flex items-center gap-2">
                        <MdOutlineClass size={16} className="text-emerald-400" />
                        {cls.name}
                      </span>
                    </div>
                    {cls.school?.name && (
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <MdOutlineSchool size={12} /> {cls.school.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resource Panel */}
          <div>
            {!selected ? (
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
                  <FiArrowLeft size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">Select a class to manage its resources</p>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-b border-gray-700 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 text-gray-200">
                      <MdOutlineClass /> {selected.name}
                    </h3>
                    {selected.school?.name && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MdOutlineSchool size={12} /> {selected.school.name}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setShowAssign((v) => !v)}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-1 shadow-lg shadow-emerald-500/25">
                    <FiPlus size={12} /> Assign Resource
                  </button>
                </div>

                {showAssign && (
                  <div className="border-b border-gray-700 bg-gray-900/50 px-5 py-4">
                    <p className="text-xs text-gray-400 mb-3">Choose a resource to assign:</p>
                    {allResources.length === 0 ? (
                      <p className="text-xs text-gray-400">No resources available</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {allResources.map((res) => {
                          const style = getTypeStyle(res.type);
                          const assigned = classResources.some((r) => r.id === res.id);
                          return (
                            <button key={res.id} onClick={() => assignResource(res)} disabled={assigned}
                              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                                assigned 
                                  ? "border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed" 
                                  : "border-gray-700 bg-gray-800/50 hover:border-emerald-500/50 hover:bg-gray-800"
                              }`}>
                              <span className="text-sm text-gray-200 truncate flex items-center gap-2">
                                <span>{style.icon}</span> {res.title}
                              </span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${style.bg} text-${style.color}`}
                                style={{ color: style.color }}>
                                {assigned ? "✓ Added" : res.type}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <MdAssignment size={12} /> Assigned Resources ({classResources.length})
                  </p>
                  {classResources.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2 flex justify-center">
                        <MdOutlineLibraryBooks size={40} className="text-gray-600" />
                      </div>
                      <p className="text-xs text-gray-400">No resources assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {classResources.map((res) => {
                        const style = getTypeStyle(res.type);
                        return (
                          <div key={res.id}
                            className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 hover:border-emerald-500/50 transition-all group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gradient-to-r flex items-center gap-1" 
                                style={{ background: style.bg, color: style.color }}>
                                <span>{style.icon}</span> {res.type}
                              </span>
                              <span className="text-sm truncate flex items-center gap-2 text-gray-300">
                                <FiBook size={12} className="flex-shrink-0" /> {res.title}
                              </span>
                            </div>
                            <button onClick={() => removeResource(res.id)}
                              className="text-xs text-red-400 hover:text-red-300 ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                              <FiX size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}