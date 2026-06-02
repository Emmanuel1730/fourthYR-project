// structuredTest.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  FiBook, FiClock, FiCalendar, FiAward, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiPlus, FiEdit, FiEye, 
  FiSend, FiSave, FiTrash2, FiArrowLeft, FiArrowRight,
  FiLoader, FiCheck, FiUser, FiUsers, FiTrendingUp,
  FiBarChart2, FiFileText, FiDownload, FiUpload, FiStar
} from "react-icons/fi";
import { 
  MdOutlineQuiz, MdOutlineDescription, MdOutlineSubject,
  MdOutlineSchool, MdOutlineTimer, MdOutlineQuestionAnswer,
  MdOutlineTipsAndUpdates, MdOutlineMarkEmailRead, MdAutoAwesome
} from "react-icons/md";
import { FaRobot, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const SUBJECT_TOPICS = {
  Biology:           ["Cell Structure","Cell Division","Photosynthesis","Respiration","Transport in Plants","Circulatory System","Nutrition","Excretion","Nervous System","Genetics","Ecology","Disease and Immunity"],
  Mathematics:       ["Algebra","Linear Equations","Quadratic Equations","Functions and Graphs","Trigonometry","Vectors","Matrices","Statistics","Probability","Mensuration"],
  Chemistry:         ["Atomic Structure","Periodic Table","Chemical Bonding","Acids and Bases","Redox Reactions","Electrochemistry","Rates of Reaction","Organic Chemistry"],
  Physics:           ["Motion","Newton's Laws","Work, Energy, Power","Waves","Light","Electricity","Magnetism","Radioactivity"],
  English:           ["Comprehension","Essay Writing","Grammar","Literature","Report Writing","Letter Writing"],
  Geography:         ["Map Reading","Climate","Physical Features","Agriculture","Population","Environmental Conservation"],
  History:           ["Pre-colonial","Colonial Rule","Independence","Post-Independence"],
  "Civic Education": ["Human Rights","Constitution","Government","Democracy","Gender Equality"],
  "Computer Studies":["Hardware","Software","Networking","Programming","Web Design","Data Representation"],
};

const token   = () => localStorage.getItem("accessToken");
const authHdr = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const userFromStorage = () => {
  try { return JSON.parse(localStorage.getItem("user")) ?? {}; } catch { return {}; }
};

function Spinner() {
  return (
    <div className="text-center py-12">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
}

function Badge({ children, color = "#10b981", bg = "rgba(16,185,129,0.15)" }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: color }}>
      {children}
    </span>
  );
}

function Alert({ type = "info", children }) {
  const config = {
    info:    { bg: "from-blue-500/10 to-blue-600/10", border: "blue-500/30", color: "#60a5fa", icon: <FiAlertCircle size={14} /> },
    success: { bg: "from-emerald-500/10 to-teal-500/10", border: "emerald-500/30", color: "#10b981", icon: <FiCheckCircle size={14} /> },
    warning: { bg: "from-amber-500/10 to-orange-500/10", border: "amber-500/30", color: "#fbbf24", icon: <FiAlertCircle size={14} /> },
    error:   { bg: "from-red-500/10 to-pink-500/10", border: "red-500/30", color: "#f87171", icon: <FiXCircle size={14} /> },
  };
  const c = config[type];
  return (
    <div className={`p-3 rounded-xl border bg-gradient-to-r ${c.bg} border-${c.border} flex items-center gap-2.5 text-sm mb-4`}
      style={{ color: c.color }}>
      {c.icon}
      <span>{children}</span>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false, small = false, className = "" }) {
  const variants = {
    primary:   "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25",
    secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600",
    danger:    "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30",
    ghost:     "bg-transparent text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600",
    info:      "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${variants[variant]} ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

function QuestionEditor({ questions, onChange }) {
  const update = (i, field, value) => {
    const updated = questions.map((q, idx) =>
      idx === i ? { ...q, [field]: field === "marks" ? Number(value) : value } : q
    );
    onChange(updated);
  };

  const remove = (i) => onChange(questions.filter((_, idx) => idx !== i));
  const addBlank = () =>
    onChange([
      ...questions,
      { id: `q${Date.now()}`, text: "", marks: 2, type: "short", markingGuidance: "" },
    ]);

  const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div>
      {questions.map((q, i) => (
        <Card key={q.id} className="mb-3">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </div>
            <textarea
              value={q.text}
              onChange={e => update(i, "text", e.target.value)}
              placeholder="Question text..."
              rows={2}
              className="flex-1 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-vertical"
            />
            <Btn variant="danger" small onClick={() => remove(i)}>
              <FiTrash2 size={12} /> Remove
            </Btn>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Type</label>
              <select value={q.type} onChange={e => update(i, "type", e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500">
                <option value="short">Short answer</option>
                <option value="structured">Structured</option>
                <option value="long">Long answer</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Marks</label>
              <input type="number" min={1} max={20} value={q.marks}
                onChange={e => update(i, "marks", e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Running Total</label>
              <div className="text-emerald-400 font-semibold text-sm py-1.5">{totalMarks} marks</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 flex items-center gap-1">
              <MdOutlineTipsAndUpdates size={12} /> Marking guidance (private)
            </label>
            <textarea
              value={q.markingGuidance || ""}
              onChange={e => update(i, "markingGuidance", e.target.value)}
              rows={2}
              placeholder="Key points the answer must include..."
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 resize-vertical"
            />
          </div>
        </Card>
      ))}
      <Btn variant="secondary" onClick={addBlank}>
        <FiPlus size={14} /> Add question manually
      </Btn>
    </div>
  );
}

function CreateTestPage({ onBack, editingTest = null }) {
  const [step, setStep]           = useState(editingTest ? 2 : 1);
  const [genForm, setGenForm]     = useState({ subject: "", form: "", topic: "", count: 5 });
  const [generating, setGen]      = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const [meta, setMeta] = useState({
    title: editingTest?.title ?? "",
    subject: editingTest?.subject ?? "",
    form: editingTest?.form ?? "",
    duration: editingTest?.duration ?? "60 minutes",
    instructions: editingTest?.instructions ?? "Answer all questions. Show your working where appropriate.",
  });

  const [questions, setQuestions] = useState(editingTest?.questions ?? []);
  const [status, setStatus]       = useState(editingTest?.status ?? "DRAFT");

  const subjects = Object.keys(SUBJECT_TOPICS);
  const topics   = genForm.subject ? SUBJECT_TOPICS[genForm.subject] ?? [] : [];

  const generate = async () => {
    if (!genForm.subject || !genForm.form || !genForm.topic) {
      setError("Please fill in subject, form, and topic.");
      return;
    }
    setGen(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/structured-tests/generate-questions`, {
        method: "POST", headers: authHdr(),
        body: JSON.stringify({ ...genForm }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d?.message ?? "Failed"); }
      const data = await res.json();
      setQuestions(data.questions);
      setMeta(m => ({
        ...m,
        subject: genForm.subject,
        form: genForm.form,
        title: m.title || `${genForm.subject} — ${genForm.topic} (${genForm.form})`,
      }));
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally { setGen(false); }
  };

  const save = async (publishStatus) => {
    if (!meta.title || questions.length === 0) {
      setError("Title and at least one question are required.");
      return;
    }
    setSaving(true); setError("");
    try {
      const url    = editingTest ? `${API_BASE}/structured-tests/${editingTest.id}` : `${API_BASE}/structured-tests`;
      const method = editingTest ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: authHdr(),
        body: JSON.stringify({ ...meta, questions, status: publishStatus }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d?.message ?? "Failed to save"); }
      onBack(true);
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Btn variant="ghost" onClick={() => onBack(false)}>
          <FiArrowLeft size={14} /> Back
        </Btn>
        <h2 className="text-xl font-semibold text-gray-200">
          {editingTest ? "Edit Test" : "Create New Test"}
        </h2>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {step === 1 && (
        <Card>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-200">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FaRobot size={14} className="text-purple-400" />
            </div>
            Generate questions with AI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Subject</label>
              <select value={genForm.subject} onChange={e => setGenForm(f => ({ ...f, subject: e.target.value, topic: "" }))}
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Form / Level</label>
              <select value={genForm.form} onChange={e => setGenForm(f => ({ ...f, form: e.target.value }))}
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                <option value="">Select form</option>
                {["Form 1","Form 2","Form 3","Form 4"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Topic</label>
              <select value={genForm.topic} onChange={e => setGenForm(f => ({ ...f, topic: e.target.value }))}
                disabled={!genForm.subject}
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50">
                <option value="">Select topic</option>
                {topics.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Number of questions</label>
              <input type="number" min={2} max={10} value={genForm.count}
                onChange={e => setGenForm(f => ({ ...f, count: Number(e.target.value) }))}
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <Btn onClick={generate} disabled={generating}>
              {generating ? <FiLoader size={14} className="animate-spin" /> : <MdAutoAwesome size={14} />}
              {generating ? " Generating..." : " Generate questions"}
            </Btn>
            <Btn variant="secondary" onClick={() => setStep(2)}>
              Skip — add manually
            </Btn>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div>
          <Card className="mb-4">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <MdOutlineDescription size={14} className="text-emerald-400" />
              </div>
              Test Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Test title *</label>
                <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Biology End of Term Test" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Subject</label>
                  <input value={meta.subject} onChange={e => setMeta(m => ({ ...m, subject: e.target.value }))}
                    className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Form</label>
                  <input value={meta.form} onChange={e => setMeta(m => ({ ...m, form: e.target.value }))}
                    className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Duration</label>
                  <input value={meta.duration} onChange={e => setMeta(m => ({ ...m, duration: e.target.value }))}
                    className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="60 minutes" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Total marks</label>
                  <div className="text-emerald-400 font-bold text-lg py-1.5">
                    {questions.reduce((s, q) => s + (q.marks || 0), 0)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Instructions to students</label>
                <textarea value={meta.instructions} onChange={e => setMeta(m => ({ ...m, instructions: e.target.value }))}
                  rows={2} className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-vertical" />
              </div>
            </div>
          </Card>

          <Card className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <MdOutlineQuestionAnswer size={14} className="text-emerald-400" />
                </div>
                Questions ({questions.length})
              </h3>
              <Btn variant="ghost" small onClick={() => setStep(1)}>
                <FaRobot size={12} /> Re-generate
              </Btn>
            </div>
            <QuestionEditor questions={questions} onChange={setQuestions} />
          </Card>

          <div className="flex gap-3 flex-wrap">
            <Btn onClick={() => save("DRAFT")} disabled={saving} variant="secondary">
              <FiSave size={14} /> Save as draft
            </Btn>
            <Btn onClick={() => save("PUBLISHED")} disabled={saving}>
              <FiSend size={14} /> {editingTest?.status === "PUBLISHED" ? "Save & keep published" : "Publish to students"}
            </Btn>
            {editingTest?.status === "PUBLISHED" && (
              <Btn onClick={() => save("CLOSED")} disabled={saving} variant="danger">
                <FiXCircle size={14} /> Close test
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MarkSubmission({ submission, test, onBack }) {
  const [marks, setMarks] = useState(() =>
    (test.questions ?? []).map(q => {
      const existing = submission.finalMarks?.find(m => m.questionId === q.id);
      const ai = submission.aiMarking?.find(m => m.questionId === q.id);
      return {
        questionId: q.id,
        mark: existing?.mark ?? ai?.suggestedMark ?? 0,
        feedback: existing?.feedback ?? ai?.feedback ?? "",
      };
    })
  );
  const [comment, setComment] = useState(submission.teacherComment ?? "");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoad] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const runAI = async () => {
    setAiLoad(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/structured-tests/submissions/${submission.id}/ai-mark`, {
        method: "POST", headers: authHdr(),
      });
      if (!res.ok) throw new Error("AI marking failed");
      const data = await res.json();
      setMarks(prev => prev.map(m => {
        const ai = data.aiMarking?.find(a => a.questionId === m.questionId);
        return ai ? { ...m, mark: ai.suggestedMark, feedback: ai.feedback } : m;
      }));
      setSuccess("AI suggestions loaded — review and adjust before saving");
    } catch (e) {
      setError(e.message);
    } finally { setAiLoad(false); }
  };

  const updateMark = (i, field, value) => {
    setMarks(prev => prev.map((m, idx) =>
      idx === i ? { ...m, [field]: field === "mark" ? Number(value) : value } : m
    ));
  };

  const save = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/structured-tests/submissions/${submission.id}/final-marks`, {
        method: "PATCH", headers: authHdr(),
        body: JSON.stringify({ finalMarks: marks, teacherComment: comment }),
      });
      if (!res.ok) throw new Error("Failed to save marks");
      setSuccess("Marks saved and sent to student!");
      setTimeout(() => onBack(true), 1500);
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const totalAwarded = marks.reduce((s, m) => s + (m.mark || 0), 0);
  const pct = test.totalMarks ? Math.round((totalAwarded / test.totalMarks) * 100) : 0;
  const studentName = submission.student
    ? `${submission.student.firstName} ${submission.student.lastName}`
    : `Student ${submission.studentId}`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Btn variant="ghost" onClick={() => onBack(false)}>
          <FiArrowLeft size={14} /> Back
        </Btn>
        <div>
          <h2 className="text-xl font-semibold text-gray-200">
            Marking: {studentName}
          </h2>
          <p className="text-xs text-gray-400">
            {test.title} · Submitted {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="flex gap-3 mb-5 items-center flex-wrap">
        <Btn variant="info" onClick={runAI} disabled={aiLoading}>
          {aiLoading ? <FiLoader size={14} className="animate-spin" /> : <FaRobot size={14} />}
          {aiLoading ? " AI is marking..." : " Get AI suggestions"}
        </Btn>
        <span className="text-gray-400 text-sm">or mark manually below</span>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold text-emerald-400">{totalAwarded} / {test.totalMarks ?? "?"}</div>
          <div className="text-xs text-gray-400">{pct}% of total marks</div>
        </div>
      </div>

      {test.questions?.map((q, i) => {
        const answer = submission.answers?.find(a => a.questionId === q.id)?.answer ?? "(no answer)";
        const ai = submission.aiMarking?.find(a => a.questionId === q.id);
        const m = marks[i];

        return (
          <Card key={q.id} className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-200 font-medium flex-1 pr-4">
                Q{i+1}. {q.text}
              </p>
              <Badge>{q.marks} marks</Badge>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Student answer</p>
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{answer}</p>
            </div>

            {q.markingGuidance && (
              <div className="bg-emerald-500/10 rounded-lg p-3 mb-3 border border-emerald-500/30">
                <p className="text-emerald-400 text-xs mb-1 uppercase tracking-wide">Marking guidance</p>
                <p className="text-emerald-300 text-xs">{q.markingGuidance}</p>
              </div>
            )}

            {ai && (
              <div className="bg-blue-500/10 rounded-lg p-3 mb-3 border border-blue-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                    <FaRobot size={10} /> AI suggests
                  </span>
                  <div className="flex gap-2">
                    <Badge color="#60a5fa" bg="rgba(96,165,250,0.15)">{ai.suggestedMark}/{ai.maxMark}</Badge>
                    <Badge color={ai.confidence==="high"?"#10b981":ai.confidence==="medium"?"#fbbf24":"#f87171"}>
                      {ai.confidence} confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-300 text-xs">{ai.feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Mark awarded</label>
                <input type="number" min={0} max={q.marks}
                  value={m?.mark ?? 0}
                  onChange={e => updateMark(i, "mark", e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Feedback to student</label>
                <input value={m?.feedback ?? ""}
                  onChange={e => updateMark(i, "feedback", e.target.value)}
                  placeholder="Write feedback..."
                  className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </Card>
        );
      })}

      <Card className="mb-4">
        <label className="text-xs text-gray-400 block mb-2">Overall teacher comment</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          placeholder="Overall comments on student performance..."
          className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-vertical" />
      </Card>

      <Btn onClick={save} disabled={saving}>
        {saving ? <FiLoader size={14} className="animate-spin" /> : <FiCheck size={14} />}
        {saving ? " Saving..." : ` Save marks (${totalAwarded}/${test.totalMarks})`}
      </Btn>
    </div>
  );
}

function SubmissionsView({ test, onBack }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/structured-tests/${test.id}/submissions`, { headers: authHdr() });
      if (res.ok) setSubs(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (marking) {
    return <MarkSubmission submission={marking} test={test} onBack={(refresh) => { setMarking(null); if (refresh) load(); }} />;
  }

  const marked = subs.filter(s => s.status === "MARKED").length;
  const pending = subs.length - marked;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Btn variant="ghost" onClick={onBack}>
          <FiArrowLeft size={14} /> Back
        </Btn>
        <div>
          <h2 className="text-xl font-semibold text-gray-200">{test.title}</h2>
          <p className="text-xs text-gray-400">
            {subs.length} submissions · {marked} marked · {pending} pending
          </p>
        </div>
      </div>

      {loading ? <Spinner /> : subs.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-400">No submissions yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {subs.map(s => {
            const name = s.student ? `${s.student.firstName} ${s.student.lastName}` : `Student ${s.studentId}`;
            return (
              <Card key={s.id} className="hover:border-gray-600 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-gray-200 font-medium flex items-center gap-2">
                      <FiUser size={14} className="text-gray-400" /> {name}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {s.status === "MARKED" ? (
                        <>
                          <Badge color="#10b981">✓ Marked</Badge>
                          <Badge color="#60a5fa">{s.totalScore}/{test.totalMarks} — {s.percentage}%</Badge>
                        </>
                      ) : (
                        <Badge color="#fbbf24">⏳ Awaiting marking</Badge>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(s.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Btn small onClick={() => setMarking(s)}>
                    <FiEdit size={12} /> {s.status === "MARKED" ? "Review" : "Mark"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeacherTestsView() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/structured-tests/mine`, { headers: authHdr() });
      if (res.ok) setTests(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (view === "create") return <CreateTestPage onBack={(refresh) => { setView("list"); if (refresh) load(); }} />;
  if (view === "edit" && selected) return <CreateTestPage editingTest={selected} onBack={(refresh) => { setView("list"); setSelected(null); if (refresh) load(); }} />;
  if (view === "submissions" && selected) return <SubmissionsView test={selected} onBack={() => { setView("list"); setSelected(null); load(); }} />;

  const statusConfig = {
    DRAFT: { color: "#9ca3af", bg: "rgba(156,163,175,0.15)", label: "Draft" },
    PUBLISHED: { color: "#10b981", bg: "rgba(16,185,129,0.15)", label: "Published" },
    CLOSED: { color: "#f87171", bg: "rgba(248,113,113,0.15)", label: "Closed" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <MdOutlineQuiz size={22} className="text-emerald-400" />
            My Tests
          </h2>
          <p className="text-xs text-gray-400 mt-1">{tests.length} tests created</p>
        </div>
        <Btn onClick={() => setView("create")}>
          <FiPlus size={14} /> Create test
        </Btn>
      </div>

      {loading ? <Spinner /> : tests.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdOutlineQuiz size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400">No tests yet. Create one to get started</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map(t => {
            const config = statusConfig[t.status];
            return (
              <Card key={t.id} className="hover:border-gray-600 transition-all">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-gray-200 font-medium text-base">{t.title}</span>
                      <Badge color={config.color} bg={config.bg}>{config.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FiBook size={12} /> {t.subject}</span>
                      <span className="flex items-center gap-1"><MdOutlineSchool size={12} /> {t.form}</span>
                      <span className="flex items-center gap-1"><FiClock size={12} /> {t.duration}</span>
                      <span className="flex items-center gap-1"><MdOutlineQuestionAnswer size={12} /> {t.questions?.length} questions</span>
                      <span className="flex items-center gap-1"><FiAward size={12} /> {t.totalMarks} marks</span>
                      <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Btn small variant="info" onClick={() => { setSelected(t); setView("submissions"); }}>
                      <FiUsers size={12} /> Submissions
                    </Btn>
                    <Btn small variant="secondary" onClick={() => { setSelected(t); setView("edit"); }}>
                      <FiEdit size={12} /> Edit
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TakeTest({ test, onBack }) {
  const [answers, setAnswers] = useState(() =>
    (test.questions ?? []).reduce((acc, q) => ({ ...acc, [q.id]: "" }), {})
  );
  const [submitting, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const m = parseInt(test.duration) || 60;
    return m * 60;
  });

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTimeLeft(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [done]);

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timerColor = timeLeft < 300 ? "#f87171" : timeLeft < 600 ? "#fbbf24" : "#10b981";

  const submit = async () => {
    const blank = test.questions?.filter(q => !answers[q.id]?.trim());
    if (blank?.length > 0) {
      setError(`Please answer all questions. ${blank.length} unanswered.`);
      return;
    }
    setSubmit(true); setError("");
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const res = await fetch(`${API_BASE}/structured-tests/${test.id}/submit`, {
        method: "POST", headers: authHdr(),
        body: JSON.stringify({ answers: payload }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d?.message ?? "Submission failed"); }
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally { setSubmit(false); }
  };

  const answered = Object.values(answers).filter(v => v.trim()).length;
  const total = test.questions?.length ?? 0;

  if (done) {
    return (
      <Card className="text-center py-12">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Test submitted!</h2>
        <p className="text-gray-400 mb-6">
          Your answers have been sent to your teacher for marking.
        </p>
        <Btn onClick={onBack}>
          <FiArrowLeft size={14} /> Back to tests
        </Btn>
      </Card>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 pb-3 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-gray-200 font-semibold">{test.title}</p>
            <p className="text-xs text-gray-400">{test.subject} · {test.form} · {test.totalMarks} marks</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: timerColor }}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-400">remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{answered}/{total}</div>
              <div className="text-xs text-gray-400">answered</div>
            </div>
          </div>
        </div>
      </div>

      {test.instructions && (
        <Alert type="info">
          <strong>Instructions:</strong> {test.instructions}
        </Alert>
      )}

      {error && <Alert type="error">{error}</Alert>}

      {test.questions?.map((q, i) => {
        const rowHeight = q.type === "long" ? 6 : q.type === "structured" ? 4 : 2;
        const isAnswered = answers[q.id]?.trim();
        return (
          <Card key={q.id} className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-emerald-400 font-semibold text-sm">Question {i + 1}</span>
              <Badge>{q.marks} {q.marks === 1 ? "mark" : "marks"}</Badge>
            </div>
            <p className="text-gray-200 text-sm mb-3 leading-relaxed">{q.text}</p>
            <textarea
              value={answers[q.id] || ""}
              onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              rows={rowHeight}
              placeholder="Write your answer here..."
              className={`w-full bg-gray-900/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-all resize-vertical ${
                isAnswered ? "border-emerald-500 focus:ring-emerald-500" : "border-gray-700 focus:border-emerald-500"
              }`}
            />
            {isAnswered && (
              <p className="text-emerald-400/70 text-xs mt-1 flex items-center gap-1">
                <FiCheck size={10} /> answered
              </p>
            )}
          </Card>
        );
      })}

      <div className="flex gap-3 items-center mt-4 pb-8">
        <Btn onClick={submit} disabled={submitting}>
          {submitting ? <FiLoader size={14} className="animate-spin" /> : <FiSend size={14} />}
          {submitting ? " Submitting..." : ` Submit test (${answered}/${total} answered)`}
        </Btn>
        <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
      </div>
    </div>
  );
}

function ViewResult({ test, studentId, onBack }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/structured-tests/${test.id}/my-result`, { headers: authHdr() });
        if (!res.ok) throw new Error("Result not available yet");
        setResult(await res.json());
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <><Alert type="error">{error}</Alert><Btn variant="ghost" onClick={onBack}><FiArrowLeft size={14} /> Back</Btn></>;

  const isMarked = result.status === "MARKED";

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Btn variant="ghost" onClick={onBack}>
          <FiArrowLeft size={14} /> Back
        </Btn>
        <h2 className="text-xl font-semibold text-gray-200">{test.title} — My Result</h2>
      </div>

      {isMarked ? (
        <>
          <Card className="text-center mb-5 py-8">
            <div className="mb-3">
              {result.percentage >= 75 ? <FiStar size={48} className="text-emerald-400 mx-auto" /> : 
               result.percentage >= 50 ? <FiTrendingUp size={48} className="text-amber-400 mx-auto" /> : 
               <FiBarChart2 size={48} className="text-red-400 mx-auto" />}
            </div>
            <div className="text-4xl font-bold text-emerald-400 mb-1">{result.percentage}%</div>
            <div className="text-gray-400">{result.totalScore} / {test.totalMarks} marks</div>
            {result.teacherComment && (
              <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-left">
                <p className="text-emerald-400 text-xs uppercase tracking-wide mb-1">Teacher comment</p>
                <p className="text-gray-200 text-sm">{result.teacherComment}</p>
              </div>
            )}
          </Card>

          {test.questions?.map((q, i) => {
            const answer = result.answers?.find(a => a.questionId === q.id)?.answer ?? "(no answer)";
            const marked = result.finalMarks?.find(m => m.questionId === q.id);
            return (
              <Card key={q.id} className="mb-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-gray-200 font-medium">Q{i+1}. {q.text}</span>
                  {marked && (
                    <Badge color={marked.mark >= q.marks * 0.7 ? "#10b981" : marked.mark >= q.marks * 0.4 ? "#fbbf24" : "#f87171"}>
                      {marked.mark} / {q.marks}
                    </Badge>
                  )}
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-700">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Your answer</p>
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">{answer}</p>
                </div>
                {marked?.feedback && (
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-blue-400 text-xs uppercase tracking-wide mb-1">Teacher feedback</p>
                    <p className="text-gray-200 text-sm">{marked.feedback}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </>
      ) : (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock size={40} className="text-amber-400" />
          </div>
          <p className="text-gray-200 font-medium mb-1">Test submitted — awaiting marking</p>
          <p className="text-gray-400 text-sm">Your teacher will mark your test and results will appear here</p>
        </Card>
      )}
    </div>
  );
}

function StudentTestsView() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const user = userFromStorage();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/structured-tests/available`, { headers: authHdr() });
        if (res.ok) setTests(await res.json());
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (view === "take" && selected) return <TakeTest test={selected} onBack={() => { setView("list"); setSelected(null); }} />;
  if (view === "result" && selected) return <ViewResult test={selected} studentId={user.id} onBack={() => { setView("list"); setSelected(null); }} />;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-200 mb-5 flex items-center gap-2">
        <MdOutlineQuiz size={22} className="text-emerald-400" />
        Available Tests
      </h2>
      {loading ? <Spinner /> : tests.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdOutlineQuiz size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400">No tests available yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map(t => (
            <Card key={t.id} className="hover:border-gray-600 transition-all">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <p className="text-gray-200 font-medium text-base mb-1">{t.title}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiBook size={12} /> {t.subject}</span>
                    <span className="flex items-center gap-1"><MdOutlineSchool size={12} /> {t.form}</span>
                    <span className="flex items-center gap-1"><FiClock size={12} /> {t.duration}</span>
                    <span className="flex items-center gap-1"><FiAward size={12} /> {t.totalMarks} marks</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Btn small variant="info" onClick={() => { setSelected(t); setView("result"); }}>
                    <FiEye size={12} /> View result
                  </Btn>
                  <Btn small onClick={() => { setSelected(t); setView("take"); }}>
                    <FiEdit size={12} /> Take test
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const StructuredTests = () => {
  const user = userFromStorage();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <MdOutlineQuiz size={18} className="text-white" />
            </div>
            Structured Tests
          </h1>
          <p className="text-gray-400 text-sm">
            {isTeacher
              ? "Create AI-generated written tests, review submissions, and mark with AI assistance"
              : "Take written tests set by your teacher and view your marked results"}
          </p>
        </div>
        {isTeacher ? <TeacherTestsView /> : <StudentTestsView />}
      </div>
    </div>
  );
};

export default StructuredTests;