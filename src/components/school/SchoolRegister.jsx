import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiAlertCircle, FiArrowLeft, FiArrowRight, FiCreditCard, FiMail, FiPhone, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi';
import { MdSchool, MdLocationOn, MdPhone, MdEmail, MdLock } from 'react-icons/md';

// ─── CONFIG — change LOGIN_PATH to match your actual route ──────────────────
const LOGIN_PATH  = '/';
const API_BASE    = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const PAYCHANGU_API = 'https://api.paychangu.com/payment';

// ── Form Field Component ──────────────────────────────────────────────────────
const Field = ({ label, required, error, icon: Icon, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon size={12} className="text-emerald-400" />}
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <FiAlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const inputCls = 'w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 transition-all duration-200';

// ── Step Indicator Component ─────────────────────────────────────────────────
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((step, idx) => (
      <React.Fragment key={step.number}>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              currentStep === step.number
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : currentStep > step.number
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-gray-700/50 text-gray-500 border border-gray-600'
            }`}
          >
            {currentStep > step.number ? <FiCheck size={16} /> : step.number}
          </div>
          <span
            className={`text-xs font-medium hidden sm:block ${
              currentStep === step.number ? 'text-emerald-400' : 'text-gray-500'
            }`}
          >
            {step.label}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div
            className={`flex-1 h-0.5 max-w-[60px] rounded-full transition-all duration-300 ${
              currentStep > step.number ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-700'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ── Loading Spinner ──────────────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2">
    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    <span>Loading...</span>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function SchoolRegister() {
  const [searchParams] = useSearchParams();

  const urlStep       = searchParams.get('step');
  const urlStatus     = searchParams.get('status');
  const urlTxRef      = searchParams.get('tx_ref');
  const urlSchoolName = searchParams.get('school') ?? '';

  const [step, setStep]         = useState(urlStep === 'result' ? 3 : 1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [fee, setFee]           = useState(null);
  const [schoolId, setSchoolId] = useState(null);

  const [details, setDetails]           = useState({ name: '', location: '', phone: '' });
  const [detailErrors, setDetailErrors] = useState({});
  const [email, setEmail]               = useState('');
  const [emailError, setEmailError]     = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/school/registration-fee`)
      .then((r) => r.json())
      .then((d) => setFee(d))
      .catch(() => {});
  }, []);

  const validateDetails = () => {
    const errs = {};
    if (!details.name.trim())     errs.name = 'School name is required';
    if (!details.location.trim()) errs.location = 'Location is required';
    if (!details.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?\d{7,15}$/.test(details.phone.replace(/\s/g, ''))) {
      errs.phone = 'Enter a valid phone number';
    }
    setDetailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!validateDetails()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/school/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message ?? 'Registration failed');
      }
      const school = await res.json();
      setSchoolId(school.id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = () => {
    if (!email.trim())                { setEmailError('Email is required');   return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Enter a valid email'); return false; }
    setEmailError('');
    return true;
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setLoading(true);
    setError(null);

    try {
      const backendRes = await fetch(`${API_BASE}/school/${schoolId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!backendRes.ok) {
        const d = await backendRes.json().catch(() => ({}));
        throw new Error(d?.message ?? 'Could not prepare payment');
      }

      const { secretKey, payload } = await backendRes.json();

      if (!secretKey || !payload) {
        throw new Error('Invalid response from server');
      }

      const pcRes = await fetch(PAYCHANGU_API, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await pcRes.json();

      if (data?.status === 'success' && data?.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        throw new Error(data?.message ?? 'PayChangu did not return a checkout URL');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const schoolLabel = urlSchoolName || details.name || 'Your school';

  const resultConfig = {
    success: {
      icon: '🎉',
      title: 'Registration Complete!',
      message: `${schoolLabel} has been successfully registered and activated. You can now log in and start using the platform.`,
      color: '#10b981', bg: 'from-emerald-500/20 to-teal-500/20', border: 'emerald-500/30',
      action: { label: 'Go to Login', path: '/' },
    },
    pending: {
      icon: '⏳',
      title: 'Payment Pending',
      message: 'Your payment is being processed. Your school will be activated automatically once confirmed — this usually takes a few minutes.',
      color: '#fbbf24', bg: 'from-amber-500/20 to-orange-500/20', border: 'amber-500/30',
      action: { label: 'Back to Home', path: '/' },
    },
    failed: {
      icon: '❌',
      title: 'Payment Failed',
      message: 'Your payment did not go through. No charges were made. Please try again.',
      color: '#f87171', bg: 'from-red-500/20 to-pink-500/20', border: 'red-500/30',
      action: { label: 'Try Again', path: '/school/register' },
    },
    error: {
      icon: '⚠️',
      title: 'Something Went Wrong',
      message: 'We could not confirm your payment. Please contact support if you were charged.',
      color: '#f87171', bg: 'from-red-500/20 to-pink-500/20', border: 'red-500/30',
      action: { label: 'Back to Home', path: '/' },
    },
  };

  const result = resultConfig[urlStatus] ?? resultConfig.error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/25">
            <MdSchool size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            School Registration
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Register your school to access the online library platform
          </p>
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <StepIndicator 
            currentStep={step} 
            steps={[
              { number: 1, label: 'School Details' },
              { number: 2, label: 'Payment' },
            ]}
          />
        )}

        {/* Step 1: School Details */}
        {step === 1 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-200 mb-5 flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <MdSchool size={14} className="text-emerald-400" />
              </div>
              School Information
            </h2>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                <FiAlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <Field label="School Name" required error={detailErrors.name} icon={MdSchool}>
                <input
                  type="text"
                  value={details.name}
                  onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Kamuzu Academy"
                  className={inputCls}
                  disabled={loading}
                />
              </Field>

              <Field label="Location" required error={detailErrors.location} icon={MdLocationOn}>
                <input
                  type="text"
                  value={details.location}
                  onChange={(e) => setDetails((d) => ({ ...d, location: e.target.value }))}
                  placeholder="e.g. Lilongwe, Malawi"
                  className={inputCls}
                  disabled={loading}
                />
              </Field>

              <Field label="Phone Number" required error={detailErrors.phone} icon={MdPhone}>
                <input
                  type="tel"
                  value={details.phone}
                  onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="e.g. +265 999 000 000"
                  className={inputCls}
                  disabled={loading}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 mt-2 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner /> : <><FiArrowRight size={14} /> Continue to Payment</>}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              Already registered?{' '}
              <button
                onClick={() => { window.location.href = LOGIN_PATH; }}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Log in here
              </button>
            </p>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-200 mb-1 flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FiCreditCard size={14} className="text-emerald-400" />
              </div>
              Registration Fee
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              A one-time registration fee is required to activate your school account.
            </p>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                <FiAlertCircle size={14} /> {error}
              </div>
            )}

            {/* Fee Summary Card */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <MdSchool size={14} /> School
                </span>
                <span className="text-sm text-gray-200 font-medium">{details.name}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <MdLocationOn size={14} /> Location
                </span>
                <span className="text-sm text-gray-200">{details.location}</span>
              </div>
              <div className="border-t border-gray-700 my-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-200">Registration Fee</span>
                <span className="text-xl font-bold text-emerald-400">
                  {fee ? `MWK ${fee.amount.toLocaleString()}` : <LoadingSpinner />}
                </span>
              </div>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <Field label="Contact Email" required error={emailError} icon={MdEmail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourschool.com"
                  className={inputCls}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The payment receipt will be sent to this address.
                </p>
              </Field>

              <button
                type="submit"
                disabled={loading || !fee}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner /> : <><FiDollarSign size={14} /> Pay MWK {fee?.amount?.toLocaleString()}</>}
              </button>
            </form>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
            >
              <FiArrowLeft size={12} /> Back to school details
            </button>

            {/* Test Mode Notice */}
            <div className="mt-5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-400 flex items-start gap-2">
                <MdLock size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Test mode:</strong> Use card <span className="font-mono">4242 4242 4242 4242</span>, 
                  expiry <span className="font-mono">12/30</span>, CVC <span className="font-mono">123</span>, 
                  OTP <span className="font-mono">1234</span>
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className={`bg-gradient-to-br ${result.bg} backdrop-blur-sm border rounded-2xl p-8 text-center shadow-xl animate-fadeIn`} style={{ borderColor: result.border }}>
            <div className="text-6xl mb-4">{result.icon}</div>
            <h2 className="text-xl font-bold mb-3" style={{ color: result.color }}>
              {result.title}
            </h2>
            <p className="text-sm text-gray-300 mb-5">{result.message}</p>

            {urlTxRef && (
              <p className="text-xs text-gray-400 mb-5">
                Reference: <span className="font-mono text-gray-200">{urlTxRef}</span>
              </p>
            )}

            <button
              onClick={() => { window.location.href = result.action.path; }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all transform hover:scale-[1.02]"
              style={{ backgroundColor: result.color }}
            >
              {result.action.label}
            </button>

            {urlStatus === 'failed' && (
              <button
                onClick={() => { window.location.href = '/school/register'; }}
                className="w-full mt-3 py-2.5 rounded-xl text-xs text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-200 transition-all"
              >
                Start over
              </button>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}