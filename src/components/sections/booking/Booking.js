// app/booking/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from './AuthForm';

const Booking = () => {
  const [bookingData, setBookingData] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  
  // New states for loading and failure
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureDetails, setFailureDetails] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    // Get booking ID from URL path
    const path = window.location.pathname;
    const parts = path.split('/');
    const bookingId = parts[2]; // Assumes URL structure: /booking/[id]

    // Fetch booking data
    if (bookingId) {
      fetch(`/api/stay/prebooking?id=${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Booking not found');
          return res.json();
        })
        .then(data => {
          setBookingData(data);
        })
        .catch(err => {
          console.error('Error fetching booking:', err);
          setError('Booking not found or invalid ID');
        });
    }

    // Check for existing token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsOtpVerified(true);
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentFailure = async (response, reason, description, errorCode = null, orderId = null) => {
    try {
      const failureRes = await fetch('/api/payment/failure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingID: bookingData._id,
          razorpay_order_id: orderId,
          razorpay_payment_id: response?.razorpay_payment_id || null,
          razorpay_signature: response?.razorpay_signature || null,
          failureReason: reason,
          errorDescription: description,
          errorCode: errorCode
        }),
      });

      const result = await failureRes.json();
      if (failureRes.ok) {
        console.log('Payment failure recorded:', result);
        setFailureDetails({
          reason: reason,
          description: description,
          bookingId: bookingData._id,
          stayName: bookingData.stayName,
          totalPrice: bookingData.totalPrice
        });
      } else {
        console.error('Failed to record payment failure:', result.message);
      }
    } catch (error) {
      console.error('Error recording payment failure:', error);
    }
  };

  const handlePayment = async () => {
    try {
      // Show processing modal
      setIsProcessingPayment(true);
      setPaymentFailed(false);
      setError('');

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessingPayment(false);
        alert("Failed to load Razorpay SDK");
        return;
      }

      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingPrice: bookingData.totalPrice }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsProcessingPayment(false);
        throw new Error(data.message || 'Payment initiation failed');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'River Tiger Resort',
        description: bookingData.stayName,
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...response,
              email: bookingData.email,
              bookingID: bookingData._id,
            }),
          });

          const result = await verifyRes.json();
          if (verifyRes.ok) {
            setIsProcessingPayment(false);
            setPaymentDetails(result);
            setPaymentSuccess(true);
          } else {
            setIsProcessingPayment(false);
            await handlePaymentFailure(
              response,
              'Payment verification failed',
              result.message,
              null,
              data.order.id
            );
            setPaymentFailed(true);
            setError(result.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            handlePaymentFailure(
              null,
              'Payment cancelled by user',
              'User closed payment modal',
              null,
              data.order.id
            );
            setPaymentFailed(true);
            setError('Payment was cancelled');
          }
        },
        prefill: {
          email: bookingData.email,
          name: bookingData.name,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', async function (response) {
        setIsProcessingPayment(false);
        await handlePaymentFailure(
          response,
          'Payment failed',
          response.error.description,
          response.error.code,
          data.order.id
        );
        setPaymentFailed(true);
        setError('Payment failed. Please try again.');
      });

      rzp.open();
    } catch (err) {
      setIsProcessingPayment(false);
      await handlePaymentFailure(
        null,
        'Payment initialization failed',
        err.message,
        null,
        null
      );
      setPaymentFailed(true);
      setError(err.message);
    }
  };

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setIsOtpVerified(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    localStorage.removeItem('bookingData');
    router.push('/');
  };

  // Payment Success Screen
  if (paymentSuccess && paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-6 px-3">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-4">
            {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div> */}
            <h1 className="text-2xl font-bold text-green-800 mb-1">Payment Successful!</h1>
            <p className="text-sm text-green-700">Your stay booking has been confirmed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Booking Details */}
            <div className="space-y-3">
              {/* Stay Information */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-3">
                  <div className="p-1.5 bg-green-100 rounded-md mr-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Stay Details</h2>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Property:</span>
                    <span className="text-gray-800 font-semibold text-xs">{paymentDetails.booking.stayName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Check-in:</span>
                    <span className="text-gray-800 font-semibold text-xs">
                      {new Date(paymentDetails.booking.checkIn).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Check-out:</span>
                    <span className="text-gray-800 font-semibold text-xs">
                      {new Date(paymentDetails.booking.checkOut).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Duration:</span>
                    <span className="text-gray-800 font-semibold text-xs">{paymentDetails.booking.numNights} night(s)</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-600 font-medium text-xs">Guests:</span>
                    <span className="text-gray-800 font-semibold text-xs">
                      {paymentDetails.booking.adults} Adults, {paymentDetails.booking.children} Children
                    </span>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              {paymentDetails.booking.addons?.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-3">
                    <div className="p-1.5 bg-blue-100 rounded-md mr-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Add-on Adventures</h2>
                  </div>

                  <div className="space-y-2">
                    {paymentDetails.booking.addons.map((addon, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3">
                        <h3 className="font-bold text-blue-800 text-sm">{addon.title}</h3>
                        <p className="text-blue-600 text-xs">
                          {addon.participants} participant(s) × ₹{addon.pricePerPerson} = ₹{addon.totalPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment & Contact Details */}
            <div className="space-y-3">
              {/* Payment Details */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-3">
                  <div className="p-1.5 bg-amber-100 rounded-md mr-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Payment ID:</span>
                    <span className="text-gray-800 font-mono text-xs">
                      {paymentDetails.booking.paymentId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Booking ID:</span>
                    <span className="text-gray-800 font-mono text-xs">
                      {paymentDetails.booking._id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Status:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                      {paymentDetails.booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-amber-50 rounded-lg px-3 mt-3">
                    <span className="text-amber-800 font-bold text-sm">Total Paid:</span>
                    <span className="text-amber-800 font-bold text-lg">₹{paymentDetails.booking.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-3">
                  <div className="p-1.5 bg-purple-100 rounded-md mr-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Contact Information</h2>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-600 font-medium text-xs">Email:</span>
                    <span className="text-gray-800 font-semibold text-xs">{paymentDetails.booking.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handlePrint}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-md flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Print Receipt
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition font-medium text-sm shadow-md flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Failed Screen
  if (paymentFailed && failureDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-6 px-3">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-1">Payment Failed</h1>
            <p className="text-sm text-red-700">Unfortunately, your payment could not be processed</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Failure Details</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 font-medium text-xs">{failureDetails.reason}</p>
                {failureDetails.description && (
                  <p className="text-red-600 text-xs mt-1">{failureDetails.description}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Booking Information</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Property:</span>
                  <span className="text-gray-900 font-medium text-xs">{failureDetails.stayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Booking ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{failureDetails.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Amount:</span>
                  <span className="text-gray-900 font-medium text-xs">₹{failureDetails.totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setPaymentFailed(false);
                  setFailureDetails(null);
                  setError('');
                }}
                className="w-full bg-blue-600 text-white py-2.5 px-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                Try Payment Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-600 text-white py-2.5 px-3 rounded-lg hover:bg-gray-700 transition font-medium text-sm"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) return <div className="text-center p-6 text-sm">Loading booking details...</div>;

  return (
    <>
      <div className="max-w-xl mx-auto p-3">
        {!isOtpVerified ? (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-green-900 text-white p-3">
              <h2 className="text-sm font-semibold">Order Summary</h2>
              <p className="text-gray-300 text-xs">Review your booking details</p>
            </div>

            <div className="p-3 space-y-3">
              {/* Stay Details */}
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-medium text-xs">{bookingData.stayName}</h3>
                  <span className="text-xs font-semibold">₹{bookingData.stayPrice * bookingData.numNights}</span>
                </div>
                <p className="text-gray-600 text-xs">
                  {bookingData.numNights} night(s) • {bookingData.adults} Adults • {bookingData.children} Children
                </p>
                <p className="text-xs text-gray-500">
                  ₹{bookingData.stayPrice} × {bookingData.numNights} nights
                </p>
              </div>

              {/* Add-ons */}
              {bookingData.addons && bookingData.addons.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-medium text-xs">Add-ons:</h4>
                  {bookingData.addons.map((addon, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{addon.title} ({addon.participants} participants)</span>
                        <span className="text-xs font-semibold">₹{addon.pricePerPerson * addon.participants}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Total:</span>
                  <span className="font-bold text-base text-green-900">₹{bookingData.totalPrice}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 px-3 rounded-lg transition font-medium flex items-center justify-center text-sm"
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-3 h-3 text-red-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-800 text-xs">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Processing Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center max-w-xs mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Processing Payment</h3>
            <p className="text-gray-600 text-center text-xs">
              Please wait while we initialize your payment...
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Booking;
