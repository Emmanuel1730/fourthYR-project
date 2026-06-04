import React, { useState, useEffect } from "react";
import { FiSearch, FiDownload, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdOutlineDescription } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const COLORS = [
  "from-green-600 to-green-900",   "from-emerald-600 to-emerald-900",
  "from-purple-600 to-purple-900", "from-orange-500 to-orange-800",
  "from-yellow-400 to-yellow-700", "from-teal-500 to-teal-800",
  "from-red-600 to-red-900",       "from-lime-600 to-lime-900",
  "from-cyan-500 to-cyan-800",     "from-green-500 to-green-800",
  "from-amber-500 to-amber-800",   "from-rose-500 to-rose-800",
];

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function tc(isDark) {
  return {
    page:      isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100"
                      : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900",
    card:      isDark ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                      : "bg-white border-gray-200 shadow-sm",
    cardHover: isDark ? "hover:border-gray-600 hover:bg-gray-800/70"
                      : "hover:border-emerald-300 hover:shadow-md",
    hero:      isDark ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30"
                      : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200",
    heroText:  isDark ? "text-gray-100" : "text-gray-800",
    heroSub:   isDark ? "text-emerald-400/80" : "text-emerald-600",
    input:     isDark ? "border-gray-700 bg-gray-900/60 text-gray-200 placeholder-gray-500 focus:border-emerald-500"
                      : "border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-emerald-500",
    select:    isDark ? "border-gray-700 bg-gray-900/60 text-gray-200 focus:border-emerald-500"
                      : "border-gray-300 bg-white text-gray-800 focus:border-emerald-500",
    muted:     isDark ? "text-gray-400" : "text-gray-500",
    title:     isDark ? "text-gray-100" : "text-gray-800",
    uploader:  isDark ? "text-gray-500" : "text-gray-400",
    desc:      isDark ? "text-gray-500" : "text-gray-400",
    lvlBadge:  isDark ? "bg-gray-700/50 text-gray-400" : "bg-gray-100 text-gray-500",
    error:     isDark ? "bg-red-500/10 border-red-500/50 text-red-400"
                      : "bg-red-50 border-red-200 text-red-600",
    dlBtn:     isDark ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200",
    pgBtn:     (active) => active
                 ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                 : isDark ? "border border-gray-600 text-gray-300 hover:border-emerald-500" : "border border-gray-300 text-gray-600 hover:border-emerald-500",
    pgNav:     (disabled) => disabled
                 ? isDark ? "border border-gray-700 text-gray-600 cursor-not-allowed" : "border border-gray-200 text-gray-300 cursor-not-allowed"
                 : isDark ? "border border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-emerald-400" : "border border-gray-300 text-gray-600 hover:border-emerald-500",
  };
}

const PastPapers = () => {
  const isDark = useTheme();
  const t = tc(isDark);

  const [papers, setPapers]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedLevel, setSelectedLevel]     = useState("All Levels");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [currentPage, setCurrentPage]     = useState(1);
  const itemsPerPage = 12;

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${API_BASE}/resources`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
        const data = await res.json();
        const all = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setPapers(all.filter((r) => r.form === "OTHER"));
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchPapers();
  }, []);

  const logActivity = async (action, title, metadata = {}) => {
    try { await fetch(`${API_BASE}/activity`, { method: "POST", headers, body: JSON.stringify({ action, resourceTitle: title, metadata }) }); } catch {}
  };

  const handleDownload = async (paper) => {
    try { await fetch(`${API_BASE}/resources/${paper.id}/download`, { method: "POST", headers }); } catch {}
    await logActivity("DOWNLOAD", paper.title);
    if (paper.fileUrl) window.open(paper.fileUrl, "_blank");
  };

  const handlePreview = async (paper) => {
    await logActivity("RESOURCE_VIEWED", paper.title);
    if (paper.fileUrl) window.open(paper.fileUrl, "_blank");
  };

  const subjects = ["All Subjects", ...new Set(papers.map((p) => p.category?.name).filter(Boolean))];

  const filtered = papers.filter((paper) => {
    const matchesSearch  = paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) || paper.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel   = selectedLevel   === "All Levels"   || paper.targetClass?.name === selectedLevel;
    const matchesSubject = selectedSubject === "All Subjects" || paper.category?.name    === selectedSubject;
    return matchesSearch && matchesLevel && matchesSubject;
  });

  const totalItems    = filtered.length;
  const totalPages    = Math.ceil(totalItems / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const currentPapers = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedLevel, selectedSubject]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${t.page}`}>
      <main className="max-w-6xl mx-auto">

        {/* Hero */}
        <section className={`relative overflow-hidden border p-8 rounded-2xl mb-6 ${t.hero}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
              <MdOutlineDescription size={22} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-0.5 ${t.heroText}`}>Past Papers</h1>
              <p className={`text-sm ${t.heroSub}`}>Access and download past examination papers by subject and level.</p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className={`border p-6 rounded-2xl mb-6 transition-colors duration-300 ${t.card}`}>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search past papers..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${t.input}`} />
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/25">
              <FiSearch size={16} /> Search
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
              className={`border p-2.5 rounded-xl focus:outline-none text-sm transition-all ${t.select}`}>
              <option>All Levels</option>
              <option>Form 1</option><option>Form 2</option>
              <option>Form 3</option><option>Form 4</option>
            </select>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              className={`border p-2.5 rounded-xl focus:outline-none text-sm transition-all ${t.select}`}>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="mb-4">
          <p className={`text-sm ${t.muted}`}>
            Showing {Math.min(startIndex + 1, totalItems)}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} past papers
          </p>
        </div>

        {loading && <div className={`text-center py-12 ${t.muted}`}>Loading past papers...</div>}
        {error && <div className={`border p-4 rounded-xl mb-4 text-sm ${t.error}`}>{error}</div>}

        {!loading && !error && (
          <div className="space-y-3">
            {currentPapers.length === 0 ? (
              <div className={`border rounded-2xl p-16 text-center ${t.card}`}>
                <FaRegFileAlt size={40} className="mx-auto mb-3 opacity-30 text-emerald-500" />
                <p className={`text-sm ${t.muted}`}>No past papers found.</p>
              </div>
            ) : currentPapers.map((paper, index) => (
              <div key={paper.id ?? index}
                className={`border rounded-2xl p-4 transition-all duration-200 ${t.card} ${t.cardHover}`}>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-20 h-24 bg-gradient-to-br ${COLORS[index % COLORS.length]} flex items-center justify-center rounded-xl relative flex-shrink-0`}>
                    <FaRegFileAlt size={28} className="opacity-40 text-white" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-lg font-semibold shadow">
                      PDF
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base mb-1 ${t.title}`}>{paper.title}</h3>
                    {paper.uploader && (
                      <p className={`text-xs mb-1 ${t.uploader}`}>
                        Uploaded by {paper.uploader.firstName} {paper.uploader.lastName} · {formatDate(paper.createdAt)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {paper.category?.name && (
                        <span className="text-xs font-semibold text-emerald-500">{paper.category.name}</span>
                      )}
                      {paper.targetClass?.name && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${t.lvlBadge}`}>{paper.targetClass.name}</span>
                      )}
                      {paper.targetAudience && (
                        <span className={`text-xs ${t.desc}`}>{paper.targetAudience}</span>
                      )}
                    </div>
                    {paper.description && (
                      <p className={`text-xs mt-1 line-clamp-1 ${t.desc}`}>{paper.description}</p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handlePreview(paper)}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-2 rounded-xl text-sm hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-1.5 font-semibold shadow-lg shadow-emerald-500/20">
                      <FiEye size={14} /> Preview
                    </button>
                    <button onClick={() => handleDownload(paper)}
                      className={`border px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 font-semibold ${t.dlBtn}`}>
                      <FiDownload size={14} /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl flex items-center transition-all ${t.pgNav(currentPage === 1)}`}>
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${t.pgBtn(currentPage === page)}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl flex items-center transition-all ${t.pgNav(currentPage === totalPages)}`}>
              <FiChevronRight size={16} />
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default PastPapers;