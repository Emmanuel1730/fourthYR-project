import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiCheck, FiAlertCircle, FiInfo, FiTrendingUp, FiTrendingDown,
  FiTrash2, FiPlay, FiArrowLeft, FiLoader, FiChevronRight,
  FiX, FiEye, FiAward, FiStar, FiRefreshCw, FiSearch,
} from "react-icons/fi";
import {
  GiMicroscope, GiChemicalDrop, GiAtom, GiBrain, GiTeacher,
} from "react-icons/gi";
import {
  MdCalculate, MdMenuBook, MdHistoryEdu, MdPublic, MdQuiz,
  MdOutlineQuiz, MdSave, MdBarChart, MdHistory, MdSchool, MdScience,
} from "react-icons/md";
import { IoWarningOutline, IoFlash, IoPrintOutline, IoRocket } from "react-icons/io5";
import { FaRobot, FaSave, FaChartLine, FaHistory, FaBrain, FaTrophy, FaRegCheckCircle } from "react-icons/fa";
import { SiLevelsdotfyi } from "react-icons/si";
import { BiBookOpen, BiTrendingUp, BiTrendingDown, BiBrain } from "react-icons/bi";
import { TbProgressCheck } from "react-icons/tb";
import { VscDebugRestart } from "react-icons/vsc";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── All existing data constants (unchanged) ───────────────────────────────────
const SUBJECT_TOPICS = {
  Biology: ["Cell Structure and Function","Cell Division (Mitosis and Meiosis)","Photosynthesis","Respiration","Transport in Plants","Transport in Animals (Circulatory System)","Nutrition in Plants","Nutrition in Animals (Human Digestive System)","Excretion in Humans","Nervous System","Endocrine System","Reproduction in Plants","Reproduction in Humans","Genetics and Heredity","Evolution and Natural Selection","Ecology and Ecosystems","Classification of Living Things","Disease and Immunity","Biotechnology","Environmental Issues in Malawi"],
  Mathematics: ["Number and Numeration","Fractions, Decimals and Percentages","Ratio and Proportion","Algebra: Simplification and Expansion","Linear Equations","Simultaneous Equations","Quadratic Equations","Inequalities","Functions and Graphs","Sequences and Series","Geometry: Lines and Angles","Triangles and Congruence","Circle Theorems","Mensuration: Area and Perimeter","Mensuration: Volume and Surface Area","Trigonometry","Vectors","Matrices","Statistics: Mean, Median and Mode","Probability"],
  Chemistry: ["Atomic Structure","The Periodic Table","Chemical Bonding (Ionic and Covalent)","States of Matter","Chemical Reactions and Equations","Acids, Bases and Salts","Oxidation and Reduction (Redox)","Electrochemistry","Rates of Reaction","Energy Changes in Reactions","The Mole Concept","Gases and Gas Laws","Water and Solutions","Metals and Non-Metals","Carbon and Its Compounds","Organic Chemistry: Alkanes and Alkenes","Organic Chemistry: Alcohols and Acids","Polymers and Plastics","Environmental Chemistry","Industrial Chemistry in Malawi"],
  Physics: ["Measurements and Units","Motion: Speed, Velocity and Acceleration","Newton's Laws of Motion","Forces and Equilibrium","Work, Energy and Power","Momentum and Collisions","Pressure in Solids, Liquids and Gases","Heat and Temperature","Thermal Expansion","Transfer of Heat","Waves: Properties and Types","Sound Waves","Light: Reflection","Light: Refraction and Lenses","Electricity: Current and Circuits","Ohm's Law and Resistance","Magnetism and Electromagnetism","Electromagnetic Induction","Radioactivity","Electronics and Logic Gates"],
  English: ["Reading Comprehension","Summary Writing","Essay Writing: Argumentative","Essay Writing: Descriptive","Essay Writing: Narrative","Letter Writing: Formal","Letter Writing: Informal","Report Writing","Grammar: Parts of Speech","Grammar: Tenses","Grammar: Active and Passive Voice","Grammar: Direct and Indirect Speech","Vocabulary and Word Formation","Punctuation and Spelling","Poetry: Analysis and Appreciation","Prose: Novel Study","Drama: Play Study","Oral Communication Skills","Debate and Discussion","Literature in Malawian Context"],
  Geography: ["Map Reading and Interpretation","Weather and Climate","Climate Regions of Malawi","Malawi: Physical Features","Malawi: Lake Malawi","Malawi: Rivers and Water Resources","Population Distribution in Malawi","Rural and Urban Settlements","Agriculture in Malawi","Cash Crops: Tobacco, Tea and Sugar","Fishing Industry in Malawi","Mining and Natural Resources","Transport and Communication in Malawi","Trade and Economic Development","Africa: Physical Geography","Africa: Political Geography","Plate Tectonics and Earthquakes","Volcanoes","Soil Types and Erosion","Environmental Conservation in Malawi"],
  History: ["Early Peoples of Malawi","Migration and Settlement of Bantu People","Maravi Kingdom","Ngoni Migration and Settlement","Yao and Arab Slave Trade","European Exploration of Africa","Livingstone and Missionaries in Malawi","British Central Africa Protectorate","Colonial Administration in Nyasaland","Resistance to Colonial Rule","John Chilembwe Rising 1915","Nyasaland African Congress","Federation of Rhodesia and Nyasaland","Malawi Congress Party and Independence","Dr Hastings Kamuzu Banda and Independence 1964","One Party State in Malawi","Multiparty Democracy 1993","Post-Independence Development in Malawi","Africa: Colonisation and Independence","World War I and World War II"],
  "Civic Education": ["Citizenship and Responsibilities","Human Rights","Children's Rights in Malawi","The Constitution of Malawi","Branches of Government","The Executive: President and Cabinet","The Legislature: Parliament of Malawi","The Judiciary and Rule of Law","Local Government in Malawi","Elections and Democracy","Political Parties in Malawi","Gender Equality and Equity","HIV and AIDS Awareness","Drug and Substance Abuse","Environmental Rights and Duties","Community Development","Conflict Resolution","National Symbols of Malawi","Regional and International Organisations (AU, SADC, UN)","Corruption and Good Governance"],
  "Computer Studies": ["Introduction to Computers","Computer Hardware Components","Computer Software: System and Application","Operating Systems","File Management","Word Processing (Microsoft Word)","Spreadsheets (Microsoft Excel)","Presentation Software (Microsoft PowerPoint)","Database Concepts","Internet and Email","World Wide Web and Browsers","Computer Networks and Types","Network Security and Cyber Safety","Introduction to Programming","Algorithms and Flowcharts","Basic Programming in Python","HTML and Web Design Basics","Data Representation (Binary and Hexadecimal)","ICT in Society and Development","ICT in Malawi: E-government and Mobile Money"],
};

const LEVELS = ["Form 1", "Form 2", "Form 3", "Form 4"];

const SUBJECT_ICON_MAP = {
  Mathematics:      { Icon: MdCalculate,  color: "#2ea043" },
  Biology:          { Icon: GiMicroscope, color: "#2ea043" },
  Chemistry:        { Icon: GiChemicalDrop, color: "#2ea043" },
  Physics:          { Icon: GiAtom,       color: "#2ea043" },
  English:          { Icon: MdMenuBook,   color: "#2ea043" },
  History:          { Icon: MdHistoryEdu, color: "#2ea043" },
  Geography:        { Icon: MdPublic,     color: "#2ea043" },
  "Civic Education":{ Icon: MdSchool,     color: "#2ea043" },
  "Computer Studies":{ Icon: MdScience,  color: "#2ea043" },
  Other:            { Icon: BiBookOpen,   color: "#2ea043" },
};

const SUBJECT_COLORS = {
  Biology: "#2ea043", Mathematics: "#2ea043", Chemistry: "#2ea043",
  Physics: "#2ea043", English: "#2ea043", Geography: "#2ea043",
  History: "#2ea043", "Civic Education": "#2ea043", "Computer Studies": "#2ea043",
};

function SubjectIcon({ name, size = 20 }) {
  const entry = SUBJECT_ICON_MAP[name] ?? SUBJECT_ICON_MAP["Other"];
  return <entry.Icon size={size} style={{ color: entry.color }} />;
}

const token = () => localStorage.getItem("accessToken");
const authHdr = () => ({ "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

async function logAttempt(payload) {
  try {
    await fetch(`${API_BASE}/quizzes/attempts`, { method: "POST", headers: authHdr(), body: JSON.stringify(payload) });
  } catch {}
}

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

// ── Theme tokens ──────────────────────────────────────────────────────────────
function tc(isDark) {
  return {
    page:       isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100"
                       : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900",
    card:       isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm",
    cardHover:  isDark ? "hover:border-gray-600" : "hover:border-emerald-300 hover:shadow-md",
    inner:      isDark ? "bg-gray-900/60 border-gray-700" : "bg-gray-50 border-gray-200",
    title:      isDark ? "text-gray-100" : "text-gray-800",
    body:       isDark ? "text-gray-300" : "text-gray-600",
    muted:      isDark ? "text-gray-400" : "text-gray-500",
    dimmed:     isDark ? "text-gray-500" : "text-gray-400",
    input:      isDark ? "border-gray-700 bg-gray-900/60 text-gray-200 placeholder-gray-500 focus:border-emerald-500"
                       : "border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-emerald-500",
    select:     isDark ? "border-gray-700 bg-gray-900/60 text-gray-200 focus:border-emerald-500"
                       : "border-gray-300 bg-white text-gray-800 focus:border-emerald-500",
    progressBg: isDark ? "bg-gray-700/50" : "bg-gray-200",
    tabActive:  isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800 shadow-sm",
    tabInactive:isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600",
    badge:      (color) => isDark
                  ? `bg-opacity-20 border border-opacity-30`
                  : `bg-opacity-10 border border-opacity-20`,
    subjectBg:  isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200",
    optionBase: isDark ? "border-gray-700 hover:bg-gray-700/50 text-gray-200" : "border-gray-200 hover:bg-gray-50 text-gray-700",
    optionSel:  isDark ? "border-emerald-500 bg-emerald-500/15 text-gray-100" : "border-emerald-500 bg-emerald-50 text-gray-800",
    optionRight:isDark ? "border-emerald-500 bg-emerald-500/15" : "border-emerald-400 bg-emerald-50",
    optionWrong:isDark ? "border-red-500 bg-red-500/15 opacity-80" : "border-red-400 bg-red-50 opacity-80",
    optionDim:  isDark ? "border-gray-700 opacity-40" : "border-gray-200 opacity-40",
    resultCard: isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-md",
    aiCard:     isDark ? "bg-gray-900/60 border-blue-500/30" : "bg-blue-50 border-blue-200",
    error:      isDark ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-red-50 border-red-200 text-red-600",
    deleteBtn:  isDark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700",
    spinColor:  isDark ? "border-emerald-400" : "border-emerald-600",
  };
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let _showToast = null;

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _showToast = (msg, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    return () => { _showToast = null; };
  }, []);
  if (toasts.length === 0) return null;
  const colors = {
    success: { bg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400", icon: <FiCheck /> },
    error:   { bg: "bg-red-500/10 border-red-500/40 text-red-400",           icon: <IoWarningOutline /> },
    warning: { bg: "bg-amber-500/10 border-amber-500/40 text-amber-400",     icon: <IoFlash /> },
    info:    { bg: "bg-blue-500/10 border-blue-500/40 text-blue-400",        icon: <FiAlertCircle /> },
  };
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const c = colors[t.type] ?? colors.success;
        return (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold max-w-sm border ${c.bg}`}>
            <span className="flex-shrink-0 text-base">{c.icon}</span>
            <span className="leading-snug">{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

function showToast(msg, type = "success") { if (_showToast) _showToast(msg, type); }

// ── ProgressBar (always green) ────────────────────────────────────────────────
function ProgressBar({ value, color = "#2ea043", isDark }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 100); return () => clearTimeout(t); }, [value]);
  const bgClass = isDark ? "bg-gray-700/50" : "bg-gray-200";
  return (
    <div className={`w-full ${bgClass} rounded-full h-2.5 overflow-hidden`}>
      <div className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, backgroundColor: "#2ea043" }} />
    </div>
  );
}

// ── AI Recommendations ────────────────────────────────────────────────────────
function AIRecommendations({ subject, topic, score, total, isDark }) {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = tc(isDark);

  useEffect(() => {
    const go = async () => {
      try {
        const pct = Math.round((score / total) * 100);
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `A secondary school student in Malawi just completed a ${subject} quiz on "${topic}" and scored ${score}/${total} (${pct}%). Give 3 specific, actionable study recommendations to help them improve. Return ONLY a JSON array with exactly 3 objects, each with "tip" (short title, max 6 words) and "detail" (1-2 sentence explanation). No markdown, no extra text.`
            }]
          })
        });
        const data = await res.json();
        const text = data.content?.find(b => b.type === "text")?.text ?? "[]";
        const s = text.indexOf("["), e = text.lastIndexOf("]");
        if (s !== -1 && e !== -1) setRecs(JSON.parse(text.slice(s, e + 1)));
      } catch { setRecs(null); }
      finally { setLoading(false); }
    };
    go();
  }, []);

  if (loading) return (
    <div className={`mt-4 border rounded-xl p-4 animate-pulse ${t.aiCard}`}>
      <div className={`h-3 rounded w-48 mb-3 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className={`h-2 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />)}</div>
    </div>
  );
  if (!recs) return null;

  return (
    <div className={`mt-4 border rounded-xl p-5 ${t.aiCard}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaRobot className="text-blue-400" />
        <span className={`text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>AI Study Recommendations</span>
      </div>
      <div className="space-y-4">
        {recs.map((r, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold shadow">{i + 1}</div>
            <div>
              <p className={`text-sm font-semibold ${t.title}`}>{r.tip}</p>
              <p className={`text-xs mt-0.5 ${t.muted}`}>{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SubjectProgressCard ───────────────────────────────────────────────────────
function SubjectProgressCard({ subject, attempts, onClick, isDark }) {
  const t = tc(isDark);
  const avg   = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;
  const color = "#2ea043";
  const best  = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
  const trend = attempts.length >= 2 ? attempts[0].percentage - attempts[1].percentage : 0;

  return (
    <button onClick={onClick}
      className={`border rounded-2xl p-4 text-left transition-all duration-200 w-full group ${t.card} ${t.cardHover}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SubjectIcon name={subject} size={18} />
          <span className="text-sm font-bold" style={{ color }}>{subject}</span>
        </div>
        <div className="flex items-center gap-1">
          {trend !== 0 && (
            <span className={`text-xs flex items-center gap-0.5 ${trend > 0 ? "text-emerald-500" : "text-red-500"}`}>
              {trend > 0 ? <BiTrendingUp /> : <BiTrendingDown />}{Math.abs(trend)}%
            </span>
          )}
          <span className={`text-xs ${t.muted}`}>{attempts.length} quiz{attempts.length !== 1 ? "zes" : ""}</span>
        </div>
      </div>
      <div className="mb-2"><ProgressBar value={avg} color={color} isDark={isDark} /></div>
      <div className={`flex justify-between text-xs ${t.muted}`}>
        <span>Avg: <span className={`font-bold ${t.title}`}>{avg}%</span></span>
        <span>Best: <span className={`font-bold ${t.title}`}>{best}%</span></span>
      </div>
      <div className="text-xs text-emerald-500 mt-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
        View details <FiChevronRight size={12} />
      </div>
    </button>
  );
}

// ── SubjectDetailModal ────────────────────────────────────────────────────────
function SubjectDetailModal({ subject, attempts, onClose, isDark }) {
  const t     = tc(isDark);
  const color = "#2ea043";
  const sorted = [...attempts].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  const byTopic = {};
  attempts.forEach(a => { if (!byTopic[a.topic]) byTopic[a.topic] = []; byTopic[a.topic].push(a); });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
        onClick={e => e.stopPropagation()}>
        <div className={`p-6 border-b flex items-center justify-between sticky top-0 rounded-t-2xl ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
          <div>
            <div className="flex items-center gap-2">
              <SubjectIcon name={subject} size={24} />
              <h2 className="text-lg font-bold" style={{ color }}>{subject}</h2>
            </div>
            <p className={`text-xs ${t.muted}`}>{attempts.length} attempts total</p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition ${isDark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
            <FiX size={18} />
          </button>
        </div>
        <div className="p-6">
          {sorted.length > 1 && (
            <div className="mb-6">
              <h3 className={`text-sm font-semibold mb-3 ${t.muted}`}>Score History</h3>
              <div className={`flex items-end gap-2 h-24 rounded-xl px-3 py-2 border ${t.inner}`}>
                {sorted.slice(-10).map((a, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm" style={{ height: `${a.percentage * 0.8}%`, backgroundColor: "#2ea043", minHeight: 4 }} />
                    <span className={`text-[10px] ${t.dimmed}`}>{a.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h3 className={`text-sm font-semibold mb-3 ${t.muted}`}>Performance by Topic</h3>
          <div className="space-y-3">
            {Object.entries(byTopic).map(([topic, topicAttempts]) => {
              const avg = Math.round(topicAttempts.reduce((s, a) => s + a.percentage, 0) / topicAttempts.length);
              return (
                <div key={topic}>
                  <div className={`flex justify-between text-xs mb-1`}>
                    <span className={`truncate pr-2 ${t.title}`}>{topic}</span>
                    <span className={`flex-shrink-0 ${t.muted}`}>{avg}% · {topicAttempts.length}x</span>
                  </div>
                  <ProgressBar value={avg} color={color} isDark={isDark} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QuizRunner ────────────────────────────────────────────────────────────────
function QuizRunner({ questions, meta, onDone, source, quizId, isSaved, isDark }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore]     = useState(null);
  const [showRecs, setShowRecs] = useState(false);
  const autoSaveFired = useRef(false);
  const t = tc(isDark);

  const select = (qi, oi) => { if (score !== null) return; setAnswers(a => ({ ...a, [qi]: oi })); };

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      const unanswered = questions.length - Object.keys(answers).length;
      showToast(`Please answer all questions. ${unanswered} question${unanswered > 1 ? "s" : ""} still unanswered.`, "warning");
      return;
    }
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === (q.correct ?? q.answer)) correct++; });
    setScore(correct);
    const pct = Math.round((correct / questions.length) * 100);
    await logAttempt({
      source, quizId: quizId ?? null,
      subject: meta.subject, topic: meta.topic ?? meta.title,
      level: meta.level ?? meta.form,
      score: correct, total: questions.length, percentage: pct,
      answers: Object.values(answers), questions,
    });
    if (source === "AI" && !isSaved && !autoSaveFired.current) {
      autoSaveFired.current = true;
      try {
        const res = await fetch(`${API_BASE}/quizzes/save-ai`, {
          method: "POST", headers: authHdr(),
          body: JSON.stringify({ subject: meta.subject, level: meta.level, topic: meta.topic, questions }),
        });
        if (res.ok) showToast("Quiz saved to your library automatically! Find it in Saved AI.", "info");
      } catch {}
    }
  };

  const answered = Object.keys(answers).length;
  const fillPct  = Math.round((answered / questions.length) * 100);

  const optionStyle = (qi, oi) => {
    if (score === null)
      return answers[qi] === oi ? t.optionSel : t.optionBase;
    const correct = questions[qi].correct ?? questions[qi].answer;
    if (correct === oi) return t.optionRight;
    if (answers[qi] === oi) return t.optionWrong;
    return t.optionDim;
  };

  return (
    <div className="space-y-4">
      <div className={`flex justify-between text-sm mb-2 ${t.muted}`}>
        <div className="flex items-center gap-2">
          <SubjectIcon name={meta.subject} size={16} />
          <span>{meta.subject} · {meta.level ?? meta.form} · {meta.topic ?? meta.title}</span>
        </div>
        <span>{answered} / {questions.length} answered</span>
      </div>
      <div className="mb-4"><ProgressBar value={fillPct} isDark={isDark} /></div>

      {questions.map((q, i) => (
        <div key={i} className={`border rounded-2xl p-6 ${t.card}`}>
          <p className={`font-semibold mb-4 text-lg ${t.title}`}>{i + 1}. {q.question ?? q.text}</p>
          <div className="space-y-3">
            {q.options.map((opt, j) => (
              <label key={j} onClick={() => select(i, j)}
                className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition ${optionStyle(i, j)}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[i] === j ? "border-emerald-500 bg-emerald-500" : isDark ? "border-gray-500" : "border-gray-300"}`}>
                  {answers[i] === j && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-sm">{opt}</span>
                {score !== null && (
                  <span className="ml-auto">
                    {(q.correct ?? q.answer) === j
                      ? <FiCheck className="text-emerald-500" />
                      : answers[i] === j
                        ? <FiX className="text-red-500" />
                        : ""}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 justify-center mt-6">
        {score === null ? (
          <button onClick={submit}
            className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-3 rounded-xl hover:from-emerald-500 hover:to-green-600 font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-500/25">
            <FaRegCheckCircle /> Submit Quiz
          </button>
        ) : (
          <div className="w-full space-y-4">
            <div className={`border rounded-2xl p-6 text-center ${t.resultCard}`}>
              <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-2 text-emerald-500`}>
                <FaTrophy /> Quiz Complete! <FaTrophy />
              </div>
              <div className={`text-xl ${t.title}`}>
                Score: <span className="font-bold text-emerald-500">{score}</span> / {questions.length} ({Math.round((score / questions.length) * 100)}%)
              </div>
              <div className="mb-4 mt-3 max-w-xs mx-auto">
                <ProgressBar value={Math.round((score / questions.length) * 100)} isDark={isDark} />
              </div>
              <div className={`text-sm flex items-center justify-center gap-1 ${t.muted}`}>
                {score === questions.length ? <FiStar className="text-amber-400" /> : score >= questions.length * 0.7 ? <FiCheck className="text-emerald-500" /> : <GiBrain className="text-blue-400" />}
                {score === questions.length ? " Perfect! Excellent work!" : score >= questions.length * 0.7 ? " Great job! Keep it up!" : " Good effort! Try again to improve."}
              </div>
              <div className="flex gap-3 justify-center mt-5 flex-wrap">
                <button onClick={() => setShowRecs(r => !r)}
                  className={`border px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 hover:border-blue-400" : "bg-gray-100 border-gray-300 text-gray-700 hover:border-blue-400"}`}>
                  <FaRobot /> {showRecs ? "Hide" : "View"} AI Tips
                </button>
                <button onClick={onDone}
                  className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-6 py-2 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-green-600">
                  <VscDebugRestart /> Back
                </button>
              </div>
            </div>
            {showRecs && (
              <AIRecommendations subject={meta.subject} topic={meta.topic ?? meta.title} score={score} total={questions.length} isDark={isDark} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Tab ────────────────────────────────────────────────────────────────────
function AITab({ isDark }) {
  const [subject, setSubject] = useState("");
  const [level, setLevel]     = useState("");
  const [topic, setTopic]     = useState("");
  const [questions, setQ]     = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(false);
  const t = tc(isDark);

  const topics = subject ? (SUBJECT_TOPICS[subject] ?? []) : [];

  const generate = async () => {
    if (!subject || !level || !topic) {
      showToast("Please select a subject, level, and topic before generating.", "warning");
      return;
    }
    setLoading(true); setQ([]); setMeta(null);
    try {
      const res = await fetch(`${API_BASE}/quizzes/generate`, {
        method: "POST", headers: authHdr(),
        body: JSON.stringify({ subject, level, topic }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showToast(d?.message ?? "Failed to generate quiz. Please try again.", "error");
        return;
      }
      const data = await res.json();
      setQ(data.questions);
      setMeta({ subject: data.subject, level: data.level, topic: data.topic });
    } catch {
      showToast("Network error. Please check your connection and try again.", "error");
    } finally { setLoading(false); }
  };

  if (meta && questions.length > 0) {
    return <QuizRunner questions={questions} meta={meta} source="AI" onDone={() => { setQ([]); setMeta(null); }} isDark={isDark} />;
  }

  return (
    <div>
      <div className={`border rounded-2xl p-6 mb-6 ${t.card}`}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <select value={subject} onChange={e => { setSubject(e.target.value); setTopic(""); }} disabled={loading}
            className={`border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all ${t.select}`}>
            <option value="">Select Subject</option>
            {Object.keys(SUBJECT_TOPICS).map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} disabled={loading}
            className={`border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all ${t.select}`}>
            <option value="">Select Level</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={topic} onChange={e => setTopic(e.target.value)} disabled={loading || !subject}
            className={`border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 lg:col-span-2 transition-all ${t.select}`}>
            <option value="">{subject ? "Select Topic" : "Select a subject first"}</option>
            {topics.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading}
          className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-6 py-3 rounded-xl hover:from-emerald-500 hover:to-green-600 font-semibold disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25">
          {loading ? <FiLoader className="animate-spin" /> : <FaRobot />}
          {loading ? " Generating..." : " Generate Quiz"}
        </button>
      </div>
      {loading && (
        <div className="text-center py-12">
          <p className={`text-sm mb-3 ${tc(isDark).muted}`}>Generating your quiz, please wait...</p>
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto border-emerald-500`} />
        </div>
      )}
    </div>
  );
}

// ── Saved AI Quizzes Tab ──────────────────────────────────────────────────────
function SavedAIQuizzesTab({ onRetake, isDark }) {
  const [saved, setSaved]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [attempts, setAttempts] = useState([]);
  const t = tc(isDark);

  const load = async () => {
    setLoading(true);
    try {
      const [savedRes, attRes] = await Promise.all([
        fetch(`${API_BASE}/quizzes/saved-ai`, { headers: authHdr() }),
        fetch(`${API_BASE}/quizzes/attempts/mine`, { headers: authHdr() }),
      ]);
      if (savedRes.ok) setSaved(await savedRes.json());
      if (attRes.ok)   setAttempts(await attRes.json());
    } catch { showToast("Failed to load saved quizzes.", "error"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const lastScoreMap = {};
  attempts.forEach(a => { if (a.quizId && !(a.quizId in lastScoreMap)) lastScoreMap[a.quizId] = a.percentage; });

  const deleteQuiz = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, { method: "DELETE", headers: authHdr() });
      if (res.ok) { setSaved(prev => prev.filter(q => q.id !== id)); showToast("Quiz deleted."); }
      else showToast("Failed to delete quiz.", "error");
    } catch { showToast("Failed to delete quiz.", "error"); }
  };

  const filtered = saved.filter(q =>
    (q.subject ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (q.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="text-center py-12">
      <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2 border-emerald-500`} />
      <p className={`text-sm ${t.muted}`}>Loading saved quizzes...</p>
    </div>
  );

  return (
    <div>
      <div className="relative mb-5">
        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} size={16} />
        <input type="text" placeholder="Search saved quizzes..." value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${t.input}`} />
      </div>

      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${t.muted}`}>
          <div className="flex justify-center mb-3 opacity-40"><BiBrain size={48} /></div>
          <p className="text-sm">No saved AI quizzes yet. Generate a quiz — it will be saved here automatically.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(q => {
            const lastScore = lastScoreMap[q.id] ?? null;
            const normalised = (q.questions ?? []).map(qu => ({
              question: qu.text ?? qu.question,
              options: qu.options,
              correct: qu.answer ?? qu.correct ?? 0,
            }));
            return (
              <div key={q.id} className={`border rounded-2xl p-5 transition-all duration-200 ${t.card} ${t.cardHover}`}>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                    <SubjectIcon name={q.subject} size={12} /> {q.subject}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-lg border flex items-center gap-1 ${isDark ? "border-gray-600 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                    <SiLevelsdotfyi /> {q.form}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 ${isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                    <FaRobot /> AI Saved
                  </span>
                </div>
                <h3 className={`font-semibold mb-1 text-sm ${t.title}`}>{q.title}</h3>
                <p className={`text-xs mb-3 ${t.muted}`}>
                  <MdQuiz className="inline mr-1" size={12} />
                  {q.questions?.length ?? 0} questions · Saved {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {lastScore != null && (
                  <div className="mb-3">
                    <div className={`flex justify-between text-xs mb-1`}>
                      <span className={t.muted}>Last score</span>
                      <span className="font-bold text-emerald-500">{lastScore}%</span>
                    </div>
                    <ProgressBar value={lastScore} isDark={isDark} />
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => onRetake({ ...q, questions: normalised, _dbId: q.id })}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:from-emerald-500 hover:to-green-600 transition flex items-center justify-center gap-1 shadow-sm">
                    <FiPlay size={12} /> {lastScore != null ? "Retake Quiz" : "Take Quiz"}
                  </button>
                  <button onClick={() => deleteQuiz(q.id)}
                    className={`text-xs px-2 py-2 rounded-xl transition ${isDark ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : "text-red-500 hover:text-red-700 hover:bg-red-50"}`}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Progress Tab ──────────────────────────────────────────────────────────────
function ProgressTab({ isDark }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const t = tc(isDark);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/quizzes/attempts/mine`, { headers: authHdr() });
        if (res.ok) setAttempts(await res.json());
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className={`h-20 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />)}
    </div>
  );

  const bySubject  = {};
  attempts.forEach(a => { if (!bySubject[a.subject]) bySubject[a.subject] = []; bySubject[a.subject].push(a); });
  const subjects   = Object.keys(bySubject);
  const overallAvg = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;
  const recent     = attempts.slice(0, 5);
  const prev       = attempts.slice(5, 10);
  const recentAvg  = recent.length ? Math.round(recent.reduce((s, a) => s + a.percentage, 0) / recent.length) : 0;
  const prevAvg    = prev.length   ? Math.round(prev.reduce((s, a) => s + a.percentage, 0) / prev.length)     : 0;
  const overallTrend = recentAvg - prevAvg;

  return (
    <div>
      {/* Overall */}
      <div className={`border rounded-2xl p-6 mb-6 ${t.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-bold ${t.title}`}>Overall Progress</h2>
            <p className={`text-xs ${t.muted}`}>{attempts.length} quiz attempts · {subjects.length} subjects</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-500">{overallAvg}%</div>
            {overallTrend !== 0 && prev.length > 0 && (
              <div className={`text-xs flex items-center gap-0.5 justify-end ${overallTrend > 0 ? "text-emerald-500" : "text-red-500"}`}>
                {overallTrend > 0 ? <BiTrendingUp /> : <BiTrendingDown />} {Math.abs(overallTrend)}% vs last period
              </div>
            )}
          </div>
        </div>
        <ProgressBar value={overallAvg} isDark={isDark} />
        <div className={`mt-3 text-xs flex items-center gap-1 ${t.muted}`}>
          {overallAvg >= 75 ? <FiAward className="text-amber-400" /> : overallAvg >= 50 ? <FiTrendingUp className="text-emerald-500" /> : <GiBrain className="text-blue-400" />}
          {overallAvg >= 75 ? " Excellent work! Keep it up!" : overallAvg >= 50 ? " Good progress! Push for 75%+" : " Keep practising — you'll get there!"}
        </div>
      </div>

      {/* Subject breakdown list */}
      {subjects.length > 0 && (
        <div className={`border rounded-2xl p-6 mb-6 ${t.card}`}>
          <h3 className={`text-sm font-bold mb-4 ${t.muted}`}>Subject Breakdown</h3>
          <div className="space-y-4">
            {subjects.map(sub => {
              const subAttempts = bySubject[sub];
              const avg = Math.round(subAttempts.reduce((s, a) => s + a.percentage, 0) / subAttempts.length);
              const color = "#2ea043";
              return (
                <button key={sub} onClick={() => setSelected(sub)} className="w-full text-left group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <SubjectIcon name={sub} size={16} />
                      <span className="text-sm font-semibold group-hover:underline" style={{ color }}>{sub}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${t.muted}`}>{subAttempts.length} attempts</span>
                      <span className={`text-sm font-bold ${t.title}`}>{avg}%</span>
                    </div>
                  </div>
                  <ProgressBar value={avg} color={color} isDark={isDark} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className={`text-center py-16 ${t.muted}`}>
          <div className="flex justify-center mb-3 opacity-40"><MdBarChart size={48} /></div>
          <p className="text-sm">No quiz data yet. Take some quizzes to track your progress!</p>
        </div>
      ) : (
        <>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-1 ${t.muted}`}>
            <FiEye size={14} /> Subjects (click for details)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subjects.map(sub => (
              <SubjectProgressCard key={sub} subject={sub} attempts={bySubject[sub]} onClick={() => setSelected(sub)} isDark={isDark} />
            ))}
          </div>
        </>
      )}

      {selected && (
        <SubjectDetailModal subject={selected} attempts={bySubject[selected]} onClose={() => setSelected(null)} isDark={isDark} />
      )}
    </div>
  );
}

// ── Teacher Quizzes Tab ───────────────────────────────────────────────────────
function TeacherQuizzesTab({ isDark }) {
  const [quizzes, setQuizzes]     = useState([]);
  const [offline, setOffline]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [subTab, setSubTab]       = useState("online");
  const [search, setSearch]       = useState("");
  const t = tc(isDark);

  useEffect(() => {
    const load = async () => {
      try {
        const [onRes, offRes] = await Promise.all([
          fetch(`${API_BASE}/quizzes/available`, { headers: authHdr() }),
          fetch(`${API_BASE}/quizzes/available/offline`, { headers: authHdr() }),
        ]);
        if (onRes.ok)  setQuizzes(await onRes.json());
        if (offRes.ok) setOffline(await offRes.json());
      } catch { showToast("Failed to load quizzes.", "error"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (activeQuiz) {
    return (
      <QuizRunner
        questions={activeQuiz.questions ?? []}
        meta={{ subject: activeQuiz.subject, level: activeQuiz.form, topic: activeQuiz.title }}
        source="TEACHER" quizId={activeQuiz.id}
        onDone={() => setActiveQuiz(null)}
        isDark={isDark}
      />
    );
  }

  const onlineFiltered  = quizzes.filter(q => q.title?.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase()));
  const offlineFiltered = offline.filter(q => q.title?.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase()));
  const formatDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const QuizCard = ({ quiz, isOffline }) => (
    <div className={`border rounded-2xl p-5 transition-all duration-200 ${t.card} ${t.cardHover}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
            <SubjectIcon name={quiz.subject} size={12} /> {quiz.subject}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-lg border flex items-center gap-1 ${isDark ? "border-gray-600 text-gray-400" : "border-gray-200 text-gray-500"}`}>
            <SiLevelsdotfyi /> {quiz.form}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 ${
            quiz.visibility === "PUBLIC"
              ? isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700"
              : isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700"
          }`}>
            {quiz.visibility === "PUBLIC" ? <MdQuiz /> : <MdOutlineQuiz />}
            {quiz.visibility === "PUBLIC" ? " Public" : " School"}
          </span>
        </div>
        <span className={`text-xs ${t.muted}`}>{quiz.duration}</span>
      </div>
      <h3 className={`font-semibold mb-1 ${t.title}`}>{quiz.title}</h3>
      {quiz.description && <p className={`text-xs mb-3 line-clamp-2 ${t.muted}`}>{quiz.description}</p>}
      <div className="flex items-center justify-between">
        <span className={`text-xs flex items-center gap-1 ${t.muted}`}>
          <MdQuiz /> {quiz.questions?.length ?? 0} questions · 📅 {formatDate(quiz.createdAt)}
        </span>
        {isOffline ? (
          <button onClick={() => window.print()}
            className={`border text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${isDark ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"}`}>
            <IoPrintOutline /> Print / Download
          </button>
        ) : (
          <button onClick={() => setActiveQuiz(quiz)}
            className="bg-gradient-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:from-emerald-500 hover:to-green-600 transition flex items-center gap-1 shadow-sm">
            <FiPlay size={12} /> Take Quiz
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="relative mb-5">
        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} size={16} />
        <input type="text" placeholder="Search quizzes..." value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${t.input}`} />
      </div>

      <div className="flex gap-2 mb-6">
        {[["online", <MdQuiz key="o" />, "Online Quizzes"], ["offline", <IoPrintOutline key="p" />, "Print / Offline"]].map(([key, icon, label]) => (
          <button key={key} onClick={() => setSubTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 border ${
              subTab === key
                ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`text-center py-12 ${t.muted}`}>Loading quizzes...</div>
      ) : subTab === "online" ? (
        onlineFiltered.length === 0
          ? <div className={`text-center py-12 ${t.muted}`}>No online quizzes available.</div>
          : <div className="grid md:grid-cols-2 gap-4">{onlineFiltered.map(q => <QuizCard key={q.id} quiz={q} isOffline={false} />)}</div>
      ) : (
        offlineFiltered.length === 0
          ? <div className={`text-center py-12 ${t.muted}`}>No offline quizzes available.</div>
          : <div className="grid md:grid-cols-2 gap-4">{offlineFiltered.map(q => <QuizCard key={q.id} quiz={q} isOffline={true} />)}</div>
      )}
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ isDark }) {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const t = tc(isDark);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/quizzes/attempts/mine`, { headers: authHdr() }),
          fetch(`${API_BASE}/quizzes/attempts/stats`, { headers: authHdr() }),
        ]);
        if (aRes.ok) setAttempts(await aRes.json());
        if (sRes.ok) setStats(await sRes.json());
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const formatDate = d => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " +
      new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className={`text-center py-12 ${t.muted}`}>Loading history...</div>;

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Quizzes",   value: stats.total,        icon: <MdQuiz />,         gradient: "from-emerald-500 to-green-500"  },
            { label: "Average Score",   value: `${stats.avgScore}%`, icon: <TbProgressCheck />, gradient: "from-emerald-600 to-green-600" },
            { label: "AI Quizzes",      value: stats.aiCount,      icon: <FaRobot />,         gradient: "from-emerald-500 to-teal-500"   },
            { label: "Teacher Quizzes", value: stats.teacherCount, icon: <GiTeacher />,       gradient: "from-green-500 to-emerald-600"  },
          ].map((s, i) => (
            <div key={i} className={`relative overflow-hidden border rounded-2xl p-4 text-center group ${t.card}`}>
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${s.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
              <div className={`w-9 h-9 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm text-white`}>{s.icon}</div>
              <div className={`text-2xl font-bold ${t.title}`}>{s.value}</div>
              <div className={`text-xs mt-1 ${t.muted}`}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {attempts.length === 0 ? (
        <div className={`text-center py-12 ${t.muted}`}>No quiz history yet. Take a quiz to see results here.</div>
      ) : (
        <div className="space-y-3">
          {attempts.map(a => (
            <div key={a.id} className={`border rounded-2xl p-4 flex justify-between items-start transition-all duration-200 ${t.card} ${t.cardHover}`}>
              <div>
                <div className={`font-semibold flex items-center gap-2 ${t.title}`}>
                  <SubjectIcon name={a.subject} size={16} />
                  {a.subject}{a.topic ? ` — ${a.topic}` : ""}
                </div>
                <div className={`text-sm flex items-center gap-1 mt-1 ${t.muted}`}>
                  <MdSchool /> {a.level} · {a.source === "AI" ? <><FaRobot className="inline" /> AI Generated</> : <><GiTeacher className="inline" /> Teacher Quiz</>}
                </div>
                <div className={`text-xs mt-1 ${t.dimmed}`}>{formatDate(a.completedAt)}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-500">{a.score}/{a.total}</div>
                <div className={`text-sm ${t.muted}`}>{a.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Quiz Page ────────────────────────────────────────────────────────────
const Quiz = () => {
  const isDark = useTheme();
  const t = tc(isDark);
  const [tab, setTab]         = useState("ai");
  const [retakeQuiz, setRetake] = useState(null);

  const tabs = [
    { key: "ai",       label: "AI Quiz",         icon: <FaRobot /> },
    { key: "saved",    label: "Saved AI",         icon: <MdSave /> },
    { key: "teacher",  label: "Teacher Quizzes",  icon: <GiTeacher /> },
    { key: "progress", label: "My Progress",      icon: <FaChartLine /> },
    { key: "history",  label: "History",          icon: <MdHistory /> },
  ];

  if (retakeQuiz) {
    return (
      <div className={`min-h-screen p-6 transition-colors duration-300 ${t.page}`}>
        <ToastContainer />
        <button onClick={() => setRetake(null)} className={`mb-4 text-sm flex items-center gap-1 hover:underline ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
          <FiArrowLeft /> Back to Saved Quizzes
        </button>
        <QuizRunner
          questions={retakeQuiz.questions}
          meta={{ subject: retakeQuiz.subject, level: retakeQuiz.form ?? retakeQuiz.level, topic: retakeQuiz.title ?? retakeQuiz.topic }}
          source="AI"
          quizId={retakeQuiz._dbId ?? retakeQuiz.id}
          isSaved={true}
          onDone={() => setRetake(null)}
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${t.page}`}>
      <ToastContainer />

      <h1 className={`text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-500`}>
        <FaBrain /> Quizzes
      </h1>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 border-b flex-wrap ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        {tabs.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all -mb-px border border-b-0 flex items-center gap-2 ${
              tab === key ? t.tabActive : `${t.tabInactive} border-transparent`
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "ai"       && <AITab isDark={isDark} />}
      {tab === "saved"    && <SavedAIQuizzesTab onRetake={q => setRetake(q)} isDark={isDark} />}
      {tab === "teacher"  && <TeacherQuizzesTab isDark={isDark} />}
      {tab === "progress" && <ProgressTab isDark={isDark} />}
      {tab === "history"  && <HistoryTab isDark={isDark} />}
    </div>
  );
};

export default Quiz;