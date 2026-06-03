import React, { useState } from "react";
import { FiSearch, FiUsers, FiTrendingUp, FiAward, FiAlertCircle, FiBook, FiCheckCircle } from "react-icons/fi";
import { MdOutlineQuiz, MdOutlineSchool, MdOutlineClass } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";

const STUDENTS = [
  {
    id: 1, name: "Chisomo Banda", form: "Form 3", class: "3A", avatar: "CB",
    quizzes: [
      { subject: "Cell Biology", score: 18, total: 20, date: "Feb 5, 2026" },
      { subject: "Photosynthesis", score: 16, total: 20, date: "Jan 20, 2026" },
      { subject: "Ecology", score: 19, total: 20, date: "Jan 10, 2026" },
    ],
    booksRead: 5, papersAccessed: 8,
  },
  {
    id: 2, name: "Mphatso Chirwa", form: "Form 3", class: "3A", avatar: "MC",
    quizzes: [
      { subject: "Cell Biology", score: 14, total: 20, date: "Feb 5, 2026" },
      { subject: "Photosynthesis", score: 11, total: 20, date: "Jan 20, 2026" },
      { subject: "Ecology", score: 13, total: 20, date: "Jan 10, 2026" },
    ],
    booksRead: 3, papersAccessed: 5,
  },
  {
    id: 3, name: "Thandiwe Mwale", form: "Form 2", class: "2A", avatar: "TM",
    quizzes: [
      { subject: "Photosynthesis", score: 19, total: 20, date: "Feb 4, 2026" },
      { subject: "Cell Biology", score: 17, total: 20, date: "Jan 18, 2026" },
    ],
    booksRead: 7, papersAccessed: 10,
  },
  {
    id: 4, name: "Kondwani Phiri", form: "Form 3", class: "3B", avatar: "KP",
    quizzes: [
      { subject: "Cell Biology", score: 10, total: 20, date: "Feb 5, 2026" },
      { subject: "Photosynthesis", score: 9, total: 20, date: "Jan 20, 2026" },
    ],
    booksRead: 2, papersAccessed: 3,
  },
  {
    id: 5, name: "Grace Mkandawire", form: "Form 2", class: "2A", avatar: "GM",
    quizzes: [
      { subject: "Photosynthesis", score: 17, total: 20, date: "Feb 4, 2026" },
      { subject: "Cell Biology", score: 15, total: 20, date: "Jan 18, 2026" },
      { subject: "Ecology", score: 18, total: 20, date: "Jan 8, 2026" },
    ],
    booksRead: 6, papersAccessed: 9,
  },
  {
    id: 6, name: "Tawonga Nyirenda", form: "Form 4", class: "4B", avatar: "TN",
    quizzes: [
      { subject: "Cell Biology", score: 20, total: 20, date: "Feb 3, 2026" },
      { subject: "Ecology", score: 19, total: 20, date: "Jan 15, 2026" },
    ],
    booksRead: 9, papersAccessed: 14,
  },
  {
    id: 7, name: "Limbani Banda", form: "Form 4", class: "4B", avatar: "LB",
    quizzes: [
      { subject: "Cell Biology", score: 12, total: 20, date: "Feb 3, 2026" },
    ],
    booksRead: 4, papersAccessed: 6,
  },
  {
    id: 8, name: "Suzgo Tembo", form: "Form 3", class: "3B", avatar: "ST",
    quizzes: [
      { subject: "Cell Biology", score: 16, total: 20, date: "Feb 5, 2026" },
      { subject: "Photosynthesis", score: 14, total: 20, date: "Jan 20, 2026" },
    ],
    booksRead: 5, papersAccessed: 7,
  },
];

const FORMS = ["All Forms", "Form 2", "Form 3", "Form 4"];
const CLASSES = ["All Classes", "2A", "3A", "3B", "4B"];

const avg = (arr) => arr.length === 0 ? 0 : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
const studentAvg = (s) => avg(s.quizzes.map((q) => Math.round((q.score / q.total) * 100)));
const scoreColor = (pct) => {
  if (pct >= 80) return { bg: "from-emerald-500/20 to-teal-500/20", color: "#10b981", text: "Excellent" };
  if (pct >= 60) return { bg: "from-amber-500/20 to-orange-500/20", color: "#fbbf24", text: "Good" };
  return { bg: "from-red-500/20 to-pink-500/20", color: "#f87171", text: "Needs Improvement" };
};

function ProgressBar({ pct }) {
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

function ScoreBadge({ score, total }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 75 ? "#10b981" : pct >= 60 ? "#fbbf24" : "#f87171";
  const bg = pct >= 75 ? "rgba(16,185,129,0.15)" : pct >= 60 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)";
  return (
    <span className="text-sm font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: bg, color }}>
      {score}/{total}
    </span>
  );
}

export default function StudentProgress() {
  const [selected, setSelected] = useState(null);
  const [filterForm, setFilterForm] = useState("All Forms");
  const [filterClass, setFilterClass] = useState("All Classes");
  const [searchVal, setSearchVal] = useState("");

  const filtered = STUDENTS.filter((s) => {
    const matchForm = filterForm === "All Forms" || s.form === filterForm;
    const matchClass = filterClass === "All Classes" || s.class === filterClass;
    const matchSearch = s.name.toLowerCase().includes(searchVal.toLowerCase());
    return matchForm && matchClass && matchSearch;
  });

  const classAvg = avg(filtered.map(studentAvg));
  const topStudent = [...filtered].sort((a, b) => studentAvg(b) - studentAvg(a))[0];
  const needsHelp = filtered.filter((s) => studentAvg(s) < 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 p-6">
      <main className="max-w-6xl mx-auto p-4">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8 mb-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative">
            <h1 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <IoStatsChart size={24} className="text-white" />
              </div>
              Student Progress Dashboard
            </h1>
            <p className="text-gray-300 text-base font-medium">Track quiz performance and activity for all your students</p>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          {[
            { number: filtered.length, label: "Students", icon: <FiUsers size={24} />, gradient: "from-blue-500 to-cyan-500" },
            { number: `${classAvg}%`, label: "Class Average", icon: <IoStatsChart size={24} />, gradient: "from-emerald-500 to-teal-500" },
            { number: topStudent?.name?.split(" ")[0] || "—", label: "Top Performer", icon: <FiAward size={24} />, gradient: "from-amber-500 to-orange-500" },
            { number: needsHelp.length, label: "Need Attention", icon: <FiAlertCircle size={24} />, gradient: "from-red-500 to-pink-500" },
          ].map((stat, i) => (
            <div key={i} className="relative overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
              <div className="text-gray-300 mb-2">{stat.icon}</div>
              <div className={`text-3xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent truncate`}>{stat.number}</div>
              <div className="text-sm font-semibold text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search students..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all font-medium" />
          </div>
          <select value={filterForm} onChange={(e) => setFilterForm(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 transition-all font-medium">
            {FORMS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 transition-all font-medium">
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className="text-gray-300 text-base font-semibold ml-auto">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
        </section>

        {/* Split Layout */}
        <div className="grid md:grid-cols-5 gap-6">

          {/* Student List */}
          <div className="md:col-span-2">
            <h2 className="text-base font-bold text-gray-300 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FiUsers size={14} className="text-emerald-400" />
              </div>
              Students ({filtered.length})
            </h2>

            {filtered.length === 0 ? (
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-10 text-center">
                <p className="text-gray-400 text-base font-medium">No students match filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((s) => {
                  const pct = studentAvg(s);
                  const sc = scoreColor(pct);
                  const isSel = selected?.id === s.id;
                  return (
                    <button key={s.id} onClick={() => setSelected(s)}
                      className={`w-full text-left rounded-xl p-4 border transition-all duration-300 ${
                        isSel 
                          ? "bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                          : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold bg-gradient-to-r ${sc.bg}`}
                          style={{ color: sc.color }}>
                          {s.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base font-semibold text-gray-200 truncate">{s.name}</span>
                            <span className="text-sm font-bold ml-2" style={{ color: sc.color }}>{pct}%</span>
                          </div>
                          <ProgressBar pct={pct} />
                          <div className="text-sm text-gray-400 mt-1 font-medium">{s.form} · Class {s.class}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="md:col-span-3">
            {!selected ? (
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
                  <FiUsers size={40} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-base font-medium">Select a student to view their progress</p>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                {(() => {
                  const pct = studentAvg(selected);
                  const sc = scoreColor(pct);
                  return (
                    <>
                      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-b border-gray-700 px-6 py-5 flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-r ${sc.bg} border-2`}
                          style={{ color: sc.color, borderColor: sc.color }}>
                          {selected.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-100 text-xl">{selected.name}</h3>
                          <p className="text-sm text-gray-400 font-medium">{selected.form} · Class {selected.class}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold" style={{ color: sc.color }}>{pct}%</div>
                          <div className="text-sm text-gray-400 font-medium">Overall average</div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Activity Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {[
                            { number: selected.quizzes.length, label: "Quizzes Completed", icon: <MdOutlineQuiz size={18} /> },
                            { number: selected.booksRead, label: "Books Read", icon: <FiBook size={18} /> },
                            { number: selected.papersAccessed, label: "Papers Accessed", icon: <FiTrendingUp size={18} /> },
                          ].map((st, i) => (
                            <div key={i} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-all">
                              <div className="text-emerald-400 mb-2">{st.icon}</div>
                              <div className="text-2xl font-extrabold text-emerald-400">{st.number}</div>
                              <div className="text-sm font-semibold text-gray-400 mt-1">{st.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Status Banner */}
                        <div className={`mb-6 px-5 py-4 rounded-xl border bg-gradient-to-r ${sc.bg}`} style={{ borderColor: sc.color }}>
                          <p className="text-base font-bold" style={{ color: sc.color }}>
                            {pct >= 80 && "🌟 Excellent Performance — Keep up the great work!"}
                            {pct >= 60 && pct < 80 && "📈 Good Progress — A bit more effort and they'll excel!"}
                            {pct < 60 && "⚠️ Needs Attention — Consider extra support or resources"}
                          </p>
                        </div>

                        {/* Quiz History */}
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <MdOutlineQuiz size={16} /> Quiz History
                        </h4>
                        <div className="space-y-3">
                          {selected.quizzes.map((q, i) => {
                            const qPct = Math.round((q.score / q.total) * 100);
                            return (
                              <div key={i} className="bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-4 flex items-center justify-between hover:border-gray-600 transition-all">
                                <div>
                                  <p className="text-base font-bold text-gray-200">{q.subject} Quiz</p>
                                  <p className="text-sm text-gray-400 font-medium">{q.date}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-32 hidden sm:block"><ProgressBar pct={qPct} /></div>
                                  <ScoreBadge score={q.score} total={q.total} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention Table */}
        {needsHelp.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FiAlertCircle size={18} className="text-red-400" />
              </div>
              Students Needing Attention
              <span className="text-sm font-semibold text-red-400 ml-2">(below 60% average)</span>
            </h2>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-3 bg-gray-700/30 px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wide">
                <span>Student Name</span>
                <span>Class</span>
                <span>Average Score</span>
                <span>Quizzes Taken</span>
              </div>
              {needsHelp.map((s) => {
                const pct = studentAvg(s);
                return (
                  <button key={s.id} onClick={() => setSelected(s)}
                    className="w-full grid grid-cols-4 gap-3 px-6 py-4 border-b border-gray-700 last:border-none hover:bg-gray-700/30 transition-all text-left">
                    <span className="text-base font-semibold text-gray-200">{s.name}</span>
                    <span className="text-base text-gray-400 font-medium">{s.form} · {s.class}</span>
                    <span className="text-base font-extrabold text-red-400">{pct}%</span>
                    <span className="text-base text-gray-400 font-medium">{s.quizzes.length} completed</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}