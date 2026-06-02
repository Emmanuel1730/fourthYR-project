import { useState, useEffect } from "react";
import { 
  FiBook, FiEdit, FiSave, FiTrash2, FiPlus, FiEye, FiEyeOff, 
  FiDownload, FiUpload, FiUsers, FiBarChart2, FiCheckCircle,
  FiXCircle, FiClock, FiCalendar, FiChevronDown, FiChevronUp,
  FiSearch, FiFilter, FiArrowLeft, FiArrowRight, FiRefreshCw
} from "react-icons/fi";
import { MdOutlineQuiz, MdOutlineDescription, MdOutlineSchool } from "react-icons/md";
import { FaChalkboardTeacher, FaUserGraduate, FaRegFileAlt } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { BiTrendingUp } from "react-icons/bi";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const SUBJECTS  = ["Biology","Mathematics","English","Physics","Chemistry","History","Civic Education","Computer Studies","Agriculture","Business Studies","Home Economics","Chichewa","French"];
const FORMS     = ["Form 1","Form 2","Form 3","Form 4"];
const DURATIONS = ["15 min","30 min","45 min","60 min","90 min","120 min"];

const SUBJECT_COLORS = {
  Biology: "#2ea043", Mathematics: "#1f6feb", Chemistry: "#a371f7",
  Physics: "#f0883e", English: "#e3b341", Geography: "#58a6ff",
  History: "#da3633", "Civic Education": "#56d364", "Computer Studies": "#79c0ff",
};

const blankQuestion = () => ({ id: `${Date.now()}-${Math.random()}`, text: "", options: ["","","",""], answer: 0 });
const blankQuiz     = () => ({ title:"", subject:"Biology", form:"Form 1", duration:"30 min", description:"", visibility:"PUBLIC", schoolId:"", questions:[blankQuestion()] });

const token   = () => localStorage.getItem("accessToken");
const headers = () => ({ "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

// Progress Bar Component
function ProgressBar({ value, color = "#2ea043" }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 80); return () => clearTimeout(t); }, [value]);
  const getColor = p => p >= 75 ? color : p >= 50 ? "#e3b341" : "#da3633";
  return (
    <div className="w-full bg-[#21262d] rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width:`${width}%`, backgroundColor:getColor(value) }}/>
    </div>
  );
}

// Student Progress Panel Component
function StudentProgressPanel({ quizzes }) {
  const [attempts, setAttempts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterQuiz, setFilterQuiz]   = useState("all");
  const [sortBy, setSortBy]           = useState("recent");
  const [expandedStudent, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/quizzes/teacher/attempts`, { headers: headers() });
        if (res.ok) setAttempts(await res.json());
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const byStudent = {};
  attempts.forEach(a => {
    const key  = a.studentId;
    const name = a.student?.firstName
      ? `${a.student.firstName} ${a.student.lastName ?? ""}`.trim()
      : `Student ${a.studentId}`;
    if (!byStudent[key]) byStudent[key] = { id:key, name, school: a.student?.school?.name ?? "—", attempts:[] };
    byStudent[key].attempts.push(a);
  });

  let students = Object.values(byStudent);

  if (search) {
    students = students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.school.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (filterQuiz !== "all") {
    students = students.filter(s => s.attempts.some(a => a.quizId === filterQuiz));
  }

  students = [...students].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "score") {
      const avgA = a.attempts.reduce((s,x)=>s+x.percentage,0)/a.attempts.length;
      const avgB = b.attempts.reduce((s,x)=>s+x.percentage,0)/b.attempts.length;
      return avgB - avgA;
    }
    const latestA = Math.max(...a.attempts.map(x=>new Date(x.completedAt)));
    const latestB = Math.max(...b.attempts.map(x=>new Date(x.completedAt)));
    return latestB - latestA;
  });

  const totalAttempts  = attempts.length;
  const avgScore       = totalAttempts > 0 ? Math.round(attempts.reduce((s,a)=>s+a.percentage,0)/totalAttempts) : 0;
  const uniqueStudents = Object.keys(byStudent).length;

  const subjectStats = {};
  attempts.forEach(a => {
    if (!a.subject) return;
    if (!subjectStats[a.subject]) subjectStats[a.subject] = { total:0, sum:0 };
    subjectStats[a.subject].total++;
    subjectStats[a.subject].sum += a.percentage;
  });

  const formatDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "—";

  if (loading) return (
    <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-[#161b22] rounded-lg animate-pulse"/>)}</div>
  );

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Students Attempted", value: uniqueStudents,     icon: <FiUsers size={20} className="text-white" /> },
          { label:"Class Average",       value: `${avgScore}%`,    icon: <IoStatsChart size={20} className="text-white" /> },
          { label:"Total Attempts",      value: totalAttempts,     icon: <FaRegFileAlt size={20} className="text-white" /> },
          { label:"Quizzes Created",     value: quizzes.length,    icon: <MdOutlineQuiz size={20} className="text-white" /> },
        ].map((s,i) => (
          <div key={i} className="bg-[#161b22] border border-[#21262d] p-4 rounded-lg">
            <div className="mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white">{s.label}</div>
          </div>
        ))}
      </div>

      {Object.keys(subjectStats).length > 0 && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold mb-4 text-white">Class Performance by Subject</h3>
          <div className="space-y-3">
            {Object.entries(subjectStats)
              .sort((a,b) => b[1].sum/b[1].total - a[1].sum/a[1].total)
              .map(([sub, data]) => {
                const avg   = Math.round(data.sum / data.total);
                const color = SUBJECT_COLORS[sub] || "#2ea043";
                return (
                  <div key={sub}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold" style={{color}}>{sub}</span>
                      <span className="text-white">{data.total} attempt{data.total!==1?"s":""} · <span className="text-white font-bold">{avg}% avg</span></span>
                    </div>
                    <ProgressBar value={avg} color={color}/>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" size={14} />
          <input type="text" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 border border-[#21262d] bg-[#161b22] text-white rounded-lg px-4 py-2 text-sm focus:border-[#2ea043] outline-none"/>
        </div>
        <select value={filterQuiz} onChange={e=>setFilterQuiz(e.target.value)}
          className="border border-[#21262d] bg-[#161b22] text-white rounded-lg px-3 py-2 text-sm focus:border-[#2ea043] outline-none">
          <option value="all">All My Quizzes</option>
          {quizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          className="border border-[#21262d] bg-[#161b22] text-white rounded-lg px-3 py-2 text-sm focus:border-[#2ea043] outline-none">
          <option value="recent">Most Recent</option>
          <option value="score">Highest Score</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <div className="text-xs text-white mb-3">{students.length} student{students.length!==1?"s":""} found</div>

      {students.length === 0 ? (
        <div className="text-center py-16 text-white">
          <FiUsers size={48} className="mx-auto mb-3 text-white opacity-60" />
          <p className="text-sm">
            {totalAttempts === 0
              ? "No students have attempted your quizzes yet."
              : "No students match the current filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map(student => {
            const avg        = Math.round(student.attempts.reduce((s,a)=>s+a.percentage,0)/student.attempts.length);
            const isExpanded = expandedStudent === student.id;
            const bySubject  = {};
            student.attempts.forEach(a => {
              if (!bySubject[a.subject]) bySubject[a.subject] = [];
              bySubject[a.subject].push(a);
            });
            const latest = student.attempts[0];

            return (
              <div key={student.id} className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden hover:border-[#2ea043] transition">
                <button onClick={() => setExpanded(isExpanded ? null : student.id)} className="w-full p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-white">{student.name}</span>
                      {student.school !== "—" && (
                        <span className="ml-2 text-xs text-white">· {student.school}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white">{student.attempts.length} attempt{student.attempts.length!==1?"s":""}</span>
                      <span className="font-bold text-lg" style={{color:avg>=75?"#2ea043":avg>=50?"#e3b341":"#da3633"}}>{avg}%</span>
                      {isExpanded ? <FiChevronUp size={16} className="text-white" /> : <FiChevronDown size={16} className="text-white" />}
                    </div>
                  </div>
                  <ProgressBar value={avg}/>
                  {latest && (
                    <div className="text-xs text-white mt-1">
                      Last: {latest.subject} — {latest.topic} ({latest.percentage}%) · {formatDate(latest.completedAt)}
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-[#21262d] p-4 bg-[#0d1117]">
                    <h4 className="text-xs font-bold text-white mb-3">Subject Breakdown</h4>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {Object.entries(bySubject).map(([sub, subAttempts]) => {
                        const subAvg = Math.round(subAttempts.reduce((s,a)=>s+a.percentage,0)/subAttempts.length);
                        const color  = SUBJECT_COLORS[sub] || "#2ea043";
                        return (
                          <div key={sub} className="bg-[#161b22] rounded-lg p-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold" style={{color}}>{sub}</span>
                              <span className="text-white font-bold">{subAvg}%</span>
                            </div>
                            <ProgressBar value={subAvg} color={color}/>
                            <div className="text-xs text-white mt-1">{subAttempts.length} attempt{subAttempts.length!==1?"s":""}</div>
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="text-xs font-bold text-white mb-2">Recent Attempts</h4>
                    <div className="space-y-1.5">
                      {student.attempts.slice(0,8).map((a,i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-[#161b22]">
                          <div>
                            <span className="text-white font-medium">{a.subject}</span>
                            {a.topic && <span className="text-white"> — {a.topic}</span>}
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                              style={{backgroundColor:a.source==="AI"?"#1a2a3a":"#1a3a2a",color:a.source==="AI"?"#58a6ff":"#2ea043"}}>
                              {a.source==="AI" ? <FiRefreshCw size={10} className="inline mr-0.5" /> : <FaChalkboardTeacher size={10} className="inline mr-0.5" />}
                              {a.source==="AI" ? "AI" : "Teacher"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{formatDate(a.completedAt)}</span>
                            <span className="font-bold" style={{color:a.percentage>=75?"#2ea043":a.percentage>=50?"#e3b341":"#da3633"}}>
                              {a.score}/{a.total} ({a.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Question Card Component
function QuestionCard({ q, index, onChange, onRemove, canRemove }) {
  const updateOption = (i, val) => {
    const opts = [...q.options]; opts[i] = val;
    onChange({ ...q, options: opts });
  };
  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-5 mb-4 hover:border-[#2ea043] transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white bg-[#1a3a2a] px-2 py-0.5 rounded">Q{index+1}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-xs text-[#f85149] hover:text-[#da3633] flex items-center gap-1">
            <FiTrash2 size={12} /> Remove
          </button>
        )}
      </div>
      <textarea value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
        placeholder="Enter your question here..." rows={2}
        className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043] placeholder-white resize-none mb-4"/>
      <p className="text-xs text-white mb-2">Click the circle to mark correct answer</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => onChange({ ...q, answer: i })}
              className="flex-shrink-0 w-5 h-5 rounded-full border-2 transition flex items-center justify-center"
              style={{ borderColor:q.answer===i?"#2ea043":"#30363d", backgroundColor:q.answer===i?"#2ea043":"transparent" }}>
              {q.answer===i && <FiCheckCircle size={12} className="text-white" />}
            </button>
            <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65+i)}`}
              className="flex-1 bg-[#161b22] border text-white rounded-md px-3 py-1.5 text-sm focus:outline-none placeholder-white transition"
              style={{ borderColor:q.answer===i?"#2ea043":"#21262d" }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// Saved Quiz Card Component
function SavedQuizCard({ quiz, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const modeColor = quiz.mode==="online"
    ? { bg:"#1a2a3a", color:"#58a6ff" }
    : { bg:"#2a1a3a", color:"#a371f7" };
  const formatDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden hover:border-[#2ea043] transition mb-4">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded capitalize flex items-center gap-1"
              style={{backgroundColor:modeColor.bg,color:modeColor.color}}>
              {quiz.mode==="online" ? <FiUpload size={10} /> : <FiDownload size={10} />}
              {quiz.mode==="online" ? "Online" : "Offline"}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1a3a2a] text-white">{quiz.subject}</span>
            <span className="text-xs text-white px-2 py-0.5 rounded border border-[#21262d]">{quiz.form}</span>
          </div>
          <button onClick={() => onDelete(quiz.id)} className="text-xs text-[#f85149] hover:text-[#da3633] ml-2 flex-shrink-0 flex items-center gap-1">
            <FiTrash2 size={12} /> Delete
          </button>
        </div>
        <h3 className="font-semibold text-white mb-1">{quiz.title}</h3>
        {quiz.description && <p className="text-xs text-white mb-3">{quiz.description}</p>}
        <div className="flex gap-4 text-xs text-white mb-4">
          <span><MdOutlineQuiz size={12} className="inline mr-1" /> {quiz.questions?.length ?? 0} questions</span>
          <span><FiClock size={12} className="inline mr-1" /> {quiz.duration}</span>
          <span><FiCalendar size={12} className="inline mr-1" /> {formatDate(quiz.createdAt)}</span>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="bg-[#21262d] border border-[#30363d] text-white text-xs font-semibold px-3 py-1.5 rounded hover:border-[#2ea043] transition flex items-center gap-1">
          {expanded ? <FiEyeOff size={12} /> : <FiEye size={12} />}
          {expanded ? "Hide" : "Preview"}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[#21262d] px-5 py-4 bg-[#0d1117]">
          {(quiz.questions ?? []).map((q, i) => (
            <div key={q.id ?? i} className="mb-4">
              <p className="text-sm text-white font-semibold mb-2">
                Q{i+1}. {q.text || <span className="text-white italic">No question text</span>}
              </p>
              <div className="grid grid-cols-2 gap-1 pl-3">
                {q.options.map((opt, oi) => (
                  <p key={oi} className="text-xs px-2 py-1 rounded"
                    style={{ color:q.answer===oi?"#2ea043":"white", backgroundColor:q.answer===oi?"#1a3a2a":"transparent", fontWeight:q.answer===oi?700:400 }}>
                    {String.fromCharCode(65+oi)}. {opt || "—"}{q.answer===oi && <FiCheckCircle size={10} className="inline ml-1" />}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tab Button Component
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="flex-1 py-3 text-sm font-semibold rounded-md transition"
      style={{ backgroundColor:active?"#2ea043":"#161b22", color:active?"#fff":"white", border:`1px solid ${active?"#2ea043":"#21262d"}` }}>
      {children}
    </button>
  );
}

// Main CreateQuiz Page Component
export default function CreateQuiz() {
  const [mode, setMode]           = useState("online");
  const [quiz, setQuiz]           = useState(blankQuiz());
  const [savedQuizzes, setSaved]  = useState([]);
  const [toast, setToast]         = useState(null);
  const [view, setView]           = useState("create");
  const [saving, setSaving]       = useState(false);
  const [loadingList, setLoading] = useState(false);
  const [schools, setSchools]     = useState([]);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "progress") setView("progress");
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_BASE}/school`, { headers: headers() });
        const data = await res.json();
        setSchools(Array.isArray(data) ? data : []);
      } catch { setSchools([]); }
    };
    fetchSchools();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/quizzes/mine`, { headers: headers() });
      if (res.ok) setSaved(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadQuizzes(); }, []);

  const updateQuestion = (id, updated) =>
    setQuiz(q => ({ ...q, questions: q.questions.map(qq => qq.id===id ? updated : qq) }));
  const addQuestion    = () => setQuiz(q => ({ ...q, questions: [...q.questions, blankQuestion()] }));
  const removeQuestion = id => setQuiz(q => ({ ...q, questions: q.questions.filter(qq => qq.id!==id) }));

  const handleSave = async () => {
    if (!quiz.title.trim())                                       { showToast("Please enter a quiz title.", "error"); return; }
    if (quiz.questions.some(q => !q.text.trim()))                 { showToast("All questions must have text.", "error"); return; }
    if (quiz.questions.some(q => q.options.some(o => !o.trim()))) { showToast("Please fill in all answer options.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/quizzes`, {
        method:"POST", headers: headers(),
        body: JSON.stringify({ ...quiz, mode, status:"published" }),
      });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d?.message ?? "Failed to save quiz"); }
      const saved = await res.json();
      setSaved(prev => [saved, ...prev]);
      setQuiz(blankQuiz());
      showToast(`Quiz "${saved.title}" saved successfully!`);
      setView("saved");
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const deleteQuiz = async id => {
    try {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, { method:"DELETE", headers:headers() });
      if (!res.ok) throw new Error("Failed to delete quiz");
      setSaved(prev => prev.filter(q => q.id !== id));
      showToast("Quiz deleted.");
    } catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2"
          style={{ backgroundColor:toast.type==="error"?"#3d1a1a":"#1a3a2a", color:toast.type==="error"?"#f85149":"#2ea043", border:`1px solid ${toast.type==="error"?"#f85149":"#2ea043"}` }}>
          {toast.type==="error" ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4">

        <section className="bg-[#1a3a2a] border border-[#2ea043] p-8 rounded-lg mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <FiEdit size={24} className="text-white" />
              Quiz Management
            </h1>
            <p className="text-white text-sm">Build quizzes and track student progress.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { key:"create",   label:"Create", icon: <FiEdit size={14} /> },
              { key:"saved",    label:`My Quizzes${savedQuizzes.length>0?" ("+savedQuizzes.length+")":""}`, icon: <MdOutlineQuiz size={14} /> },
              { key:"progress", label:"Student Progress", icon: <BiTrendingUp size={14} /> },
            ].map(({ key, label, icon }) => (
              <button key={key} onClick={() => { setView(key); if(key==="saved") loadQuizzes(); }}
                className="text-sm font-semibold px-4 py-2 rounded-md transition flex items-center gap-2"
                style={{ backgroundColor:view===key?"#2ea043":"#21262d", color:"white", border:`1px solid ${view===key?"#2ea043":"#30363d"}` }}>
                {icon}
                {label}
              </button>
            ))}
          </div>
        </section>

        {view === "create" && (
          <>
            <div className="flex gap-3 mb-6">
              <TabBtn active={mode==="online"}  onClick={() => setMode("online")}>
                <FiUpload size={14} className="inline mr-1" /> Online Quiz
              </TabBtn>
              <TabBtn active={mode==="offline"} onClick={() => setMode("offline")}>
                <FiDownload size={14} className="inline mr-1" /> Offline / Printable Quiz
              </TabBtn>
            </div>

            <div className="text-xs px-4 py-3 rounded-md mb-6 border flex items-center gap-2"
              style={{ backgroundColor:mode==="online"?"#1a2a3a":"#2a1a3a", borderColor:mode==="online"?"#58a6ff":"#a371f7", color:mode==="online"?"#58a6ff":"#a371f7" }}>
              {mode==="online" ? <FiUpload size={12} /> : <FiDownload size={12} />}
              {mode==="online" ? "Online quizzes are taken digitally via a shared link." : "Offline quizzes can be downloaded as PDF and printed for class."}
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 mb-5">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                <MdOutlineDescription size={16} className="text-white" />
                Quiz Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white mb-1">Quiz Title *</label>
                  <input type="text" value={quiz.title} onChange={e => setQuiz(q => ({ ...q, title: e.target.value }))}
                    placeholder="e.g. Cell Biology Quiz — Week 3"
                    className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043] placeholder-white"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label:"Subject",      key:"subject",  opts:SUBJECTS, icon: <FiBook size={12} /> },
                    { label:"Form / Class", key:"form",     opts:FORMS, icon: <FaUserGraduate size={12} /> },
                    { label:"Duration",     key:"duration", opts:DURATIONS, icon: <FiClock size={12} /> },
                  ].map(({ label, key, opts, icon }) => (
                    <div key={key}>
                      <label className="block text-xs text-white mb-1 flex items-center gap-1">{icon} {label}</label>
                      <select value={quiz[key]} onChange={e => setQuiz(q => ({ ...q, [key]: e.target.value }))}
                        className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white mb-1 flex items-center gap-1">
                      <FiEye size={12} /> Visibility
                    </label>
                    <select value={quiz.visibility ?? "PUBLIC"} onChange={e => setQuiz(q => ({ ...q, visibility: e.target.value }))}
                      className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                      <option value="PUBLIC">Public (All Students)</option>
                      <option value="PRIVATE">Private (School Only)</option>
                    </select>
                  </div>
                  {quiz.visibility === "PRIVATE" && (
                    <div>
                      <label className="block text-xs text-white mb-1 flex items-center gap-1">
                        <MdOutlineSchool size={12} /> School
                      </label>
                      <select value={quiz.schoolId} onChange={e => setQuiz(q => ({ ...q, schoolId: e.target.value }))}
                        className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                        <option value="">Select school</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-white mb-1">Description (optional)</label>
                  <textarea value={quiz.description} onChange={e => setQuiz(q => ({ ...q, description: e.target.value }))}
                    placeholder="Brief instructions or topic overview..." rows={2}
                    className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043] placeholder-white resize-none"/>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <MdOutlineQuiz size={16} className="text-white" />
                  Questions ({quiz.questions.length})
                </h2>
                <button onClick={addQuestion}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-white hover:border-[#2ea043] transition flex items-center gap-1">
                  <FiPlus size={12} /> Add Question
                </button>
              </div>
              {quiz.questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i}
                  onChange={updated => updateQuestion(q.id, updated)}
                  onRemove={() => removeQuestion(q.id)}
                  canRemove={quiz.questions.length > 1}/>
              ))}
              <button onClick={addQuestion}
                className="w-full border-2 border-dashed border-[#21262d] text-white hover:border-[#2ea043] hover:text-[#2ea043] rounded-lg py-4 text-sm font-semibold transition flex items-center justify-center gap-2">
                <FiPlus size={16} /> Add Another Question
              </button>
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-white">
                <span className="text-white font-semibold">{quiz.questions.length}</span> question{quiz.questions.length!==1?"s":""} ·
                <span className="text-white font-semibold ml-1">{quiz.duration}</span> ·
                <span className="font-semibold ml-1" style={{color:mode==="online"?"#58a6ff":"#a371f7"}}>
                  {mode==="online" ? <FiUpload size={12} className="inline mr-1" /> : <FiDownload size={12} className="inline mr-1" />}
                  {mode==="online" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setQuiz(blankQuiz())}
                  className="text-sm font-semibold px-4 py-2 rounded-md bg-[#21262d] border border-[#30363d] text-white hover:border-[#6e7681] transition flex items-center gap-1">
                  <FiRefreshCw size={14} /> Reset
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="text-sm font-semibold px-6 py-2 rounded-md bg-[#2ea043] text-white hover:bg-[#3fb950] transition disabled:opacity-50 flex items-center gap-1">
                  <FiSave size={14} /> {saving ? "Saving..." : (mode==="online" ? "Save & Publish" : "Save & Export")}
                </button>
              </div>
            </div>
          </>
        )}

        {view === "saved" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MdOutlineQuiz size={22} className="text-white" />
                My Quizzes <span className="text-sm text-white font-normal">({savedQuizzes.length} total)</span>
              </h2>
              <button onClick={() => setView("create")}
                className="text-sm font-semibold px-4 py-2 rounded-md bg-[#2ea043] text-white hover:bg-[#3fb950] transition flex items-center gap-1">
                <FiPlus size={14} /> New Quiz
              </button>
            </div>
            {loadingList ? (
              <div className="text-center py-12 text-white">Loading quizzes...</div>
            ) : savedQuizzes.length === 0 ? (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-16 text-center text-white">
                <MdOutlineQuiz size={48} className="mx-auto mb-3 text-white opacity-60" />
                <p className="text-sm mb-4">No quizzes created yet.</p>
                <button onClick={() => setView("create")}
                  className="text-sm font-semibold px-5 py-2 rounded-md bg-[#2ea043] text-white hover:bg-[#3fb950] transition flex items-center gap-1 mx-auto">
                  <FiPlus size={14} /> Create Your First Quiz
                </button>
              </div>
            ) : (
              savedQuizzes.map(q => <SavedQuizCard key={q.id} quiz={q} onDelete={deleteQuiz}/>)
            )}
          </>
        )}

        {view === "progress" && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <BiTrendingUp size={22} className="text-white" />
                Student Progress
              </h2>
              <p className="text-sm text-white">Track performance across quizzes your students have taken.</p>
            </div>
            <StudentProgressPanel quizzes={savedQuizzes}/>
          </>
        )}

      </main>
    </div>
  );
}