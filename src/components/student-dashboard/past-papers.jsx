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

const PastPapers = () => {
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
    try {
      await fetch(`${API_BASE}/activity`, { method: "POST", headers, body: JSON.stringify({ action, resourceTitle: title, metadata }) });
    } catch {}
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
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6">
      <main className="max-w-6xl mx-auto p-4">

        {/* Hero Header */}
        <section className="bg-[#1a3a2a] border border-[#2ea043] p-8 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <MdOutlineDescription className="text-[#2ea043]" /> Past Papers
          </h1>
          <p className="opacity-80 text-sm">Access and download past examination papers by subject and level.</p>
        </section>

        {/* Search & Filters */}
        <div className="bg-[#161b22] border border-[#21262d] p-6 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search past papers..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-[#21262d] bg-[#0d1117] text-[#e6edf3] rounded-lg px-4 py-2 focus:border-[#2ea043] focus:outline-none placeholder-[#6e7681]" />
            <button className="bg-[#2ea043] text-white px-6 py-2 rounded-lg hover:bg-[#3fb950] transition flex items-center gap-2">
              <FiSearch size={16} className="text-white" /> Search
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-[#21262d] bg-[#0d1117] text-[#e6edf3] p-2 rounded-md focus:border-[#2ea043] focus:outline-none">
              <option>All Levels</option>
              <option>Form 1</option><option>Form 2</option>
              <option>Form 3</option><option>Form 4</option>
            </select>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-[#21262d] bg-[#0d1117] text-[#e6edf3] p-2 rounded-md focus:border-[#2ea043] focus:outline-none">
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-[#e6edf3]">
            Showing {Math.min(startIndex + 1, totalItems)}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} past papers
          </h2>
        </div>

        {loading && (
          <div className="text-center py-12 text-[#8b949e]">Loading past papers...</div>
        )}
        {error && (
          <div className="bg-[#3d1a1a] border border-[#f85149] text-[#f85149] p-4 rounded-lg mb-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {currentPapers.length === 0 ? (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-16 text-center text-[#6e7681]">
                <FaRegFileAlt size={40} className="mx-auto mb-3 opacity-40 text-[#2ea043]" />
                <p className="text-sm">No past papers found.</p>
              </div>
            ) : currentPapers.map((paper, index) => (
              <div key={paper.id ?? index}
                className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 hover:border-[#2ea043] transition">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-20 h-24 bg-gradient-to-br ${COLORS[index % COLORS.length]} flex items-center justify-center rounded relative flex-shrink-0`}>
                    <FaRegFileAlt size={28} className="opacity-40 text-white" />
                    <span className="absolute -top-1 -right-1 bg-[#2ea043] text-white text-xs px-1 py-0.5 rounded font-semibold">
                      PDF
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#e6edf3] text-base mb-1">{paper.title}</h3>
                    {paper.uploader && (
                      <p className="text-xs text-[#6e7681] mb-1">
                        Uploaded by {paper.uploader.firstName} {paper.uploader.lastName} · {formatDate(paper.createdAt)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      {paper.category?.name && (
                        <span className="text-xs font-semibold text-[#2ea043]">{paper.category.name}</span>
                      )}
                      {paper.targetClass?.name && (
                        <span className="text-xs text-[#6e7681]">{paper.targetClass.name}</span>
                      )}
                      {paper.targetAudience && (
                        <span className="text-xs text-[#6e7681]">{paper.targetAudience}</span>
                      )}
                    </div>
                    {paper.description && (
                      <p className="text-xs text-[#6e7681] mt-1 line-clamp-1">{paper.description}</p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handlePreview(paper)}
                      className="bg-[#2ea043] text-white px-3 py-2 rounded text-sm hover:bg-[#3fb950] transition flex items-center gap-1.5 font-semibold">
                      <FiEye size={14} className="text-white" /> Preview
                    </button>
                    <button onClick={() => handleDownload(paper)}
                      className="bg-[#238636] text-white px-3 py-2 rounded text-sm hover:bg-[#2ea043] transition flex items-center gap-1.5 font-semibold">
                      <FiDownload size={14} className="text-white" /> Download
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
              className={`border border-[#21262d] px-3 py-1 rounded flex items-center ${currentPage === 1 ? "text-[#6e7681] cursor-not-allowed" : "text-[#e6edf3] hover:border-[#2ea043]"}`}>
              <FiChevronLeft size={16} className={currentPage === 1 ? "text-[#6e7681]" : "text-[#2ea043]"} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${currentPage === page ? "bg-[#2ea043] text-white" : "border border-[#21262d] text-[#e6edf3] hover:border-[#2ea043]"}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
              className={`border border-[#21262d] px-3 py-1 rounded flex items-center ${currentPage === totalPages ? "text-[#6e7681] cursor-not-allowed" : "text-[#e6edf3] hover:border-[#2ea043]"}`}>
              <FiChevronRight size={16} className={currentPage === totalPages ? "text-[#6e7681]" : "text-[#2ea043]"} />
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default PastPapers;