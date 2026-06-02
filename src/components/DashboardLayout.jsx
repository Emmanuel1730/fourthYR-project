import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiBook, FiHome, FiGrid, FiSettings } from "react-icons/fi";
import { MdOutlineQuiz, MdOutlineLibraryBooks } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return {}; } })();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = isTeacher ? [
    { name: "Dashboard", path: "/teacher", icon: <FiHome size={18} /> },
    { name: "My Classes", path: "/my-classes", icon: <FiGrid size={18} /> },
    { name: "Resources", path: "/resources", icon: <MdOutlineLibraryBooks size={18} /> },
    { name: "Structured Tests", path: "/structured-tests", icon: <MdOutlineQuiz size={18} /> },
    { name: "Create Quiz", path: "/create-quiz", icon: <MdOutlineQuiz size={18} /> },
  ] : [
    { name: "Dashboard", path: "/student", icon: <FiHome size={18} /> },
    { name: "Resources", path: "/resources", icon: <MdOutlineLibraryBooks size={18} /> },
    { name: "Structured Tests", path: "/structured-tests", icon: <MdOutlineQuiz size={18} /> },
  ];

  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={isTeacher ? "/teacher" : "/student"} className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <FaChalkboardTeacher size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-200">Malawi Edulib</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentPath === item.path
                      ? "bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FiUser size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-300 hidden sm:inline">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 md:hidden z-30">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
                currentPath === item.path
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;