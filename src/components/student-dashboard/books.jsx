import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiSearch, FiBookOpen, FiDownload, FiShoppingCart, FiCheck,
  FiChevronLeft, FiChevronRight, FiLoader,
} from "react-icons/fi";
import { GiMicroscope, GiChemicalDrop, GiAtom } from "react-icons/gi";
import { MdCalculate, MdMenuBook, MdHistoryEdu, MdPublic, MdOutlineLibraryBooks } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const SUBJECT_ICON_MAP = {
  Mathematics: { Icon: MdCalculate,    color: "#2ea043" },
  Biology:     { Icon: GiMicroscope,   color: "#2ea043" },
  Chemistry:   { Icon: GiChemicalDrop, color: "#2ea043" },
  Physics:     { Icon: GiAtom,         color: "#2ea043" },
  English:     { Icon: MdMenuBook,     color: "#2ea043" },
  History:     { Icon: MdHistoryEdu,   color: "#2ea043" },
  Geography:   { Icon: MdPublic,       color: "#2ea043" },
  Other:       { Icon: FiBookOpen,     color: "#2ea043" },
};

function SubjectIcon({ name, size = 32 }) {
  const entry = SUBJECT_ICON_MAP[name] ?? SUBJECT_ICON_MAP["Other"];
  return <entry.Icon size={size} style={{ color: entry.color }} />;
}

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

function tc(isDark) {
  return {
    page:       isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100"
                       : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900",
    card:       isDark ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                       : "bg-white border-gray-200 shadow-sm",
    cardHover:  isDark ? "hover:border-gray-600 hover:bg-gray-800/70"
                       : "hover:border-emerald-300 hover:shadow-md",
    inner:      isDark ? "bg-gray-900/60 border-gray-700"
                       : "bg-gray-50 border-gray-200",
    hero:       isDark ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30"
                       : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200",
    heroText:   isDark ? "text-gray-100" : "text-gray-800",
    heroSub:    isDark ? "text-emerald-400/80" : "text-emerald-600",
    input:      isDark ? "border-gray-700 bg-gray-900/60 text-gray-200 placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
                       : "border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500",
    select:     isDark ? "border-gray-700 bg-gray-900/60 text-gray-200 focus:border-emerald-500"
                       : "border-gray-300 bg-white text-gray-800 focus:border-emerald-500",
    muted:      isDark ? "text-gray-400" : "text-gray-500",
    title:      isDark ? "text-gray-100" : "text-gray-800",
    desc:       isDark ? "text-gray-400" : "text-gray-500",
    badge:      isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                       : "bg-emerald-50 text-emerald-700 border-emerald-200",
    levelBadge: isDark ? "bg-gray-700/50 text-gray-400" : "bg-gray-100 text-gray-500",
    dlBtn:      isDark ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                       : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200",
    error:      isDark ? "bg-red-500/10 border-red-500/50 text-red-400"
                       : "bg-red-50 border-red-200 text-red-600",
    pgBtn:      (active) => active
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : isDark ? "border border-gray-600 text-gray-300 hover:border-emerald-500" : "border border-gray-300 text-gray-600 hover:border-emerald-500",
    pgNav:      (disabled) => disabled
                  ? isDark ? "border border-gray-700 text-gray-600 cursor-not-allowed" : "border border-gray-200 text-gray-300 cursor-not-allowed"
                  : isDark ? "border border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-emerald-400" : "border border-gray-300 text-gray-600 hover:border-emerald-500",
  };
}

const Books = () => {
  const isDark = useTheme();
  const t = tc(isDark);

  const [books, setBooks]                     = useState([]);
  const [purchasedIds, setPurchasedIds]       = useState(new Set());
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [searchTerm, setSearchTerm]           = useState("");
  const [selectedLevel, setSelectedLevel]     = useState("All Levels");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [currentPage, setCurrentPage]         = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const itemsPerPage = 12;
  const location    = useLocation();
  const showPremium = location.pathname === "/books/premium";

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const parsePrice    = (book) => { const raw = book.price ?? book.amount ?? book.cost ?? book.payment?.amount; if (typeof raw === "number") return raw; if (typeof raw === "string") return parseFloat(raw) || 0; return 0; };
  const isPaidBook    = (book) => parsePrice(book) > 0 || book.isPaid === true;
  const hasAccess     = (book) => purchasedIds.has(book.id) || book.purchased === true || book.isPurchased === true || book.hasAccess === true;
  const canAccessBook = (book) => !isPaidBook(book) || hasAccess(book);
  const formatPrice   = (book) => { const price = parsePrice(book); if (!price) return "Free"; const currency = book.currency ?? "MWK"; return `${currency} ${price.toFixed(2)}`; };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true); setError(null);
        const resRes = await fetch(`${API_BASE}/resources`, { headers });
        if (!resRes.ok) throw new Error(`Failed to fetch resources: ${resRes.status}`);
        const resData = await resRes.json();
        const all = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        setBooks(all.filter((r) => r.form === "DOCUMENT"));
        if (token) {
          try {
            const purchRes = await fetch(`${API_BASE}/payment/my-purchases`, { headers });
            if (purchRes.ok) { const purchData = await purchRes.json(); setPurchasedIds(new Set(purchData.purchased ?? [])); }
          } catch {}
        }
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logActivity = async (action, title, metadata = {}) => {
    try { await fetch(`${API_BASE}/activity`, { method: "POST", headers, body: JSON.stringify({ action, resourceTitle: title, metadata }) }); } catch {}
  };

  const handleDownload = async (book) => {
    try { await fetch(`${API_BASE}/resources/${book.id}/download`, { method: "POST", headers }); } catch {}
    await logActivity("DOWNLOAD", book.title);
    if (book.fileUrl) window.open(book.fileUrl, "_blank");
  };

  const handlePurchase = async (book) => {
    const price = parsePrice(book);
    if (!price) return;
    if (!token) { setError("Please log in to purchase books."); return; }
    setPurchaseLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/payment/create-checkout-session`, { method: "POST", headers, body: JSON.stringify({ resourceId: book.id, amount: price }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data?.message ?? "Unable to start payment"); }
      const data = await res.json();
      const url  = data?.checkoutUrl ?? data?.url;
      if (url) window.location.href = url;
      else throw new Error("No checkout URL returned from server");
    } catch (err) { setError(err.message); } finally { setPurchaseLoading(false); }
  };

  const handleView = async (book) => {
    await logActivity("RESOURCE_VIEWED", book.title);
    if (book.fileUrl) window.open(book.fileUrl, "_blank");
  };

  const subjects = ["All Subjects", ...new Set(books.map((b) => b.category?.name).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch  = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || book.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel   = selectedLevel   === "All Levels"   || book.targetClass?.name === selectedLevel;
    const matchesSubject = selectedSubject === "All Subjects" || book.category?.name    === selectedSubject;
    const matchesType    = showPremium ? isPaidBook(book) : !isPaidBook(book);
    return matchesSearch && matchesLevel && matchesSubject && matchesType;
  });

  const totalItems   = filteredBooks.length;
  const totalPages   = Math.ceil(totalItems / itemsPerPage);
  const startIndex   = (currentPage - 1) * itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedLevel, selectedSubject]);

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${t.page}`}>
      <main className="max-w-6xl mx-auto">

        {/* Hero */}
        <section className={`relative overflow-hidden border p-8 rounded-2xl mb-6 ${t.hero}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
              <MdOutlineLibraryBooks size={22} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-0.5 ${t.heroText}`}>
                {showPremium ? "Premium Books" : "Free Books"}
              </h1>
              <p className={`text-sm ${t.heroSub}`}>
                {showPremium ? "Unlock premium textbooks and study materials." : "Browse free textbooks and study materials."}
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className={`border p-6 rounded-2xl mb-6 transition-colors duration-300 ${t.card}`}>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text" placeholder="Search books..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all ${t.input}`}
            />
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/25">
              <FiSearch size={16} /> Search
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
              className={`border p-2.5 rounded-xl focus:outline-none transition-all text-sm ${t.select}`}>
              <option>All Levels</option>
              <option>Form 1</option><option>Form 2</option>
              <option>Form 3</option><option>Form 4</option>
            </select>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              className={`border p-2.5 rounded-xl focus:outline-none transition-all text-sm ${t.select}`}>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="mb-4">
          <p className={`text-sm ${t.muted}`}>
            Showing {Math.min(startIndex + 1, totalItems)}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} books
          </p>
        </div>

        {loading && (
          <div className={`text-center py-12 flex items-center justify-center gap-2 ${t.muted}`}>
            <FiLoader size={18} className="animate-spin text-emerald-500" /> Loading books…
          </div>
        )}
        {error && <div className={`border p-4 rounded-xl mb-4 text-sm ${t.error}`}>{error}</div>}

        {!loading && !error && (
          <div className="space-y-3">
            {currentBooks.length === 0 ? (
              <div className={`border rounded-2xl p-16 text-center ${t.card}`}>
                <FaBookOpen size={40} className="mx-auto mb-3 opacity-30 text-emerald-500" />
                <p className={`text-sm ${t.muted}`}>No books found.</p>
              </div>
            ) : currentBooks.map((book, index) => (
              <div key={book.id ?? index}
                className={`border rounded-2xl p-4 transition-all duration-200 ${t.card} ${t.cardHover}`}>
                <div className="flex items-center gap-4">
                  {/* Cover */}
                  <div className={`w-20 h-24 border flex items-center justify-center rounded-xl relative flex-shrink-0 ${t.inner}`}>
                    <SubjectIcon name={book.category?.name} size={36} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base mb-1 ${t.title}`}>{book.title}</h3>
                    {book.description && (
                      <p className={`text-sm mb-2 line-clamp-1 ${t.desc}`}>{book.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {book.category?.name && (
                        <span className="text-xs font-semibold text-emerald-500">{book.category.name}</span>
                      )}
                      {book.targetClass?.name && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${t.levelBadge}`}>{book.targetClass.name}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold border ${t.badge}`}>
                        {isPaidBook(book) ? `Paid · ${formatPrice(book)}` : "Free"}
                      </span>
                      {hasAccess(book) && isPaidBook(book) && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold border flex items-center gap-1 ${t.badge}`}>
                          <FiCheck size={11} /> Purchased
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {canAccessBook(book) ? (
                      <>
                        <button onClick={() => handleView(book)}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-2 rounded-xl text-sm hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-1.5 font-semibold shadow-lg shadow-emerald-500/20">
                          <FiBookOpen size={14} /> Read
                        </button>
                        <button onClick={() => handleDownload(book)}
                          className={`border px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 font-semibold ${t.dlBtn}`}>
                          <FiDownload size={14} /> Download
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handlePurchase(book)} disabled={purchaseLoading}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                        {purchaseLoading
                          ? <><FiLoader size={13} className="animate-spin" /> Processing…</>
                          : <><FiShoppingCart size={13} /> Buy · {formatPrice(book)}</>}
                      </button>
                    )}
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
              className={`px-3 py-1.5 rounded-xl flex items-center transition-all ${t.pgNav(currentPage === 1)}`}>
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${t.pgBtn(currentPage === page)}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl flex items-center transition-all ${t.pgNav(currentPage === totalPages)}`}>
              <FiChevronRight size={16} />
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default Books;