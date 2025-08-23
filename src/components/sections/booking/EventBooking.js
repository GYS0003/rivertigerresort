'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const EventBooking = () => {
  const [bookingData, setBookingData] = useState(null);
  const [token, setToken] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  
  // Enhanced loading states
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  
  // Failure handling states
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureDetails, setFailureDetails] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
      const path = window.location.pathname.split('/');
      const bookingId = path[path.length - 1];

      if (!bookingId) {
        setError('No booking ID found');
        return;
      }

      try {
        const res = await fetch(`/api/event/prebooking?id=${bookingId}`, {
          method: 'GET',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch booking');
        }
        setBookingData({
          _id: data.booking._id,
          title: data.booking.items.title,
          description: data.booking.items.description || '',
          eventDate: data.booking.eventDate,
          startingPrice: data.booking.items.price,
          totalAmount: data.booking.totalAmount,
          paymentStatus: data.booking.paymentStatus,
          paymentId: data.booking.paymentId,
        });
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.message);
      }

      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    };

    fetchBooking();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentFailure = async (response, reason, description, errorCode = null, orderId = null) => {
    try {
      const failureRes = await fetch('/api/event/payment/failure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingData._id,
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
          eventTitle: bookingData.title,
          totalAmount: bookingData.totalAmount
        });
      } else {
        console.error('Failed to record payment failure:', result.message);
      }
    } catch (error) {
      console.error('Error recording payment failure:', error);
    }
  };

  const handleBookNow = async () => {
    setError('');
    setPaymentFailed(false);
    
    try {
      // Step 1: Initialize payment
      setIsInitializingPayment(true);
      
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Failed to load payment gateway. Please try again.');
        setIsInitializingPayment(false);
        return;
      }

      const orderRes = await fetch('/api/event/payment/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({bookingId: bookingData._id, totalAmount: bookingData.totalAmount }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || 'Payment initiation failed');
      }

      const { order, bookingId } = await orderRes.json();
      
      // Step 2: Payment processing
      setIsInitializingPayment(false);
      setIsPaying(true);

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'River Tiger Resort',
        description: bookingData.title,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Step 3: Payment verification
            setIsPaying(false);
            setIsVerifyingPayment(true);
            
            const verifyRes = await fetch('/api/event/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              setIsVerifyingPayment(false);
              await handlePaymentFailure(
                response,
                'Payment verification failed',
                verifyData.message,
                null,
                order.id
              );
              setPaymentFailed(true);
              setError(verifyData.message || 'Payment verification failed');
              return;
            }

            setPaymentDetails({
              ...response,
              booking: verifyData.booking,
            });
            setPaymentSuccess(true);
            setIsVerifyingPayment(false);
            localStorage.removeItem('bookedEvents');
          } catch (err) {
            console.error('Payment verification error:', err);
            setIsVerifyingPayment(false);
            await handlePaymentFailure(
              response,
              'Payment verification failed',
              err.message,
              null,
              order.id
            );
            setPaymentFailed(true);
            setError(`Payment verification failed: ${err.message}`);
          }
        },
        theme: {
          color: '#163B2A',
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            handlePaymentFailure(
              null,
              'Payment cancelled by user',
              'User closed payment modal',
              null,
              order.id
            );
            setPaymentFailed(true);
            setError('Payment was cancelled');
          }
        }
      });

      razorpay.on('payment.failed', async (response) => {
        setIsPaying(false);
        await handlePaymentFailure(
          response,
          'Payment failed',
          response.error.description,
          response.error.code,
          order.id
        );
        setPaymentFailed(true);
        setError(`Payment failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (err) {
      console.error('Booking failed:', err);
      setIsInitializingPayment(false);
      setIsPaying(false);
      await handlePaymentFailure(
        null,
        'Payment initialization failed',
        err.message,
        null,
        null
      );
      setPaymentFailed(true);
      setError(err.message || 'An error occurred during payment processing');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Payment Failed Screen
  if (paymentFailed && failureDetails) {
    return (
      <div className="min-h-screen bg-amber-50 py-6 px-3">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-800 mb-1">Payment Failed</h1>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Event Information</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Event:</span>
                  <span className="text-gray-900 font-medium text-xs">{failureDetails.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Booking ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{failureDetails.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Amount:</span>
                  <span className="text-gray-900 font-medium text-xs">₹{failureDetails.totalAmount}</span>
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

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-3">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-center">
          {error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 font-medium text-sm">{error}</p>
              </div>
              <button
                onClick={() => router.push('/event')}
                className="mt-4 w-full bg-green-900 text-white py-2 rounded-lg hover:bg-green-800 text-sm"
              >
                Browse Events
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900 mx-auto mb-4"></div>
              <p className="text-gray-700 text-sm">Loading event details...</p>
            </>
          )}
        </div>
      </div>
    );
  }



  // Payment Success Screen
  if (paymentSuccess && paymentDetails && paymentDetails.booking) {
    return (
      <div className="min-h-screen bg-amber-50 py-6 px-3">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-4">
            {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div> */}
            <h1 className="text-xl font-bold text-green-800 mb-1">Payment Successful!</h1>
            <p className="text-sm text-green-700">Your event booking has been confirmed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Event Details */}
            <div className="space-y-3">
              {/* Event Information */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-3">
                  <div className="p-1.5 bg-green-100 rounded-md mr-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Event Details</h2>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Event:</span>
                    <span className="text-gray-800 font-semibold text-xs">{paymentDetails.booking.items.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Event Date:</span>
                    <span className="text-gray-800 font-semibold text-xs">
                      {bookingData.eventDate ? new Date(bookingData.eventDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-xs">Status:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                      {paymentDetails.booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-600 font-medium text-xs">Booking ID:</span>
                    <span className="text-gray-800 font-mono text-xs">{paymentDetails.booking._id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Details */}
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
                    <span className="text-gray-800 font-mono text-xs">{paymentDetails.booking.razorpay_payment_id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-amber-50 rounded-lg px-3 mt-3">
                    <span className="text-amber-800 font-bold text-sm">Total Paid:</span>
                    <span className="text-amber-800 font-bold text-lg">₹{paymentDetails.booking.totalAmount}</span>
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
                  className="w-full bg-green-900 text-white py-2.5 px-4 rounded-lg hover:bg-green-800 transition font-medium text-sm shadow-md flex items-center justify-center"
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

  return (
    <>
      <div className="min-h-screen bg-amber-50 flex items-start justify-center p-3">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-green-900 text-white p-3">
              <h1 className="text-sm font-semibold">Confirm Event Booking</h1>
              <p className="text-gray-300 text-xs">Review your booking details</p>
            </div>

            <div className="p-3 space-y-3">
              {/* Event Details */}
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <h3 className="text-gray-800 font-medium text-sm mb-1.5">{bookingData.title}</h3>
                {bookingData.description && (
                  <p className="text-gray-600 text-xs mb-2">{bookingData.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">Event Date</p>
                    <p className="font-medium text-xs">
                      {bookingData.eventDate ? new Date(bookingData.eventDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Not specified'}
                    </p>
                  </div>
                  
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="text-sm font-semibold text-green-900">
                      ₹{bookingData.startingPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Total:</span>
                  <span className="font-bold text-base text-green-900">₹{bookingData.totalAmount}</span>
                </div>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-red-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-red-800 text-xs">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Payment Button */}
              <button
                onClick={handleBookNow}
                disabled={isInitializingPayment || isPaying || isVerifyingPayment}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 px-3 rounded-lg transition font-medium flex items-center justify-center text-sm"
              >
                {isInitializingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initializing...
                  </>
                ) : isPaying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : isVerifyingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
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
        </div>
      </div>

      {/* Payment Initialization Loading Modal */}
      {isInitializingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center max-w-xs mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900 mb-3"></div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Initializing Payment</h3>
            <p className="text-gray-600 text-center text-xs">
              Setting up secure payment gateway...
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-900 h-1.5 rounded-full animate-pulse" style={{width: '30%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {isPaying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center max-w-xs mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Processing Payment</h3>
            <p className="text-gray-600 text-center text-xs">
              Please complete payment in the popup window...
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center max-w-xs mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Verifying Payment</h3>
            <p className="text-gray-600 text-center text-xs">
              Confirming your payment details...
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-600 h-1.5 rounded-full animate-pulse" style={{width: '90%'}}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventBooking;
