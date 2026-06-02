import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { 
  FiBook, 
  FiUpload, 
  FiSearch, 
  FiEye, 
  FiTrash2, 
  FiX, 
  FiCheck, 
  FiAlertCircle,
  FiFile,
  FiDownload,
  FiPlus,
  FiFolder,
  FiLayers,
  FiUsers,
  FiBookOpen,
  FiClock,
  FiUser
} from "react-icons/fi";
import { 
  MdOutlineLibraryBooks, 
  MdOutlineCategory, 
  MdOutlineSchool,
  MdCloudUpload,
  MdDescription,
  MdTitle,
  MdVisibility,
  MdPublic,
  MdLock,
  MdDeleteForever
} from "react-icons/md";
import { 
  FaFilePdf, 
  FaFileWord, 
  FaVideo, 
  FaImage, 
  FaBookReader,
  FaChalkboardTeacher,
  FaCalendarAlt
} from "react-icons/fa";
import { IoDocumentText, IoCloudUploadOutline } from "react-icons/io5";
import { TbFileDescription } from "react-icons/tb";
import { HiOutlineDocumentDownload } from "react-icons/hi";

const SUBJECT_COLORS = {
  Biology:      { bg: "#1a3a2a", color: "#2ea043" },
  Mathematics:  { bg: "#1a2a3a", color: "#58a6ff" },
  English:      { bg: "#3a2a1a", color: "#e3a525" },
  Physics:      { bg: "#2a1a3a", color: "#a371f7" },
  Chemistry:    { bg: "#3a1a1a", color: "#f85149" },
  History:      { bg: "#2a3a1a", color: "#56d364" },
  Other:        { bg: "#21262d", color: "#8b949e" },
};

const RESOURCE_TYPE_MAP = [
  { label: "PDF Document",  type: "PDF",   icon: <FaFilePdf /> },
  { label: "Word Document", type: "PDF",   icon: <FaFileWord /> },
  { label: "Past Paper",    type: "PDF",   icon: <IoDocumentText /> },
  { label: "Video",         type: "VIDEO", icon: <FaVideo /> },
  { label: "Image",         type: "IMAGE", icon: <FaImage /> },
];

const getSubjectStyle = (subject) =>
  SUBJECT_COLORS[subject] || SUBJECT_COLORS["Other"];

const formatDate = (date) => {
  if (!date) return "Recently";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function TeacherResources() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterForm, setFilterForm] = useState("All Forms");
  const [filterSubject, setFilterSubject] = useState("All Subjects");
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherSchoolId, setTeacherSchoolId] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", categoryId: "", classId: "",
    selectedTypeLabel: "PDF Document", type: "PDF",
    visibility: "PUBLIC", file: null,
  });
  const fileInputRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/resources");
      const all = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setBooks(all);
    } catch {
      showToast("Failed to load resources.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    api.get("/auth/me")
      .then(({ data }) => {
        const id = data?.schoolId ?? data?.school?.id ?? data?.data?.schoolId ?? null;
        setTeacherSchoolId(id);
        const name = data?.firstName && data?.lastName 
          ? `${data.firstName} ${data.lastName}` 
          : data?.name || "Teacher";
        setTeacherName(name);
      })
      .catch(() => {});

    api.get("/categories")
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});

    api.get("/classes")
      .then((r) => {
        if (Array.isArray(r.data)) {
          const sorted = [...r.data].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          );
          setClasses(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const subjects = ["All Subjects", ...new Set(books.map((b) => b.category?.name).filter(Boolean))];
  const forms = ["All Forms", ...new Set(books.map((b) => b.targetClass?.name).filter(Boolean))].sort();

  const handleTypeChange = (label) => {
    const matched = RESOURCE_TYPE_MAP.find((t) => t.label === label);
    if (matched) {
      setForm((f) => ({ ...f, selectedTypeLabel: label, type: matched.type }));
    }
  };

  const handleFileChange = (file) => {
    if (file) setForm((f) => ({ ...f, file }));
    else showToast("No file selected.", "error");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast("Please enter a title.", "error"); return;
    }
    if (!form.categoryId) {
      showToast("Please select a subject.", "error"); return;
    }
    if (!form.classId) {
      showToast("Please select a form level.", "error"); return;
    }
    if (!form.file) {
      showToast("Please select a file.", "error"); return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", form.file);
      body.append("title", form.title.trim());
      body.append("description", form.description);
      body.append("type", form.type);
      body.append("status", "PUBLISHED");
      body.append("targetAudience", "Students");
      body.append("visibility", form.visibility);
      body.append("categoryId", form.categoryId);
      body.append("classId", form.classId);
      body.append("isPremium", "false");
      body.append("price", "0");

      if (form.visibility === "PRIVATE" && teacherSchoolId) {
        body.append("schoolId", String(teacherSchoolId));
      }

      await api.post("/resources/create-with-file", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast(`"${form.title}" uploaded successfully!`);
      setForm({
        title: "", description: "", categoryId: "", classId: "",
        selectedTypeLabel: "PDF Document", type: "PDF",
        visibility: "PUBLIC", file: null,
      });
      setShowModal(false);
      await fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRequestDelete = async () => {
    try {
      await api.post("/request", {
        requestName: `Delete Resource: ${deleteTarget.title}`,
        fromUser: "Teacher",
        type: "DELETE_RESOURCE",
        description: JSON.stringify({
          resourceId: deleteTarget.id,
          filePath: deleteTarget.fileUrl,
          bucket: "online-library",
        }),
      });
      showToast("Delete request sent to admin.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message, "error");
    }
  };

  const filtered = books.filter((b) => {
    const matchForm = filterForm === "All Forms" || b.targetClass?.name === filterForm;
    const matchSubject = filterSubject === "All Subjects" || b.category?.name === filterSubject;
    const matchSearch = b.title?.toLowerCase().includes(search.toLowerCase()) ||
                       b.description?.toLowerCase().includes(search.toLowerCase());
    return matchForm && matchSubject && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">
      <main className="max-w-6xl mx-auto p-4">

        {toast && (
          <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2"
            style={{
              backgroundColor: toast.type === "error" ? "#3d1a1a" : "#1a3a2a",
              color: toast.type === "error" ? "#f85149" : "#2ea043",
              border: `1px solid ${toast.type === "error" ? "#f85149" : "#2ea043"}`,
            }}>
            {toast.type === "error" ? <FiAlertCircle /> : <FiCheck />} {toast.msg}
          </div>
        )}

        <section className="bg-[#1a3a2a] border border-[#2ea043] rounded-lg p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <MdOutlineLibraryBooks size={24} />
                Teaching Resources
              </h1>
              <p className="text-white text-sm">Upload and manage educational materials for your students</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="bg-[#2ea043] text-white font-semibold px-5 py-2.5 rounded-md hover:bg-[#3fb950] transition text-sm flex items-center gap-2">
              <FiPlus size={16} /> Upload Material
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { number: books.length, label: "Total Resources", icon: <MdOutlineLibraryBooks size={20} /> },
            { number: [...new Set(books.map((b) => b.category?.name).filter(Boolean))].length, label: "Subjects", icon: <MdOutlineCategory size={20} /> },
            { number: books.reduce((s, b) => s + (b.downloadCount ?? 0), 0), label: "Total Downloads", icon: <HiOutlineDocumentDownload size={20} /> },
            { number: [...new Set(books.map((b) => b.targetClass?.name).filter(Boolean))].length, label: "Form Levels", icon: <MdOutlineSchool size={20} /> },
          ].map((stat, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] p-5 rounded-lg hover:border-[#2ea043] transition">
              <div className="text-white mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.number}</div>
              <div className="text-sm text-white">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" size={16} />
            <input type="text" placeholder="Search resources..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#2ea043] placeholder-white" />
          </div>
          <select value={filterForm} onChange={(e) => setFilterForm(e.target.value)}
            className="bg-[#161b22] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
            {forms.map((f) => <option key={f}>{f}</option>)}
          </select>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-[#161b22] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="text-white text-sm ml-auto flex items-center gap-1">
            <FiBook size={14} /> {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
          </span>
        </section>

        {loading && <div className="text-center py-12 text-white">Loading resources...</div>}

        {!loading && filtered.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-16 text-center">
            <MdOutlineLibraryBooks size={48} className="mx-auto mb-3 text-white opacity-60" />
            <p className="text-sm text-white">No resources found matching your criteria.</p>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filtered.map((book) => {
              const subjectStyle = getSubjectStyle(book.category?.name ?? "Other");
              return (
                <div key={book.id}
                  className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden hover:border-[#2ea043] hover:-translate-y-1 transition">
                  <div className="h-1 w-full" style={{ backgroundColor: subjectStyle.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                        style={{ backgroundColor: subjectStyle.bg, color: subjectStyle.color }}>
                        {subjectStyle.color === "#2ea043" ? <FiBook size={10} /> : <MdOutlineCategory size={10} />}
                        {book.category?.name ?? "Other"}
                      </span>
                      <span className="text-xs text-white flex items-center gap-1">
                        <MdOutlineSchool size={12} /> {book.targetClass?.name ?? "—"}
                      </span>
                    </div>

                    <h3 className="font-bold text-white mb-2 leading-snug">
                      {book.title}
                    </h3>

                    {book.description && (
                      <p className="text-sm text-white mb-3 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-white mb-3 pb-3 border-b border-[#21262d]">
                      <span className="flex items-center gap-1">
                        {book.type === "PDF" ? <FaFilePdf size={12} /> : 
                         book.type === "VIDEO" ? <FaVideo size={12} /> : 
                         book.type === "IMAGE" ? <FaImage size={12} /> : <FiFile size={12} />}
                        {book.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineDocumentDownload size={12} /> {book.downloadCount ?? 0} downloads
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} /> {formatDate(book.createdAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => book.fileUrl && window.open(book.fileUrl, "_blank")}
                        className="flex-1 bg-[#2ea043] text-white text-sm font-semibold py-2 rounded hover:bg-[#3fb950] transition flex items-center justify-center gap-2">
                        <FiEye size={14} /> Preview
                      </button>
                      <button onClick={() => setDeleteTarget(book)}
                        className="flex-1 bg-[#21262d] border border-[#30363d] text-white text-sm font-semibold py-2 rounded hover:border-[#f85149] hover:text-[#f85149] transition flex items-center justify-center gap-2">
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiUpload size={18} /> Upload New Material
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-[#f85149] transition">
                <FiX size={20} />
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-5 transition"
              style={{ borderColor: dragOver ? "#2ea043" : "#30363d", backgroundColor: dragOver ? "#1a3a2a" : "#0d1117" }}>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.mp4,.png,.jpg"
                className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} />
              {form.file ? (
                <div>
                  <FaFilePdf size={48} className="mx-auto mb-2 text-[#2ea043]" />
                  <p className="text-sm text-white font-semibold">{form.file.name}</p>
                  <p className="text-xs text-white mt-1">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <IoCloudUploadOutline size={48} className="mx-auto mb-2 text-white" />
                  <p className="text-sm text-white">Drag & drop or click to browse</p>
                  <p className="text-xs text-white mt-1">PDF, DOCX, MP4, Images</p>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <input type="text" placeholder="Resource Title" value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043] placeholder-white" />

              <textarea placeholder="Description (optional)" value={form.description} rows={2}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043] placeholder-white resize-none" />

              <div className="grid grid-cols-2 gap-3">
                <select value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                  <option value="">Select Subject</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={form.classId}
                  onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                  className="bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                  <option value="">Select Form Level</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select value={form.selectedTypeLabel}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                  {RESOURCE_TYPE_MAP.map((t) => (
                    <option key={t.label} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <select value={form.visibility}
                  onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}
                  className="bg-[#0d1117] border border-[#21262d] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#2ea043]">
                  <option value="PUBLIC">Public - All Schools</option>
                  <option value="PRIVATE">Private - My School Only</option>
                </select>
              </div>

              {form.visibility === "PRIVATE" && (
                <div className="text-xs text-white bg-[#1a2a3a] border border-[#58a6ff] rounded-md px-3 py-2">
                  <MdLock size={12} className="inline mr-1" /> Visible only to your school
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-[#21262d] border border-[#30363d] text-white font-semibold py-2 rounded-md hover:border-[#6e7681] transition text-sm">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                className="flex-1 bg-[#2ea043] text-white font-semibold py-2 rounded-md hover:bg-[#3fb950] transition text-sm disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
          <div className="bg-[#161b22] border border-[#f85149] rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <MdDeleteForever size={48} className="mx-auto mb-3 text-[#f85149]" />
            <h2 className="text-lg font-bold text-white text-center mb-2">Delete Resource?</h2>
            <p className="text-sm text-white text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteTarget.title}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-[#21262d] border border-[#30363d] text-white font-semibold py-2 rounded-md hover:border-[#6e7681] transition">
                Cancel
              </button>
              <button onClick={handleRequestDelete}
                className="flex-1 bg-[#f85149] text-white font-semibold py-2 rounded-md hover:bg-[#da3633] transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}