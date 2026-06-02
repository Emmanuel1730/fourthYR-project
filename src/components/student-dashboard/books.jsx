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
  Mathematics: { Icon: MdCalculate, color: "#2ea043" },
  Biology: { Icon: GiMicroscope, color: "#2ea043" },
  Chemistry: { Icon: GiChemicalDrop, color: "#2ea043" },
  Physics: { Icon: GiAtom, color: "#2ea043" },
  English: { Icon: MdMenuBook, color: "#2ea043" },
  History: { Icon: MdHistoryEdu, color: "#2ea043" },
  Geography: { Icon: MdPublic, color: "#2ea043" },
  Other: { Icon: FiBookOpen, color: "#2ea043" },
};

function SubjectIcon({ name, size = 32 }) {
  const entry = SUBJECT_ICON_MAP[name] ?? SUBJECT_ICON_MAP["Other"];
  return <entry.Icon size={size} style={{ color: entry.color }} />;
}

const Books = () => {
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

  const parsePrice  = (book) => { const raw = book.price ?? book.amount ?? book.cost ?? book.payment?.amount; if (typeof raw === "number") return raw; if (typeof raw === "string") return parseFloat(raw) || 0; return 0; };
  const isPaidBook  = (book) => parsePrice(book) > 0 || book.isPaid === true;
  const hasAccess   = (book) => purchasedIds.has(book.id) || book.purchased === true || book.isPurchased === true || book.hasAccess === true;
  const canAccessBook = (book) => !isPaidBook(book) || hasAccess(book);
  const formatPrice = (book) => { const price = parsePrice(book); if (!price) return "Free"; const currency = book.currency ?? "MWK"; return `${currency} ${price.toFixed(2)}`; };

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
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6">
      <main className="max-w-6xl mx-auto p-4">

        {/* Hero Header */}
        <section className="bg-[#1a3a2a] border border-[#2ea043] p-8 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <MdOutlineLibraryBooks /> {showPremium ? "Premium Books" : "Free Books"}
          </h1>
          <p className="opacity-80 text-sm">
            {showPremium ? "Unlock premium textbooks and study materials." : "Browse free textbooks and study materials."}
          </p>
        </section>

        {/* Search & Filters */}
        <div className="bg-[#161b22] border border-[#21262d] p-6 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-[#21262d] bg-[#0d1117] text-[#e6edf3] rounded-lg px-4 py-2 focus:border-[#2ea043] focus:outline-none placeholder-[#6e7681]"
            />
            <button className="bg-[#2ea043] text-white px-6 py-2 rounded-lg hover:bg-[#3fb950] transition flex items-center gap-2">
              <FiSearch size={16} /> Search
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-[#21262d] bg-[#0d1117] text-[#e6edf3] p-2 rounded-md focus:border-[#2ea043] focus:outline-none">
              <option>All Levels</option>
              <option>Form 1</option><option>Form 2</option>
              <option>Form 3</option><option>Form 4</option>
            </select>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-[#21262d] bg-[#0d1117] text-[#e6edf3] p-2 rounded-md focus:border-[#2ea043] focus:outline-none">
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-[#e6edf3]">
            Showing {Math.min(startIndex + 1, totalItems)}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} books
          </h2>
        </div>

        {loading && (
          <div className="text-center py-12 text-[#8b949e] flex items-center justify-center gap-2">
            <FiLoader size={18} className="animate-spin text-[#2ea043]" /> Loading books…
          </div>
        )}
        {error && (
          <div className="bg-[#3d1a1a] border border-[#f85149] text-[#f85149] p-4 rounded-lg mb-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {currentBooks.length === 0 ? (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-16 text-center text-[#6e7681]">
                <FaBookOpen size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No books found.</p>
              </div>
            ) : (
              currentBooks.map((book, index) => (
                <div key={book.id ?? index}
                  className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 hover:border-[#2ea043] transition">
                  <div className="flex items-center gap-4">
                    {/* Cover */}
                    <div className="w-20 h-24 bg-[#0d1117] border border-[#30363d] flex items-center justify-center rounded relative flex-shrink-0">
                      <SubjectIcon name={book.category?.name} size={36} />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#e6edf3] text-base mb-1">{book.title}</h3>
                      {book.description && (
                        <p className="text-sm text-[#6e7681] mb-2 line-clamp-1">{book.description}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        {book.category?.name && (
                          <span className="text-xs font-semibold text-[#2ea043]">{book.category.name}</span>
                        )}
                        {book.targetClass?.name && (
                          <span className="text-xs text-[#6e7681]">{book.targetClass.name}</span>
                        )}
                        
                        <span
                        className="text-xs px-2 py-0.5 rounded font-semibold bg-[#1a3a2a] text-[#2ea043]"
                      >
                          {isPaidBook(book) ? `Paid · ${formatPrice(book)}` : "Free"}
                        </span>
                        {hasAccess(book) && isPaidBook(book) && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1a3a2a] text-[#2ea043] font-semibold flex items-center gap-1">
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
                            className="bg-[#2ea043] text-white px-3 py-2 rounded text-sm hover:bg-[#3fb950] transition flex items-center gap-1.5 font-semibold">
                            <FiBookOpen size={14} /> Read
                          </button>
                          <button onClick={() => handleDownload(book)}
                            className="bg-[#2ea043] text-white px-3 py-2 rounded text-sm hover:bg-[#3fb950] transition flex items-center gap-1.5 font-semibold">
                            <FiDownload size={14} /> Download
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handlePurchase(book)} disabled={purchaseLoading}
                          className="bg-[#2ea043] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#3fb950] transition disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5">
                          {purchaseLoading
                            ? <><FiLoader size={13} className="animate-spin" /> Processing…</>
                            : <><FiShoppingCart size={13} /> Buy · {formatPrice(book)}</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
              className={`border border-[#21262d] px-3 py-1 rounded flex items-center ${currentPage === 1 ? "text-[#6e7681] cursor-not-allowed" : "text-[#e6edf3] hover:border-[#2ea043]"}`}>
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${currentPage === page ? "bg-[#2ea043] text-white" : "border border-[#21262d] text-[#e6edf3] hover:border-[#2ea043]"}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
              className={`border border-[#21262d] px-3 py-1 rounded flex items-center ${currentPage === totalPages ? "text-[#6e7681] cursor-not-allowed" : "text-[#e6edf3] hover:border-[#2ea043]"}`}>
              <FiChevronRight size={16} />
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default Books;