import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen, FiFileText, FiEdit3, FiBookmark, FiBarChart2,
  FiClock, FiDownload, FiCheckCircle, FiEye, FiArrowRight, FiX,
} from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const SUBJECT_COLORS = {
  Biology: "#2ea043", Mathematics: "#1f6feb", Chemistry: "#a371f7",
  Physics: "#f0883e", English: "#e3b341", Geography: "#58a6ff",
  History: "#da3633", "Civic Education": "#56d364", "Computer Studies": "#79c0ff",
  Agriculture: "#2ea043", "Business Studies": "#f0883e", Chichewa: "#e3b341",
};

function ProgressBar({ value, color = "#2ea043", height = "h-2" }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 120); return () => clearTimeout(t); }, [value]);
  const getColor = (p) => p >= 75 ? (color || "#2ea043") : p >= 50 ? "#e3b341" : "#da3633";
  return (
    <div className={`w-full bg-[#21262d] rounded-full ${height} overflow-hidden`}>
      <div className={`${height} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${width}%`, backgroundColor: getColor(value) }} />
    </div>
  );
}

function SubjectModal({ subject, attempts, onClose }) {
  const color  = SUBJECT_COLORS[subject] || "#2ea043";
  const sorted = [...attempts].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  const byTopic = {};
  attempts.forEach((a) => { if (!byTopic[a.topic]) byTopic[a.topic] = []; byTopic[a.topic].push(a); });
  const avg  = Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);
  const best = Math.max(...attempts.map((a) => a.percentage));

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sticky top-0 bg-[#0d1117] border-b border-[#21262d] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color }}>{subject}</h2>
            <div className="flex gap-3 text-xs text-[#6e7681] mt-0.5">
              <span>{attempts.length} attempts</span>
              <span>Avg: <span className="font-bold text-[#e6edf3]">{avg}%</span></span>
              <span>Best: <span className="font-bold text-[#e6edf3]">{best}%</span></span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6e7681] hover:text-[#e6edf3] transition"><FiX size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#6e7681]">Overall average</span>
              <span className="font-bold text-[#e6edf3]">{avg}%</span>
            </div>
            <ProgressBar value={avg} color={color} height="h-3" />
          </div>
          {sorted.length > 1 && (
            <div>
              <h3 className="text-xs font-bold text-[#6e7681] mb-2">Score History</h3>
              <div className="flex items-end gap-1.5 h-20 bg-[#161b22] rounded-lg px-3 py-2">
                {sorted.slice(-12).map((a, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${a.percentage}% — ${a.topic}`}>
                    <div className="w-full rounded-t transition-all"
                      style={{ height: `${Math.max(4, a.percentage * 0.6)}px`, backgroundColor: color, opacity: 0.6 + (i / sorted.length) * 0.4 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#6e7681] mt-1 px-1">
                <span>Oldest</span><span>Most recent</span>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-[#6e7681] mb-3">Topic Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(byTopic).map(([topic, topicAttempts]) => {
                const topicAvg = Math.round(topicAttempts.reduce((s, a) => s + a.percentage, 0) / topicAttempts.length);
                return (
                  <div key={topic}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#e6edf3] truncate pr-2">{topic}</span>
                      <span className="text-[#6e7681] flex-shrink-0">{topicAvg}% · {topicAttempts.length}×</span>
                    </div>
                    <ProgressBar value={topicAvg} color={color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressWidget() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const hdrs  = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    fetch(`${API_BASE}/quizzes/attempts/mine`, { headers: hdrs })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setAttempts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 animate-pulse">
      <div className="h-4 bg-[#21262d] rounded w-32 mb-4" />
      <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-6 bg-[#21262d] rounded" />)}</div>
    </div>
  );

  if (attempts.length === 0) return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
      <h2 className="text-base font-bold mb-3 text-[#e6edf3] flex items-center gap-2">
        <FiBarChart2 size={16} className="text-[#2ea043]" /> My Progress
      </h2>
      <p className="text-sm text-[#6e7681]">Take some quizzes to see your progress here!</p>
      <Link to="/quizzes" className="inline-flex items-center gap-1 mt-3 text-sm text-[#2ea043] hover:underline">
        Go to Quizzes <FiArrowRight size={13} />
      </Link>
    </div>
  );

  const bySubject  = {};
  attempts.forEach((a) => { if (!bySubject[a.subject]) bySubject[a.subject] = []; bySubject[a.subject].push(a); });
  const subjects   = Object.keys(bySubject);
  const overallAvg = Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);

  let trending = null;
  subjects.forEach((sub) => {
    const sa = bySubject[sub];
    if (sa.length >= 2) {
      const diff = sa[0].percentage - sa[1].percentage;
      if (!trending || diff > trending.diff) trending = { subject: sub, diff };
    }
  });

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#e6edf3] flex items-center gap-2">
          <FiBarChart2 size={16} className="text-[#2ea043]" /> My Progress
        </h2>
        <span className="text-xs text-[#6e7681]">{attempts.length} attempts</span>
      </div>

      {/* Overall */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#6e7681]">Overall average</span>
          <span className="font-bold text-[#2ea043]">{overallAvg}%</span>
        </div>
        <ProgressBar value={overallAvg} />
      </div>

      {/* Per subject */}
      <div className="space-y-3">
        {subjects.map((sub) => {
          const subAttempts = bySubject[sub];
          const subAvg = Math.round(subAttempts.reduce((s, a) => s + a.percentage, 0) / subAttempts.length);
          const color  = SUBJECT_COLORS[sub] || "#2ea043";
          return (
            <button key={sub} onClick={() => setSelected(sub)}
              className="w-full text-left hover:bg-[#0d1117] rounded-md p-2 transition group">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold" style={{ color }}>{sub}</span>
                <span className="text-[#6e7681]">{subAvg}% · {subAttempts.length}×</span>
              </div>
              <ProgressBar value={subAvg} color={color} />
            </button>
          );
        })}
      </div>

      {trending && (
        <div className="mt-4 bg-[#1a3a2a] border border-[#2ea043] rounded-md px-3 py-2 text-xs flex items-center gap-2">
          <FiArrowRight size={12} className="text-[#2ea043]" />
          <span className="text-[#3fb950]">
            Most improved: <span className="font-semibold">{trending.subject}</span>
          </span>
        </div>
      )}

      {selected && (
        <SubjectModal subject={selected} attempts={bySubject[selected]} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

const ACTIVITY_ICONS = {
  DOWNLOAD:        { Icon: FiDownload,    dot: "text-[#2ea043]" },
  RESOURCE_VIEWED: { Icon: FiEye,         dot: "text-[#388bfd]" },
  QUIZ_COMPLETED:  { Icon: FiCheckCircle, dot: "text-[#f0883e]" },
};

const StudentDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const token = localStorage.getItem("accessToken");
  const hdrs  = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, statsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/profiles/me`,       { headers: hdrs }),
          fetch(`${API_BASE}/activity/me/stats`, { headers: hdrs }),
          fetch(`${API_BASE}/activity/me`,       { headers: hdrs }),
        ]);
        if (profileRes.ok)  setUserData(await profileRes.json());
        if (statsRes.ok)    setStats(await statsRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch {
        setError("Failed to load dashboard data.");
        try { const stored = JSON.parse(localStorage.getItem("user")); if (stored) setUserData(stored); } catch {}
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const displayName   = userData?.firstName ?? "Student";
  const displaySchool = userData?.school?.name ?? "";

  const statCards = [
    { number: stats?.downloads    ?? "—", label: "Downloads",         Icon: FiDownload    },
    { number: stats?.quizzesCount ?? "—", label: "Quizzes Completed", Icon: FiCheckCircle },
    { number: stats?.pastPapers   ?? "—", label: "Resources Viewed",  Icon: FiEye         },
  ];

  const quickLinks = [
    { title: "Books Library",    desc: "Browse textbooks and novels", Icon: FiBookOpen, link: "/books"       },
    { title: "Past Papers",      desc: "Access exam papers",          Icon: FiFileText, link: "/past-papers" },
    { title: "Practice Quizzes", desc: "Test your knowledge",         Icon: FiEdit3,    link: "/quizzes"     },
    { title: "Study Materials",  desc: "Notes and worksheets",        Icon: FiBookmark, link: "/materials"   },
  ];

  const formatActivity = (item) => {
    const time = new Date(item.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    switch (item.action) {
      case "DOWNLOAD":        return { text: `Downloaded "${item.resourceTitle ?? "a resource"}"`, time };
      case "RESOURCE_VIEWED": return { text: `Viewed "${item.resourceTitle ?? "a resource"}"`,     time };
      case "QUIZ_COMPLETED":  return { text: `Completed ${item.metadata?.subject ?? ""} quiz — ${item.metadata?.topic ?? ""} (${item.metadata?.percentage ?? 0}%)`, time };
      default:                return { text: "Activity recorded", time };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
      <div className="text-[#8b949e]">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6">
      <main className="max-w-6xl mx-auto p-4">

        {error && (
          <div className="mb-4 px-4 py-2 rounded-lg text-sm bg-[#3d1a1a] border border-[#f85149] text-[#f85149]">{error}</div>
        )}

        {/* Hero / Welcome */}
        <section className="bg-[#1a3a2a] border border-[#2ea043] p-8 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FaUserGraduate /> Welcome back, {displayName}!
          </h1>
          {displaySchool && (
            <p className="opacity-80 text-sm flex items-center gap-1">
              <MdOutlineSchool size={14} /> {displaySchool}
            </p>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] p-5 rounded-lg hover:border-[#2ea043] hover:-translate-y-1 transition">
              <stat.Icon size={18} className="text-[#2ea043] mb-2" />
              <div className="text-2xl font-bold text-[#2ea043]">{stat.number}</div>
              <div className="text-sm text-[#6e7681]">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Quick Access + Progress */}
        <section className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-base font-bold mb-4 text-[#e6edf3] flex items-center gap-2">
              <FiBookOpen size={16} className="text-[#2ea043]" /> Quick Access
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((item, i) => (
                <Link key={i} to={item.link}
                  className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden hover:border-[#2ea043] hover:-translate-y-1 transition block">
                  <div className="h-24 flex items-center justify-center bg-[#0d1117]">
                    <item.Icon size={36} className="text-[#2ea043]" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#e6edf3] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#6e7681]">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-base font-bold mb-4 text-[#e6edf3]">&nbsp;</h2>
            <ProgressWidget />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-base font-bold mb-4 text-[#e6edf3] flex items-center gap-2">
            <FiClock size={16} className="text-[#2ea043]" /> Recent Activity
          </h2>
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg">
            {activity.length === 0 ? (
              <div className="p-6 text-center text-[#6e7681] text-sm">
                No activity yet. Start by downloading a resource or taking a quiz!
              </div>
            ) : (
              activity.slice(0, 10).map((item, i) => {
                const { text, time } = formatActivity(item);
                const { Icon, dot }  = ACTIVITY_ICONS[item.action] ?? { Icon: FiBarChart2, dot: "text-[#6e7681]" };
                return (
                  <div key={item.id ?? i}
                    className="flex items-start gap-3 p-4 border-b border-[#21262d] last:border-none hover:bg-[#0d1117] transition">
                    <Icon size={15} className={`mt-0.5 flex-shrink-0 ${dot}`} />
                    <div className="flex-1">
                      <div className="text-sm text-[#8b949e]">{text}</div>
                      <div className="text-xs text-[#6e7681] mt-0.5">{time}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default StudentDashboard;