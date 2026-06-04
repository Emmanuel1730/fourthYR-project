import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiArrowRight } from "react-icons/fi";
import { MdOutlineLibraryBooks } from "react-icons/md";

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

const PaymentResult = () => {
  const isDark = useTheme();
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const status     = params.get("status");
  const txRef      = params.get("tx_ref");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); navigate("/books/premium"); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, status]);

  const config = {
    success: {
      Icon: FiCheckCircle,
      title: "Payment Successful!",
      message: "Your book has been unlocked. You can now read and download it.",
      gradient: "from-emerald-600 to-teal-500",
      heroBg:  isDark ? "from-emerald-600/20 to-teal-600/20" : "from-emerald-50 to-teal-50",
      border:  isDark ? "border-emerald-500/30" : "border-emerald-200",
      color:   isDark ? "text-emerald-400" : "text-emerald-600",
      btnGrad: "from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600",
      shadow:  "shadow-emerald-500/25",
    },
    pending: {
      Icon: FiClock,
      title: "Payment Pending",
      message: "Your payment is still being processed. Check back in a moment — your book will unlock automatically once confirmed.",
      gradient: "from-amber-500 to-orange-500",
      heroBg:  isDark ? "from-amber-600/20 to-orange-600/20" : "from-amber-50 to-orange-50",
      border:  isDark ? "border-amber-500/30" : "border-amber-200",
      color:   isDark ? "text-amber-400" : "text-amber-600",
      btnGrad: "from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600",
      shadow:  "shadow-amber-500/25",
    },
    failed: {
      Icon: FiXCircle,
      title: "Payment Failed or Cancelled",
      message: "Your payment was not completed. No charges were made. You can try again anytime.",
      gradient: "from-red-500 to-rose-500",
      heroBg:  isDark ? "from-red-600/20 to-rose-600/20" : "from-red-50 to-rose-50",
      border:  isDark ? "border-red-500/30" : "border-red-200",
      color:   isDark ? "text-red-400" : "text-red-600",
      btnGrad: "from-red-600 to-red-500 hover:from-red-500 hover:to-red-600",
      shadow:  "shadow-red-500/25",
    },
    error: {
      Icon: FiAlertCircle,
      title: "Something Went Wrong",
      message: "We could not process your payment result. Please contact support if you were charged.",
      gradient: "from-red-500 to-rose-500",
      heroBg:  isDark ? "from-red-600/20 to-rose-600/20" : "from-red-50 to-rose-50",
      border:  isDark ? "border-red-500/30" : "border-red-200",
      color:   isDark ? "text-red-400" : "text-red-600",
      btnGrad: "from-red-600 to-red-500 hover:from-red-500 hover:to-red-600",
      shadow:  "shadow-red-500/25",
    },
  };

  const ui = config[status] ?? config.error;

  const pageBg   = isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 via-white to-gray-100";
  const txCard   = isDark ? "bg-gray-900/60 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-700";
  const txLabel  = isDark ? "text-gray-500" : "text-gray-400";
  const msgColor = isDark ? "text-gray-400" : "text-gray-500";
  const countColor = ui.color;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${pageBg}`}>
      <div className="w-full max-w-md">
        <div className={`relative overflow-hidden bg-gradient-to-r ${ui.heroBg} border ${ui.border} rounded-2xl p-8 text-center backdrop-blur-sm shadow-2xl`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative">
            {/* Icon */}
            <div className={`w-16 h-16 bg-gradient-to-br ${ui.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${ui.shadow}`}>
              <ui.Icon size={30} className="text-white" />
            </div>

            <h1 className={`text-2xl font-bold mb-3 ${ui.color}`}>{ui.title}</h1>
            <p className={`text-sm mb-6 leading-relaxed ${msgColor}`}>{ui.message}</p>

            {txRef && (
              <div className={`border rounded-xl px-4 py-3 mb-6 text-left font-mono ${txCard}`}>
                <p className={`text-xs mb-1 ${txLabel}`}>Transaction Reference</p>
                <p className="text-sm">{txRef}</p>
              </div>
            )}

            <p className={`text-xs mb-6 ${txLabel}`}>
              Redirecting to books in <span className={`font-bold ${countColor}`}>{countdown}s</span>…
            </p>

            <button onClick={() => navigate("/books/premium")}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${ui.btnGrad} transition-all flex items-center justify-center gap-2 shadow-lg ${ui.shadow}`}>
              <MdOutlineLibraryBooks size={16} /> Go to Books Now <FiArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;