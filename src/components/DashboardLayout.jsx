import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiBook, FiHome, FiGrid, FiSettings, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { MdOutlineQuiz, MdOutlineLibraryBooks } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return {}; } })();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User";

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

  const navItems = isTeacher ? [
    { name: "Dashboard", path: "/teacher", icon: <FiHome size={20} /> },
    { name: "My Classes", path: "/my-classes", icon: <FiGrid size={20} /> },
    { name: "Resources", path: "/resources", icon: <MdOutlineLibraryBooks size={20} /> },
    { name: "Structured Tests", path: "/structured-tests", icon: <MdOutlineQuiz size={20} /> },
    { name: "Create Quiz", path: "/create-quiz", icon: <MdOutlineQuiz size={20} /> },
  ] : [
    { name: "Dashboard", path: "/student", icon: <FiHome size={20} /> },
    { name: "Resources", path: "/resources", icon: <MdOutlineLibraryBooks size={20} /> },
    { name: "Structured Tests", path: "/structured-tests", icon: <MdOutlineQuiz size={20} /> },
  ];

  const currentPath = window.location.pathname;

  // Theme styles
  const themeStyles = {
    light: {
      bg: "from-gray-100 via-gray-50 to-white",
      headerBg: "bg-white/80",
      border: "border-gray-200",
      text: "text-gray-800",
      textSecondary: "text-gray-500",
      navBg: "bg-white/95",
      navBorder: "border-gray-200",
      cardBg: "bg-white/50",
      hoverBg: "hover:bg-gray-100",
      activeBg: "bg-gradient-to-r from-emerald-100 to-teal-100",
      activeText: "text-emerald-700",
      activeBorder: "border-emerald-300",
      logoText: "text-gray-800",
    },
    dark: {
      bg: "from-gray-900 via-gray-900 to-gray-800",
      headerBg: "bg-gray-800/80",
      border: "border-gray-700",
      text: "text-gray-100",
      textSecondary: "text-gray-400",
      navBg: "bg-gray-800/95",
      navBorder: "border-gray-700",
      cardBg: "bg-gray-800/50",
      hoverBg: "hover:bg-gray-700/50",
      activeBg: "bg-gradient-to-r from-emerald-900/40 to-teal-900/40",
      activeText: "text-emerald-400",
      activeBorder: "border-emerald-500/30",
      logoText: "text-gray-100",
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
            <Link to={isTeacher ? "/teacher" : "/student"} className="flex items-center gap-2 group">
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
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentPath === item.path
                      ? `${currentTheme.activeBg} ${currentTheme.activeText} border ${currentTheme.activeBorder}`
                      : `${currentTheme.textSecondary} ${currentTheme.hoverBg} hover:${currentTheme.text}`
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Right Section - Theme Toggle & User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-200 ${currentTheme.hoverBg} ${currentTheme.textSecondary} hover:${currentTheme.text}`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {/* User Menu - Desktop */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <FiUser size={14} className="text-white" />
                  </div>
                  <span className={`text-sm font-medium ${currentTheme.text} transition-colors duration-300`}>
                    {userName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-xl transition-all duration-200 ${currentTheme.textSecondary} hover:text-red-500 hover:bg-red-500/10`}
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
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
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-72 ${currentTheme.navBg} backdrop-blur-sm border-r ${currentTheme.navBorder} shadow-xl transition-transform duration-300 transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Sidebar Header */}
          <div className={`flex items-center justify-between p-4 border-b ${currentTheme.border}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <FaChalkboardTeacher size={14} className="text-white" />
              </div>
              <span className={`font-bold ${currentTheme.logoText}`}>Edulib</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`p-1 rounded-lg ${currentTheme.textSecondary}`}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center gap-3 ${
                  currentPath === item.path
                    ? `${currentTheme.activeBg} ${currentTheme.activeText} border ${currentTheme.activeBorder}`
                    : `${currentTheme.textSecondary} ${currentTheme.hoverBg} hover:${currentTheme.text}`
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Divider */}
            <div className={`my-3 border-t ${currentTheme.border}`} />
            
            {/* Mobile User Info & Logout */}
            <div className={`px-3 py-3 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FiUser size={16} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${currentTheme.text}`}>{userName}</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>
                    {isTeacher ? "Teacher" : "Student"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Alternative for quick access) */}
      <nav className={`fixed bottom-0 left-0 right-0 ${currentTheme.navBg} backdrop-blur-sm border-t ${currentTheme.navBorder} lg:hidden z-30 transition-colors duration-300`}>
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                currentPath === item.path
                  ? currentTheme.activeText
                  : currentTheme.textSecondary
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.name.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 lg:pb-0 transition-colors duration-300">
        {children}
      </main>

      {/* Add smooth scrolling and responsive styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .container {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Better touch targets on mobile */
        @media (max-width: 768px) {
          button, a {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;