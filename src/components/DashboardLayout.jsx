import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiUser, FiLogOut, FiBook, FiHome, FiGrid, FiSettings, 
  FiSun, FiMoon, FiMenu, FiX, FiZap, FiBookOpen, FiFileText,
  FiUpload, FiPlusCircle, FiBarChart2, FiStar
} from "react-icons/fi";
import { MdOutlineQuiz, MdOutlineLibraryBooks, MdOutlineClass, MdOutlineUpload } from "react-icons/md";
import { FaChalkboardTeacher, FaBook, FaGraduationCap } from "react-icons/fa";
import { GiBookshelf } from "react-icons/gi";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const user = (() => { 
    try { 
      return JSON.parse(localStorage.getItem("user")) || {}; 
    } catch { 
      return {}; 
    } 
  })();
  
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User";
  const userEmail = user?.email || (isTeacher ? "teacher@edulib.com" : "student@edulib.com");
  const initials = user?.firstName ? user.firstName[0].toUpperCase() : (isTeacher ? 'T' : 'S');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Navigation items based on user role
  const navItems = isTeacher ? [
    { name: "Dashboard", path: "/teacher", icon: <FiHome size={20} /> },
    { name: "My Classes", path: "/my-classes", icon: <MdOutlineClass size={20} /> },
    { name: "Resources", path: "/resources", icon: <MdOutlineLibraryBooks size={20} /> },
    { name: "Structured Tests", path: "/structured-tests", icon: <MdOutlineQuiz size={20} /> },
    { name: "Create Quiz", path: "/create-quiz", icon: <FiPlusCircle size={20} /> },
  ] : [
    { name: "Dashboard", path: "/student", icon: <FiHome size={20} /> },
    { name: "Books", path: "/books", icon: <FaBook size={20} />, hasDropdown: true },
    { name: "Past Papers", path: "/past-papers", icon: <FiFileText size={20} /> },
    { name: "Quizzes", path: "/quizzes", icon: <MdOutlineQuiz size={20} /> },
    { name: "Structured Tests", path: "/structured-tests", icon: <MdOutlineQuiz size={20} /> },
  ];

  // Quick access items for teachers (using icons instead of emojis)
  const quickAccessItems = [
    { path: "/resources", icon: <MdOutlineLibraryBooks size={18} />, label: "Resources" },
    { path: "/my-classes", icon: <MdOutlineClass size={18} />, label: "My Classes" },
    { path: "/student-progress", icon: <FiBarChart2 size={18} />, label: "Student Progress" },
    { path: "/create-quiz", icon: <FiPlusCircle size={18} />, label: "Create Quiz" },
    { path: "/upload-material", icon: <MdOutlineUpload size={18} />, label: "Upload Material" },
  ];

  const currentPath = location.pathname;
  const isActive = (path) => {
    if (path === '/books') return ['/books', '/books/premium'].includes(currentPath);
    return currentPath === path;
  };

  // Theme styles
  const themeStyles = {
    light: {
      bg: "from-gray-100 via-gray-50 to-white",
      headerBg: "bg-white/80",
      border: "border-gray-200",
      text: "text-gray-800",
      textSecondary: "text-gray-500",
      textMuted: "text-gray-400",
      navBg: "bg-white/95",
      navBorder: "border-gray-200",
      cardBg: "bg-white/50",
      hoverBg: "hover:bg-gray-100",
      activeBg: "bg-gradient-to-r from-emerald-100 to-teal-100",
      activeText: "text-emerald-700",
      activeBorder: "border-emerald-300",
      logoText: "text-gray-800",
      buttonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
      buttonSecondary: "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50",
    },
    dark: {
      bg: "from-gray-900 via-gray-900 to-gray-800",
      headerBg: "bg-gray-800/80",
      border: "border-gray-700",
      text: "text-gray-100",
      textSecondary: "text-gray-400",
      textMuted: "text-gray-500",
      navBg: "bg-gray-800/95",
      navBorder: "border-gray-700",
      cardBg: "bg-gray-800/50",
      hoverBg: "hover:bg-gray-700/50",
      activeBg: "bg-gradient-to-r from-emerald-900/40 to-teal-900/40",
      activeText: "text-emerald-400",
      activeBorder: "border-emerald-500/30",
      logoText: "text-gray-100",
      buttonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white",
      buttonSecondary: "border-gray-600 hover:border-emerald-500 hover:bg-emerald-900/20",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${currentTheme.headerBg} backdrop-blur-sm border-b ${currentTheme.border} sticky top-0 z-30 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={isTeacher ? "/teacher" : "/student"} className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <FaChalkboardTeacher size={16} className="text-white" />
              </div>
              <span className={`font-bold text-base sm:text-lg ${currentTheme.logoText} transition-colors duration-300`}>
                Edulib
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                !item.hasDropdown ? (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive(item.path)
                        ? `${currentTheme.activeBg} ${currentTheme.activeText} border ${currentTheme.activeBorder}`
                        : `${currentTheme.textSecondary} ${currentTheme.hoverBg} hover:${currentTheme.text}`
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <BooksDropdown key={item.path} currentTheme={currentTheme} isActive={isActive} />
                )
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-200 ${currentTheme.buttonSecondary} ${currentTheme.textSecondary}`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {/* Quick Access - Teacher Only */}
              {isTeacher && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsQuickAccessOpen(!isQuickAccessOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTheme.buttonPrimary}`}
                  >
                    <FiZap size={16} />
                    <span>Quick Access</span>
                  </button>
                  {isQuickAccessOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsQuickAccessOpen(false)} />
                      <div className={`absolute right-0 mt-2 w-64 ${currentTheme.navBg} border ${currentTheme.border} rounded-xl shadow-xl z-50`}>
                        <div className={`px-4 py-3 border-b ${currentTheme.border}`}>
                          <p className={`text-xs font-semibold text-emerald-500 flex items-center gap-1`}>
                            <FiZap size={12} /> QUICK ACCESS
                          </p>
                          <p className={`text-xs ${currentTheme.textMuted}`}>Jump to important sections</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {quickAccessItems.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => { navigate(item.path); setIsQuickAccessOpen(false); }}
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${currentTheme.text} ${currentTheme.hoverBg}`}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* User Menu - Desktop */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => {
                      const dropdown = document.getElementById('profile-dropdown');
                      dropdown?.classList.toggle('hidden');
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${currentTheme.hoverBg}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{initials}</span>
                    </div>
                    <span className={`text-sm font-medium ${currentTheme.text} transition-colors duration-300 max-w-[120px] truncate`}>
                      {userName}
                    </span>
                  </button>
                  <div id="profile-dropdown" className={`absolute right-0 mt-2 w-48 ${currentTheme.navBg} border ${currentTheme.border} rounded-xl shadow-xl z-50 hidden`}>
                    <div className={`px-4 py-3 border-b ${currentTheme.border}`}>
                      <p className={`text-sm font-medium ${currentTheme.text}`}>{isTeacher ? "Teacher" : "Student"} Account</p>
                      <p className={`text-xs ${currentTheme.textMuted} truncate`}>{userEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2.5 text-sm ${currentTheme.text} hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2 rounded-b-xl`}
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${currentTheme.hoverBg} ${currentTheme.textSecondary}`}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div
          className={`absolute top-0 left-0 bottom-0 w-72 ${currentTheme.navBg} backdrop-blur-sm border-r ${currentTheme.navBorder} shadow-xl transition-transform duration-300 transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className={`flex items-center justify-between p-4 border-b ${currentTheme.border}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <FaChalkboardTeacher size={14} className="text-white" />
              </div>
              <span className={`font-bold ${currentTheme.logoText}`}>Edulib</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className={`p-1 rounded-lg ${currentTheme.textSecondary}`}>
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex flex-col p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {navItems.map((item) => (
              !item.hasDropdown ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center gap-3 ${
                    isActive(item.path)
                      ? `${currentTheme.activeBg} ${currentTheme.activeText} border ${currentTheme.activeBorder}`
                      : `${currentTheme.textSecondary} ${currentTheme.hoverBg} hover:${currentTheme.text}`
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <MobileBooksDropdown key={item.path} currentTheme={currentTheme} onClose={() => setMobileMenuOpen(false)} />
              )
            ))}
            
            {/* Teacher Quick Access in Mobile */}
            {isTeacher && (
              <>
                <div className={`my-3 border-t ${currentTheme.border}`} />
                <div className="px-3 py-2">
                  <p className={`text-xs font-semibold text-emerald-500 flex items-center gap-1 mb-2`}>
                    <FiZap size={12} /> QUICK ACCESS
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickAccessItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${currentTheme.text} ${currentTheme.hoverBg}`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div className={`my-3 border-t ${currentTheme.border}`} />
            
            <div className={`px-3 py-3 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FiUser size={16} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${currentTheme.text}`}>{userName}</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>{userEmail}</p>
                  <p className={`text-xs ${currentTheme.textMuted}`}>{isTeacher ? "Teacher" : "Student"}</p>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-8 transition-colors duration-300">
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 640px) {
          .container { padding-left: 0.75rem; padding-right: 0.75rem; }
        }
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          button, a { min-height: 44px; }
        }
      `}</style>
    </div>
  );
};

// Books Dropdown Component for Desktop
const BooksDropdown = ({ currentTheme, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => navigate('/books')}
        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
          isActive('/books')
            ? `${currentTheme.activeBg} ${currentTheme.activeText} border ${currentTheme.activeBorder}`
            : `${currentTheme.textSecondary} ${currentTheme.hoverBg} hover:${currentTheme.text}`
        }`}
      >
        <FaBook size={20} />
        <span>Books</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-50 overflow-hidden"
          style={{ backgroundColor: currentTheme.navBg, borderColor: currentTheme.border }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Link to="/books" onClick={() => setIsOpen(false)} className={`block px-4 py-2 text-sm transition-colors flex items-center gap-2 ${currentTheme.text} ${currentTheme.hoverBg}`}>
            <GiBookshelf size={16} /> Free Books
          </Link>
          <Link to="/books/premium" onClick={() => setIsOpen(false)} className={`block px-4 py-2 text-sm transition-colors flex items-center gap-2 ${currentTheme.text} ${currentTheme.hoverBg}`}>
            <FiStar size={16} /> Premium Books
          </Link>
        </div>
      )}
    </div>
  );
};

// Books Dropdown for Mobile
const MobileBooksDropdown = ({ currentTheme, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-between ${
          currentTheme.textSecondary
        } ${currentTheme.hoverBg}`}
      >
        <div className="flex items-center gap-3">
          <FaBook size={20} />
          <span>Books</span>
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="ml-6 pl-4 space-y-1 border-l-2 border-emerald-500/30">
          <Link to="/books" onClick={onClose} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${currentTheme.textSecondary} ${currentTheme.hoverBg}`}>
            <GiBookshelf size={16} /> Free Books
          </Link>
          <Link to="/books/premium" onClick={onClose} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${currentTheme.textSecondary} ${currentTheme.hoverBg}`}>
            <FiStar size={16} /> Premium Books
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;