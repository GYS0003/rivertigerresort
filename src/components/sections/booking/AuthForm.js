// components/AuthForm.jsx
import React, { useState } from 'react';

// SVG icons for a polished look
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
  </svg>
);


const AuthForm = ({ onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  // Default to login form
  const [isExistingUser, setIsExistingUser] = useState(true); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      setIsLoading(false);
      return;
    }
    if (!isExistingUser && !name.trim()) {
      setError('Full name is required for signup');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isExistingUser ? 'login-send-otp' : 'send-otp';
      const body = isExistingUser ? { email } : { name, email };
      const res = await fetch(`/api/user/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setIsOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic OTP validation
    if (!otp.trim() || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP.');
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      onAuthSuccess(data.token);
      setError('');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formTitle = isExistingUser ? 'Welcome Back!' : 'Create an Account';
  const formSubtitle = isExistingUser 
    ? 'Log in to continue.' 
    : 'Sign up to get started.';

  return (
    <div className="flex items-center justify-center min-h-screen  px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white border border-gray-400 rounded-xl shadow-lg">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{formTitle}</h2>
            <p className="mt-2 text-sm text-gray-600">{formSubtitle}</p>
        </div>
        
        <form className="space-y-6" onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
          {!isOtpSent ? (
            // == Initial Form: Name and Email ==
            <div className="space-y-4">
              {!isExistingUser && (
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 sr-only">Full Name</label>
                  <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon />
                     </div>
                     <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 pl-10 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Full Name"
                        disabled={isLoading}
                     />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 sr-only">Email</label>
                 <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MailIcon />
                     </div>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 pl-10 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="you@example.com"
                        disabled={isLoading}
                    />
                 </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            // == OTP Verification Form ==
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                An OTP has been sent to <strong>{email}</strong>.
              </p>
              <div>
                <label htmlFor="otp" className="text-sm font-medium text-gray-700 sr-only">Enter OTP</label>
                <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 text-center tracking-[0.5em] font-semibold text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="_ _ _ _ _ _"
                    maxLength={6}
                    disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-center font-medium text-red-600">{error}</p>}
        </form>

        {!isOtpSent && (
             <p className="mt-6 text-center text-sm text-gray-600">
                {isExistingUser ? "Don't have an account? " : "Already have an account? "}
                <button
                    onClick={() => setIsExistingUser(!isExistingUser)}
                    className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                >
                    {isExistingUser ? 'Sign Up' : 'Log In'}
                </button>
             </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;