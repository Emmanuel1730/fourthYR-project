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

// ── Theme hook ────────────────────────────────────────────────────────────────
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

// ── Theme-aware class helpers ─────────────────────────────────────────────────
function themeClasses(isDark) {
  return {
    page:        isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100"
                        : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900",
    card:        isDark ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                        : "bg-white border-gray-200 shadow-sm",
    cardHover:   isDark ? "hover:border-gray-600 hover:bg-gray-800/70"
                        : "hover:border-emerald-300 hover:shadow-md",
    innerCard:   isDark ? "bg-gray-900/60 border-gray-700"
                        : "bg-gray-50 border-gray-200",
    hero:        isDark ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30"
                        : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200",
    heroText:    isDark ? "text-gray-100" : "text-gray-800",
    heroSub:     isDark ? "text-emerald-400" : "text-emerald-600",
    heading:     isDark ? "text-gray-200" : "text-gray-700",
    body:        isDark ? "text-gray-300" : "text-gray-600",
    muted:       isDark ? "text-gray-400" : "text-gray-500",
    dimmed:      isDark ? "text-gray-500" : "text-gray-400",
    progressBg:  isDark ? "bg-gray-700/50" : "bg-gray-200",
    hoverRow:    isDark ? "hover:bg-gray-700/20" : "hover:bg-gray-50",
    divider:     isDark ? "border-gray-700/50" : "border-gray-100",
    trendBg:     isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700",
    subjectHover:isDark ? "hover:bg-gray-900/60" : "hover:bg-gray-50",
    modal:       isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
    modalHeader: isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100",
    closeBtn:    isDark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
    historyBg:   isDark ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                        : "bg-gray-50 border-gray-200",
    error:       isDark ? "bg-red-500/10 border-red-500/50 text-red-400"
                        : "bg-red-50 border-red-200 text-red-600",
  };
}

// ── ProgressBar (always green) ────────────────────────────────────────────────
function ProgressBar({ value, color = "#2ea043", height = "h-2", isDark }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 120); return () => clearTimeout(t); }, [value]);
  const tc = themeClasses(isDark);
  return (
    <div className={`w-full ${tc.progressBg} rounded-full ${height} overflow-hidden`}>
      <div className={`${height} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${width}%`, backgroundColor: "#2ea043" }} />
    </div>
  );
}

// ── SubjectModal ──────────────────────────────────────────────────────────────
function SubjectModal({ subject, attempts, onClose, isDark }) {
  const tc     = themeClasses(isDark);
  const color  = SUBJECT_COLORS[subject] || "#2ea043";
  const sorted = [...attempts].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  const byTopic = {};
  attempts.forEach((a) => { if (!byTopic[a.topic]) byTopic[a.topic] = []; byTopic[a.topic].push(a); });
  const avg  = Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);
  const best = Math.max(...attempts.map((a) => a.percentage));

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl ${tc.modal}`}
        onClick={(e) => e.stopPropagation()}>
        <div className={`p-5 sticky top-0 border-b flex items-center justify-between rounded-t-2xl ${tc.modalHeader}`}>
          <div>
            <h2 className="text-lg font-bold" style={{ color }}>{subject}</h2>
            <div className={`flex gap-3 text-xs mt-0.5 ${tc.muted}`}>
              <span>{attempts.length} attempts</span>
              <span>Avg: <span className={`font-bold ${tc.heroText}`}>{avg}%</span></span>
              <span>Best: <span className={`font-bold ${tc.heroText}`}>{best}%</span></span>
            </div>
          </div>
          <button onClick={onClose} className={`transition p-1 rounded-lg ${tc.closeBtn}`}>
            <FiX size={18} />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <div className={`flex justify-between text-xs mb-2`}>
              <span className={tc.muted}>Overall average</span>
              <span className={`font-bold ${tc.heroText}`}>{avg}%</span>
            </div>
            <ProgressBar value={avg} color={color} height="h-3" isDark={isDark} />
          </div>
          {sorted.length > 1 && (
            <div>
              <h3 className={`text-xs font-bold mb-2 ${tc.muted}`}>Score History</h3>
              <div className={`flex items-end gap-1.5 h-20 rounded-xl px-3 py-2 ${tc.innerCard} border`}>
                {sorted.slice(-12).map((a, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1"
                    title={`${a.percentage}% — ${a.topic}`}>
                    <div className="w-full rounded-t transition-all"
                      style={{ height: `${Math.max(4, a.percentage * 0.6)}px`, backgroundColor: "#2ea043", opacity: 0.6 + (i / sorted.length) * 0.4 }} />
                  </div>
                ))}
              </div>
              <div className={`flex justify-between text-[10px] mt-1 px-1 ${tc.dimmed}`}>
                <span>Oldest</span><span>Most recent</span>
              </div>
            </div>
          )}
          <div>
            <h3 className={`text-xs font-bold mb-3 ${tc.muted}`}>Topic Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(byTopic).map(([topic, topicAttempts]) => {
                const topicAvg = Math.round(topicAttempts.reduce((s, a) => s + a.percentage, 0) / topicAttempts.length);
                return (
                  <div key={topic}>
                    <div className={`flex justify-between text-xs mb-1`}>
                      <span className={`truncate pr-2 ${tc.heroText}`}>{topic}</span>
                      <span className={`flex-shrink-0 ${tc.muted}`}>{topicAvg}% · {topicAttempts.length}×</span>
                    </div>
                    <ProgressBar value={topicAvg} color={color} isDark={isDark} />
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

// ── ProgressWidget ────────────────────────────────────────────────────────────
function ProgressWidget({ isDark }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const tc = themeClasses(isDark);

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
    <div className={`border rounded-2xl p-5 animate-pulse ${tc.card}`}>
      <div className={`h-4 rounded w-32 mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className={`h-6 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />)}
      </div>
    </div>
  );

  if (attempts.length === 0) return (
    <div className={`border rounded-2xl p-5 ${tc.card}`}>
      <h2 className={`text-base font-bold mb-3 flex items-center gap-2 ${tc.heading}`}>
        <FiBarChart2 size={16} className="text-emerald-500" /> My Progress
      </h2>
      <p className={`text-sm ${tc.muted}`}>Take some quizzes to see your progress here!</p>
      <Link to="/quizzes" className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
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
    <div className={`border rounded-2xl p-5 ${tc.card}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-base font-bold flex items-center gap-2 ${tc.heading}`}>
          <FiBarChart2 size={16} className="text-emerald-500" /> My Progress
        </h2>
        <span className={`text-xs ${tc.muted}`}>{attempts.length} attempts</span>
      </div>

      <div className={`border rounded-xl p-3 mb-4 ${tc.innerCard}`}>
        <div className="flex justify-between text-xs mb-2">
          <span className={tc.muted}>Overall average</span>
          <span className="font-bold text-emerald-500">{overallAvg}%</span>
        </div>
        <ProgressBar value={overallAvg} isDark={isDark} />
      </div>

      <div className="space-y-3">
        {subjects.map((sub) => {
          const subAttempts = bySubject[sub];
          const subAvg = Math.round(subAttempts.reduce((s, a) => s + a.percentage, 0) / subAttempts.length);
          const color  = SUBJECT_COLORS[sub] || "#2ea043";
          return (
            <button key={sub} onClick={() => setSelected(sub)}
              className={`w-full text-left rounded-xl p-2 transition ${tc.subjectHover}`}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold" style={{ color }}>{sub}</span>
                <span className={tc.muted}>{subAvg}% · {subAttempts.length}×</span>
              </div>
              <ProgressBar value={subAvg} color={color} isDark={isDark} />
            </button>
          );
        })}
      </div>

      {trending && (
        <div className={`mt-4 border rounded-xl px-3 py-2 text-xs flex items-center gap-2 ${tc.trendBg}`}>
          <FiArrowRight size={12} />
          <span>Most improved: <span className="font-semibold">{trending.subject}</span></span>
        </div>
      )}

      {selected && (
        <SubjectModal
          subject={selected}
          attempts={bySubject[selected]}
          onClose={() => setSelected(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// ── Activity icons ────────────────────────────────────────────────────────────
const ACTIVITY_ICONS = {
  DOWNLOAD:        { Icon: FiDownload,    color: "text-emerald-500" },
  RESOURCE_VIEWED: { Icon: FiEye,         color: "text-emerald-500" },
  QUIZ_COMPLETED:  { Icon: FiCheckCircle, color: "text-emerald-500" },
};

// ── StudentDashboard ──────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const isDark = useTheme();
  const tc     = themeClasses(isDark);

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
    { number: stats?.downloads    ?? "—", label: "Downloads",         Icon: FiDownload,    gradient: "from-emerald-500 to-green-500"  },
    { number: stats?.quizzesCount ?? "—", label: "Quizzes Completed", Icon: FiCheckCircle, gradient: "from-emerald-500 to-green-500"  },
    { number: stats?.pastPapers   ?? "—", label: "Resources Viewed",  Icon: FiEye,         gradient: "from-emerald-500 to-green-500"  },
  ];

  const quickLinks = [
    { title: "Books Library",    desc: "Browse textbooks and novels", Icon: FiBookOpen, link: "/books",       gradient: "from-emerald-500 to-green-500"  },
    { title: "Past Papers",      desc: "Access exam papers",          Icon: FiFileText, link: "/past-papers", gradient: "from-emerald-600 to-green-600"  },
    { title: "Practice Quizzes", desc: "Test your knowledge",         Icon: FiEdit3,    link: "/quizzes",     gradient: "from-green-500 to-emerald-500"  },
    { title: "Study Materials",  desc: "Notes and worksheets",        Icon: FiBookmark, link: "/materials",   gradient: "from-emerald-500 to-teal-500"   },
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
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${tc.page}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className={`text-base font-medium ${tc.body}`}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${tc.page}`}>
      <main className="max-w-6xl mx-auto">

        {error && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${tc.error}`}>{error}</div>
        )}

        {/* ── Hero ── */}
        <section className={`relative overflow-hidden border p-8 rounded-2xl mb-6 ${tc.hero}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
              <FaUserGraduate size={24} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-0.5 ${tc.heroText}`}>
                Welcome back, {displayName}!
              </h1>
              {displaySchool && (
                <p className={`text-sm flex items-center gap-1.5 font-medium ${tc.heroSub}`}>
                  <MdOutlineSchool size={15} /> {displaySchool}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Stat Cards ── */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <div key={i}
              className={`relative overflow-hidden border p-5 rounded-2xl hover:-translate-y-0.5 transition-all duration-200 group ${tc.card} ${tc.cardHover}`}>
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <stat.Icon size={18} className="text-white" />
              </div>
              <div className={`text-2xl font-bold ${tc.heroText}`}>{stat.number}</div>
              <div className={`text-sm mt-0.5 ${tc.muted}`}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ── Quick Access + Progress ── */}
        <section className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className={`text-base font-bold mb-4 flex items-center gap-2 ${tc.heading}`}>
              <FiBookOpen size={16} className="text-emerald-500" /> Quick Access
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((item, i) => (
                <Link key={i} to={item.link}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 block group ${tc.card} ${tc.cardHover}`}>
                  <div className={`h-24 flex items-center justify-center bg-gradient-to-br ${item.gradient}`}>
                    <item.Icon size={36} className="text-white drop-shadow" />
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold mb-1 transition-colors ${tc.heroText}`}>{item.title}</h3>
                    <p className={`text-sm ${tc.muted}`}>{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-base font-bold mb-4">&nbsp;</h2>
            <ProgressWidget isDark={isDark} />
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section>
          <h2 className={`text-base font-bold mb-4 flex items-center gap-2 ${tc.heading}`}>
            <FiClock size={16} className="text-emerald-500" /> Recent Activity
          </h2>
          <div className={`border rounded-2xl overflow-hidden ${tc.card}`}>
            {activity.length === 0 ? (
              <div className={`p-8 text-center text-sm ${tc.muted}`}>
                No activity yet. Start by downloading a resource or taking a quiz!
              </div>
            ) : (
              activity.slice(0, 10).map((item, i) => {
                const { text, time } = formatActivity(item);
                const { Icon, color } = ACTIVITY_ICONS[item.action] ?? { Icon: FiBarChart2, color: "text-emerald-500" };
                return (
                  <div key={item.id ?? i}
                    className={`flex items-start gap-3 p-4 border-b last:border-none transition-colors ${tc.divider} ${tc.hoverRow}`}>
                    <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${tc.body}`}>{text}</div>
                      <div className={`text-xs mt-0.5 ${tc.dimmed}`}>{time}</div>
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