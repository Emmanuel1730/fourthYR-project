
import React from "react";
import { FaHeart } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Malawi Edulib System. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            Made with <FaHeart size={10} className="text-red-400" /> for education in Malawi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;