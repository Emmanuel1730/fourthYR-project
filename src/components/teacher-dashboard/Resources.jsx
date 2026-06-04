import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { 
  FiBook, FiUpload, FiSearch, FiEye, FiTrash2, FiX, FiCheck, 
  FiAlertCircle, FiFile, FiDownload, FiPlus, FiFolder, FiLayers,
  FiUsers, FiBookOpen, FiClock, FiUser
} from "react-icons/fi";
import { 
  MdOutlineLibraryBooks, MdOutlineCategory, MdOutlineSchool,
  MdCloudUpload, MdDescription, MdTitle, MdVisibility,
  MdPublic, MdLock, MdDeleteForever
} from "react-icons/md";
import { FaFilePdf, FaFileWord, FaVideo, FaImage, FaCalendarAlt } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { HiOutlineDocumentDownload } from "react-icons/hi";

const SUBJECT_COLORS = {
  Biology: "emerald", 
  Mathematics: "blue", 
  English: "amber",
  Physics: "purple", 
  Chemistry: "red", 
  History: "green",
  Other: "gray",
};

const RESOURCE_TYPE_MAP = [
  { label: "PDF Document",  type: "PDF",   icon: <FaFilePdf />, color: "red" },
  { label: "Word Document", type: "DOCX",  icon: <FaFileWord />, color: "blue" },
  { label: "Past Paper",    type: "PDF",   icon: <FiFile />, color: "amber" },
  { label: "Video",         type: "VIDEO", icon: <FaVideo />, color: "purple" },
  { label: "Image",         type: "IMAGE", icon: <FaImage />, color: "pink" },
];

const getSubjectStyle = (subject) => SUBJECT_COLORS[subject] || "gray";

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
    } catch (err) {
      console.error("Error fetching resources:", err);
      showToast("Failed to load resources", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    // Get teacher info
    api.get("/auth/me")
      .then(({ data }) => {
        const userData = data?.data || data;
        const id = userData?.schoolId ?? userData?.school?.id ?? null;
        setTeacherSchoolId(id);
        const name = userData?.firstName && userData?.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : userData?.name || "Teacher";
        setTeacherName(name);
      })
      .catch((err) => console.error("Error fetching teacher info:", err));

    // Get categories
    api.get("/categories")
      .then((r) => {
        const categoriesData = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
        setCategories(categoriesData);
      })
      .catch((err) => console.error("Error fetching categories:", err));

    // Get classes
    api.get("/classes")
      .then((r) => {
        const classesData = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
        if (classesData.length > 0) {
          const sorted = [...classesData].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          );
          setClasses(sorted);
        }
      })
      .catch((err) => console.error("Error fetching classes:", err));
  }, []);

  // Get unique subjects and forms from books
  const subjects = ["All Subjects", ...new Set(books.map((b) => b.category?.name).filter(Boolean))];
  const forms = ["All Forms", ...new Set(books.map((b) => b.targetClass?.name).filter(Boolean))].sort();

  const handleTypeChange = (label) => {
    const matched = RESOURCE_TYPE_MAP.find((t) => t.label === label);
    if (matched) {
      setForm((f) => ({ ...f, selectedTypeLabel: label, type: matched.type }));
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      setForm((f) => ({ ...f, file }));
    } else {
      showToast("No file selected", "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [".pdf", ".docx", ".mp4", ".png", ".jpg", ".jpeg"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      showToast("File type not allowed. Please upload PDF, DOCX, MP4, or images.", "error");
      return false;
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      showToast("File too large. Maximum size is 50MB.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast("Please enter a title", "error"); 
      return;
    }
    if (!form.categoryId) {
      showToast("Please select a subject", "error"); 
      return;
    }
    if (!form.classId) {
      showToast("Please select a form level", "error"); 
      return;
    }
    if (!form.file) {
      showToast("Please select a file", "error"); 
      return;
    }
    
    if (!validateFile(form.file)) {
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", form.file);
      body.append("title", form.title.trim());
      body.append("description", form.description || "");
      body.append("type", form.type);
      body.append("status", "PUBLISHED");
      body.append("targetAudience", "STUDENTS");
      body.append("visibility", form.visibility);
      body.append("categoryId", form.categoryId);
      body.append("classId", form.classId);
      body.append("isPremium", "false");
      body.append("price", "0");

      if (form.visibility === "PRIVATE" && teacherSchoolId) {
        body.append("schoolId", String(teacherSchoolId));
      }

      const response = await api.post("/resources/create-with-file", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        showToast(`✨ "${form.title}" uploaded successfully!`);
        setForm({
          title: "", description: "", categoryId: "", classId: "",
          selectedTypeLabel: "PDF Document", type: "PDF",
          visibility: "PUBLIC", file: null,
        });
        setShowModal(false);
        await fetchBooks();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      showToast(errorMsg, "error");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Original delete request function - sends request to admin
  const handleRequestDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      // Using the original endpoint "/request" (singular) as in the original code
      await api.post("/request", {
        requestName: `Delete Resource: ${deleteTarget.title}`,
        fromUser: "Teacher",
        type: "DELETE_RESOURCE",
        description: JSON.stringify({
          resourceId: deleteTarget.id,
          resourceTitle: deleteTarget.title,
          filePath: deleteTarget.fileUrl,
          bucket: "online-library",
        }),
      });
      showToast("Delete request sent to admin successfully");
      setDeleteTarget(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to send delete request";
      showToast(errorMsg, "error");
      console.error("Delete request error:", err);
    }
  };

  const filtered = books.filter((b) => {
    const matchForm = filterForm === "All Forms" || b.targetClass?.name === filterForm;
    const matchSubject = filterSubject === "All Subjects" || b.category?.name === filterSubject;
    const matchSearch = search === "" || 
                       b.title?.toLowerCase().includes(search.toLowerCase()) ||
                       b.description?.toLowerCase().includes(search.toLowerCase());
    return matchForm && matchSubject && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-200 p-6">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toast-animation {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-animation {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Delete button hover effect - turns RED */
        .delete-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transition: all 0.3s ease;
        }
        .delete-btn:hover {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `}</style>

      {toast && (
        <div className="fixed top-6 right-6 z-50 toast-animation">
          <div className={`px-5 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 backdrop-blur-sm ${
            toast.type === "error" 
              ? "bg-red-500/20 border border-red-500/50 text-red-400" 
              : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
          }`}>
            {toast.type === "error" ? <FiAlertCircle size={16} /> : <FiCheck size={16} />} 
            {toast.msg}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-emerald-100/30 to-teal-100/30 dark:from-emerald-900/30 dark:to-teal-900/30 backdrop-blur-sm border border-emerald-200/40 dark:border-emerald-500/20 rounded-2xl p-8 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <MdOutlineLibraryBooks size={20} className="text-white" />
                </div>
                Teaching Resources
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Upload and manage educational materials for your students</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25">
              <FiPlus size={16} /> Upload Material
            </button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { number: books.length, label: "Resources", icon: <MdOutlineLibraryBooks size={20} />, gradient: "from-blue-500 to-cyan-500" },
            { number: [...new Set(books.map((b) => b.category?.name).filter(Boolean))].length, label: "Subjects", icon: <MdOutlineCategory size={20} />, gradient: "from-emerald-500 to-teal-500" },
            { number: books.reduce((s, b) => s + (b.downloadCount ?? 0), 0), label: "Downloads", icon: <HiOutlineDocumentDownload size={20} />, gradient: "from-purple-500 to-pink-500" },
            { number: [...new Set(books.map((b) => b.targetClass?.name).filter(Boolean))].length, label: "Form Levels", icon: <MdOutlineSchool size={20} />, gradient: "from-orange-500 to-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="relative overflow-hidden bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
              <div className="text-gray-600 dark:text-gray-300 mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.number}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search resources..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all" />
          </div>
          <select value={filterForm} onChange={(e) => setFilterForm(e.target.value)}
            className="bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            {forms.map((f) => <option key={f}>{f}</option>)}
          </select>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="text-gray-600 dark:text-gray-400 text-sm ml-auto flex items-center gap-2">
            <FiBook size={14} /> {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
          </span>
        </section>

        {/* Resources Grid */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
          </div>
        )}

        {!loading && filtered.length === 0 ? (
          <div className="bg-gray-50/90 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-gray-100/90 dark:bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdOutlineLibraryBooks size={40} className="text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">No resources found matching your criteria</p>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filtered.map((book) => {
              const subjectColor = getSubjectStyle(book.category?.name ?? "Other");
              return (
                <div key={book.id}
                  className="group bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 hover:translate-y-[-2px] transition-all duration-300">
                  <div className={`h-1 w-full bg-gradient-to-r from-${subjectColor}-500 to-${subjectColor}-400`}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${subjectColor}-500/20 text-${subjectColor}-400`}>
                        {book.category?.name ?? "Other"}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MdOutlineSchool size={12} /> {book.targetClass?.name ?? "—"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug text-lg">
                      {book.title}
                    </h3>

                    {book.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
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
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium py-2 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center justify-center gap-2">
                        <FiEye size={14} /> Preview
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(book)}
                        className="delete-btn flex-1 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2">
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-animation overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                <FiUpload size={18} className="text-emerald-400" />
                Upload New Material
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-5 transition-all ${
                dragOver ? "border-emerald-500 bg-emerald-500/10" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50"
              }`}>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.mp4,.png,.jpg,.jpeg"
                className="hidden" onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} />
              {form.file ? (
                <div>
                  <FaFilePdf size={48} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">{form.file.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm(f => ({ ...f, file: null }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-2 text-xs text-red-400 hover:text-red-300">
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <IoCloudUploadOutline size={48} className="mx-auto mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Drag & drop or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOCX, MP4, Images (max 50MB)</p>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <input type="text" placeholder="Resource Title *" value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all" />

              <textarea placeholder="Description (optional)" value={form.description} rows={2}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 resize-none" />

              <div className="grid grid-cols-2 gap-3">
                <select value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  <option value="">Select Subject *</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={form.classId}
                  onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  <option value="">Select Form Level *</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select value={form.selectedTypeLabel}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  {RESOURCE_TYPE_MAP.map((t) => (
                    <option key={t.label} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <select value={form.visibility}
                  onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  <option value="PUBLIC">🌍 Public - All Schools</option>
                  <option value="PRIVATE">🔒 Private - My School Only</option>
                </select>
              </div>

              {form.visibility === "PRIVATE" && (
                <div className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <MdLock size={12} /> Visible only to your school
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25">
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </span>
                ) : (
                  "Upload Resource"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-animation">
          <div className="bg-white dark:bg-gray-900 border border-red-500/20 dark:border-red-500/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <MdDeleteForever size={48} className="mx-auto mb-3 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-200 text-center mb-2">Delete Resource?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Are you sure you want to request deletion of <span className="font-semibold text-gray-900 dark:text-gray-200">"{deleteTarget.title}"</span>?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mb-6">
              A request will be sent to the admin for approval.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                Cancel
              </button>
              <button onClick={handleRequestDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-2.5 rounded-xl hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/25">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}