/* ── components/LoginSignup.jsx ───────────────────────────── */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* SVG helpers */
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
       className="w-5 h-5 text-gray-400">
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
       className="w-5 h-5 text-gray-400">
    <path fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z"
          clipRule="evenodd"/>
  </svg>
);

export default function LoginSignup() {
  const router = useRouter();

  /* form state */
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [otp,   setOtp]   = useState('');

  /* UI helpers */
  const [isExistingUser, setIsExistingUser] = useState(true);
  const [isOtpSent,      setIsOtpSent]      = useState(false);
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(false);

  /* --- send OTP --------------------------------------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim())                   return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(email))     return setError('Invalid email');
    if (!isExistingUser && !name.trim()) return setError('Full name is required');

    setLoading(true);
    try {
      const endpoint = isExistingUser ? 'login-send-otp' : 'send-otp';
      const body     = isExistingUser ? { email }        : { name, email };
      const res  = await fetch(`/api/user/${endpoint}`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setIsOtpSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* --- verify OTP -------------------------------------------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) return setError('Enter the 6-digit OTP');

    setLoading(true);
    try {
      const res  = await fetch('/api/user/verify-otp', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      localStorage.setItem('token', data.token);
      router.push('/my-bookings');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  /* --- markup ------------------------------------------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">

        {/* header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isExistingUser ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {isExistingUser ? 'Log in to continue.' : 'Sign up to get started.'}
          </p>
        </div>

        {/* form */}
        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
          {/* STEP-1 */}
          {!isOtpSent && (
            <>
              {/* full name (signup) */}
              {!isExistingUser && (
                <div className="relative">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon />
                     </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* email */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MailIcon />
                     </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-12 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* send OTP */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>

              {/* toggle */}
              <p className="text-center text-sm text-gray-600">
                {isExistingUser ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  className="text-indigo-600 hover:underline"
                  onClick={() => { setIsExistingUser(!isExistingUser); setError(''); }}
                >
                  {isExistingUser ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </>
          )}

          {/* STEP-2 */}
          {isOtpSent && (
            <>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                className="w-full py-3 text-center tracking-[0.4em] border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
            </>
          )}

          {error && <p className="text-center text-red-600 text-sm font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
}
