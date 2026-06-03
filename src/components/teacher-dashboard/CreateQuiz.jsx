import { useState, useEffect } from "react";
import { 
  FiBook, FiEdit, FiSave, FiTrash2, FiPlus, FiEye, FiEyeOff, 
  FiDownload, FiUpload, FiUsers, FiBarChart2, FiCheckCircle,
  FiXCircle, FiClock, FiCalendar, FiChevronDown, FiChevronUp,
  FiSearch, FiFilter, FiArrowLeft, FiArrowRight, FiRefreshCw,
  FiGrid, FiList, FiAward
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
  Biology: "#10b981", Mathematics: "#3b82f6", Chemistry: "#8b5cf6",
  Physics: "#f59e0b", English: "#fbbf24", Geography: "#06b6d4",
  History: "#ef4444", "Civic Education": "#34d399", "Computer Studies": "#60a5fa",
};

const blankQuestion = () => ({ id: `${Date.now()}-${Math.random()}`, text: "", options: ["","","",""], answer: 0 });
const blankQuiz     = () => ({ title:"", subject:"Biology", form:"Form 1", duration:"30 min", description:"", visibility:"PUBLIC", schoolId:"", questions:[blankQuestion()] });

const getToken   = () => localStorage.getItem("accessToken");
const getHeaders = () => ({ "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) });

function ProgressBar({ value, color = "#10b981" }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 80); return () => clearTimeout(t); }, [value]);
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-emerald-400"
        style={{ width: `${width}%` }}/>
    </div>
  );
}

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
        const res = await fetch(`${API_BASE}/quizzes/teacher/attempts`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setAttempts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading attempts:", err);
      } finally {
        setLoading(false);
      }
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
    const latestA = Math.max(...a.attempts.map(x=>new Date(x.completedAt).getTime()));
    const latestB = Math.max(...b.attempts.map(x=>new Date(x.completedAt).getTime()));
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
    <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse"/>)}</div>
  );

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Students Attempted", value: uniqueStudents, icon: <FiUsers size={20} />, gradient: "from-blue-500 to-cyan-500" },
          { label:"Class Average", value: `${avgScore}%`, icon: <IoStatsChart size={20} />, gradient: "from-emerald-500 to-teal-500" },
          { label:"Total Attempts", value: totalAttempts, icon: <FaRegFileAlt size={20} />, gradient: "from-purple-500 to-pink-500" },
          { label:"Quizzes Created", value: quizzes.length, icon: <MdOutlineQuiz size={20} />, gradient: "from-orange-500 to-amber-500" },
        ].map((s,i) => (
          <div key={i} className="relative overflow-hidden bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
            <div className="text-gray-600 dark:text-gray-300 mb-2">{s.icon}</div>
            <div className={`text-3xl font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>{s.value}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {Object.keys(subjectStats).length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">📊 Performance by Subject</h3>
          <div className="space-y-3">
            {Object.entries(subjectStats)
              .sort((a,b) => (b[1].sum/b[1].total) - (a[1].sum/a[1].total))
              .map(([sub, data]) => {
                const avg   = Math.round(data.sum / data.total);
                const color = SUBJECT_COLORS[sub] || "#10b981";
                return (
                  <div key={sub}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium" style={{color}}>{sub}</span>
                      <span className="text-gray-600 dark:text-gray-400">{data.total} attempt{data.total!==1?"s":""} · <span className="font-bold" style={{color}}>{avg}% avg</span></span>
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
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
          <input type="text" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 border border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-800/50 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"/>
        </div>
        <select value={filterQuiz} onChange={e=>setFilterQuiz(e.target.value)}
          className="border border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-800/50 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
          <option value="all">All Quizzes</option>
          {quizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          className="border border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-800/50 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
          <option value="recent">Most Recent</option>
          <option value="score">Highest Score</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">{students.length} student{students.length!==1?"s":""} found</div>

      {students.length === 0 ? (
        <div className="text-center py-16">
          <FiUsers size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <div key={student.id} className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
                <button onClick={() => setExpanded(isExpanded ? null : student.id)} className="w-full p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</span>
                      {student.school !== "—" && (
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">· {student.school}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{student.attempts.length} attempt{student.attempts.length!==1?"s":""}</span>
                      <span className="font-bold text-lg" style={{color:avg>=75?"#10b981":avg>=50?"#fbbf24":"#ef4444"}}>{avg}%</span>
                      {isExpanded ? <FiChevronUp size={16} className="text-gray-500" /> : <FiChevronDown size={16} className="text-gray-500" />}
                    </div>
                  </div>
                  <ProgressBar value={avg}/>
                  {latest && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Last: {latest.subject} — {latest.topic || "Quiz"} ({latest.percentage}%) · {formatDate(latest.completedAt)}
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-white/90 dark:bg-gray-900/50">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-400 mb-3">📚 Subject Breakdown</h4>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {Object.entries(bySubject).map(([sub, subAttempts]) => {
                        const subAvg = Math.round(subAttempts.reduce((s,a)=>s+a.percentage,0)/subAttempts.length);
                        const color  = SUBJECT_COLORS[sub] || "#10b981";
                        return (
                          <div key={sub} className="bg-gray-50/90 dark:bg-gray-800/30 rounded-lg p-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium" style={{color}}>{sub}</span>
                              <span className="text-gray-900 dark:text-gray-100 font-bold">{subAvg}%</span>
                            </div>
                            <ProgressBar value={subAvg} color={color}/>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subAttempts.length} attempt{subAttempts.length!==1?"s":""}</div>
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-400 mb-2">📝 Recent Attempts</h4>
                    <div className="space-y-1.5">
                      {student.attempts.slice(0,8).map((a,i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50/90 dark:bg-gray-800/30">
                          <div>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">{a.subject}</span>
                            {a.topic && <span className="text-gray-600 dark:text-gray-400"> — {a.topic}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">{formatDate(a.completedAt)}</span>
                            <span className="font-bold" style={{color:a.percentage>=75?"#10b981":a.percentage>=50?"#fbbf24":"#ef4444"}}>
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

function QuestionCard({ q, index, onChange, onRemove, canRemove }) {
  const updateOption = (i, val) => {
    const opts = [...q.options]; opts[i] = val;
    onChange({ ...q, options: opts });
  };
  return (
    <div className="bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full">Question {index+1}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <FiTrash2 size={12} /> Remove
          </button>
        )}
      </div>
      <textarea value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
        placeholder="Enter your question here..." rows={2}
        className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 resize-none mb-4"/>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">✓ Click the circle to mark correct answer</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => onChange({ ...q, answer: i })}
              className="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center"
              style={{ borderColor:q.answer===i?"#10b981":"#4b5563", backgroundColor:q.answer===i?"#10b981":"transparent" }}>
              {q.answer===i && <FiCheckCircle size={12} className="text-white" />}
            </button>
            <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65+i)}`}
              className="flex-1 bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-200 focus:outline-none placeholder-gray-500 transition-all"
              style={{ borderColor:q.answer===i?"#10b981":undefined }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedQuizCard({ quiz, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const formatDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";

  // Ensure questions array exists
  const questions = quiz.questions || [];

  return (
    <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 mb-4">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-500 dark:text-blue-200 flex items-center gap-1">
              {quiz.mode==="online" ? <FiUpload size={10} /> : <FiDownload size={10} />}
              {quiz.mode==="online" ? "Online" : "Offline"}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-200">{quiz.subject}</span>
            <span className="text-xs text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">{quiz.form}</span>
          </div>
          <button onClick={() => onDelete(quiz.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
            <FiTrash2 size={12} /> Delete
          </button>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-lg">{quiz.title}</h3>
        {quiz.description && <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{quiz.description}</p>}
        <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1"><MdOutlineQuiz size={12} /> {questions.length} questions</span>
          <span className="flex items-center gap-1"><FiClock size={12} /> {quiz.duration}</span>
          <span className="flex items-center gap-1"><FiCalendar size={12} /> {formatDate(quiz.createdAt)}</span>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
          {expanded ? <FiEyeOff size={12} /> : <FiEye size={12} />}
          {expanded ? "Hide Preview" : "Preview Quiz"}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-gray-200 px-5 py-4 bg-white/90 dark:bg-gray-900/50">
          {(questions).map((q, i) => (
            <div key={q.id ?? i} className="mb-4">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2">
                Q{i+1}. {q.text || <span className="text-gray-500 italic">No question text</span>}
              </p>
              <div className="grid grid-cols-2 gap-1 pl-3">
                {q.options && q.options.map((opt, oi) => (
                  <p key={oi} className="text-xs px-2 py-1 rounded"
                    style={{ color:q.answer===oi?"#10b981":"#374151", backgroundColor:q.answer===oi?"rgba(16,185,129,0.1)":"transparent", fontWeight:q.answer===oi?600:400 }}>
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

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        active 
          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
          : "bg-white/90 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700"
      }`}>
      {children}
    </button>
  );
}

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
    if (params.get("view") === "saved") setView("saved");
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_BASE}/school`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setSchools(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
        setSchools([]);
      }
    };
    fetchSchools();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/quizzes/mine`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Handle both array and paginated responses
        const quizzesArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setSaved(quizzesArray);
      }
    } catch (err) {
      console.error("Error loading quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadQuizzes(); 
  }, []);

  const updateQuestion = (id, updated) =>
    setQuiz(q => ({ ...q, questions: q.questions.map(qq => qq.id === id ? updated : qq) }));
  const addQuestion    = () => setQuiz(q => ({ ...q, questions: [...q.questions, blankQuestion()] }));
  const removeQuestion = id => setQuiz(q => ({ ...q, questions: q.questions.filter(qq => qq.id !== id) }));

  const handleSave = async () => {
    if (!quiz.title.trim())                                       { showToast("Please enter a quiz title.", "error"); return; }
    if (quiz.questions.some(q => !q.text.trim()))                 { showToast("All questions must have text.", "error"); return; }
    if (quiz.questions.some(q => q.options.some(o => !o.trim()))) { showToast("Please fill in all answer options.", "error"); return; }
    
    setSaving(true);
    try {
      const payload = { 
        ...quiz, 
        mode, 
        status: mode === "online" ? "published" : "draft",
        schoolId: quiz.visibility === "PRIVATE" && quiz.schoolId ? quiz.schoolId : undefined
      };
      
      const res = await fetch(`${API_BASE}/quizzes`, {
        method:"POST", 
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) { 
        const d = await res.json().catch(()=>({})); 
        throw new Error(d?.message ?? "Failed to save quiz"); 
      }
      
      const saved = await res.json();
      setSaved(prev => [saved, ...prev]);
      setQuiz(blankQuiz());
      showToast(`✨ Quiz "${saved.title}" saved successfully!`);
      setView("saved");
    } catch (err) { 
      showToast(err.message, "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const deleteQuiz = async id => {
    try {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, { method:"DELETE", headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to delete quiz");
      setSaved(prev => prev.filter(q => q.id !== id));
      showToast("Quiz deleted successfully.");
    } catch (err) { 
      showToast(err.message, "error"); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-200 p-6">
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
            toast.type==="error" 
              ? "bg-red-500/20 border border-red-500/50 text-red-400" 
              : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
          }`}>
            {toast.type==="error" ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
            {toast.msg}
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
                <FiEdit size={20} className="text-white" />
              </div>
              Quiz Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Create engaging quizzes and track student performance in one place</p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-6 bg-white/90 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          {[
            { key:"create", label:"Create Quiz", icon: <FiEdit size={14} /> },
            { key:"saved", label:`My Quizzes (${savedQuizzes.length})`, icon: <MdOutlineQuiz size={14} /> },
            { key:"progress", label:"Student Progress", icon: <BiTrendingUp size={14} /> },
          ].map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setView(key); if(key==="saved") loadQuizzes(); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                view===key 
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                  : "bg-white/90 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              }`}>
              {icon}
              {label}
            </button>
          ))}
        </div>

        {view === "create" && (
          <>
            <div className="flex gap-3 mb-6 bg-white/90 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <TabBtn active={mode==="online"}  onClick={() => setMode("online")}>
                <FiUpload size={14} className="inline mr-1" /> Online Quiz
              </TabBtn>
              <TabBtn active={mode==="offline"} onClick={() => setMode("offline")}>
                <FiDownload size={14} className="inline mr-1" /> Offline Quiz
              </TabBtn>
            </div>

            <div className={`rounded-xl mb-6 p-4 flex items-center gap-3 backdrop-blur-sm ${
              mode==="online" 
                ? "bg-blue-500/10 border border-blue-500/30 text-blue-400" 
                : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
            }`}>
              {mode==="online" ? <FiUpload size={18} /> : <FiDownload size={18} />}
              <span className="text-sm">
                {mode==="online" 
                  ? "📱 Online quizzes are taken digitally via a shared link — instant results and analytics" 
                  : "📄 Offline quizzes can be downloaded as PDF and printed for classroom use"}
              </span>
            </div>

            {/* Quiz Details Card */}
            <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <MdOutlineDescription size={14} className="text-emerald-400" />
                </div>
                Quiz Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quiz Title *</label>
                  <input type="text" value={quiz.title} onChange={e => setQuiz(q => ({ ...q, title: e.target.value }))}
                    placeholder="e.g. Cell Biology Quiz — Week 3"
                    className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label:"Subject", key:"subject", opts:SUBJECTS, icon: <FiBook size={12} /> },
                    { label:"Form / Class", key:"form", opts:FORMS, icon: <FaUserGraduate size={12} /> },
                    { label:"Duration", key:"duration", opts:DURATIONS, icon: <FiClock size={12} /> },
                  ].map(({ label, key, opts, icon }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">{icon} {label}</label>
                      <select value={quiz[key]} onChange={e => setQuiz(q => ({ ...q, [key]: e.target.value }))}
                        className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FiEye size={12} /> Visibility
                    </label>
                    <select value={quiz.visibility ?? "PUBLIC"} onChange={e => setQuiz(q => ({ ...q, visibility: e.target.value }))}
                      className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                      <option value="PUBLIC">🌍 Public (All Students)</option>
                      <option value="PRIVATE">🔒 Private (School Only)</option>
                    </select>
                  </div>
                  {quiz.visibility === "PRIVATE" && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <MdOutlineSchool size={12} /> School
                      </label>
                      <select value={quiz.schoolId} onChange={e => setQuiz(q => ({ ...q, schoolId: e.target.value }))}
                        className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                        <option value="">Select school</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Description (optional)</label>
                  <textarea value={quiz.description} onChange={e => setQuiz(q => ({ ...q, description: e.target.value }))}
                    placeholder="Brief instructions or topic overview..."
                    rows={2}
                    className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 resize-none"/>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <MdOutlineQuiz size={14} className="text-emerald-400" />
                  </div>
                  Questions ({quiz.questions.length})
                </h2>
                <button onClick={addQuestion}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-all flex items-center gap-2">
                  <FiPlus size={14} /> Add Question
                </button>
              </div>
              {quiz.questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i}
                  onChange={updated => updateQuestion(q.id, updated)}
                  onRemove={() => removeQuestion(q.id)}
                  canRemove={quiz.questions.length > 1}/>
              ))}
              <button onClick={addQuestion}
                className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl py-4 text-sm font-medium transition-all flex items-center justify-center gap-2">
                <FiPlus size={16} /> Add Another Question
              </button>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{quiz.questions.length} question{quiz.questions.length!==1?"s":""}</span>
                <span className="text-gray-600 dark:text-gray-400">{quiz.duration}</span>
                <span className={`font-medium ${mode==="online" ? "text-blue-400" : "text-purple-400"}`}>
                  {mode==="online" ? "📱 Online" : "📄 Offline"}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setQuiz(blankQuiz())}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-all flex items-center gap-2">
                  <FiRefreshCw size={14} /> Reset
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="text-sm font-medium px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                  <FiSave size={14} /> {saving ? "Saving..." : (mode==="online" ? "Save & Publish" : "Save & Export")}
                </button>
              </div>
            </div>
          </>
        )}

        {view === "saved" && (
          <>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MdOutlineQuiz size={24} className="text-emerald-400" />
                  My Quizzes
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{savedQuizzes.length} quizzes created</p>
              </div>
              <button onClick={() => setView("create")}
                className="text-sm font-medium px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <FiPlus size={14} /> Create New Quiz
              </button>
            </div>
            {loadingList ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>
              </div>
            ) : savedQuizzes.length === 0 ? (
              <div className="bg-white/90 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdOutlineQuiz size={40} className="text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">No quizzes created yet</p>
                <button onClick={() => setView("create")}
                  className="text-sm font-medium px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-2 mx-auto">
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
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <BiTrendingUp size={24} className="text-emerald-400" />
                Student Progress Dashboard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track performance across all quizzes your students have taken</p>
            </div>
            <StudentProgressPanel quizzes={savedQuizzes}/>
          </>
        )}

      </main>
    </div>
  );
}