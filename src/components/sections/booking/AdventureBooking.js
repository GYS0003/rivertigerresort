'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdventureBooking = () => {
  const [bookingData, setBookingData] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // New states for payment processing popups
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Get booking ID from URL
    const path = window.location.pathname.split('/');
    const bookingId = path[path.length - 1];

    // Check for existing token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }

    // Fetch booking data from API
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/adventure/prebooking?id=${bookingId}`);
        if (!res.ok) throw new Error('Failed to fetch booking');

        const data = await res.json();
        console.log('Fetched booking data:', data);
        setBookingData(data.booking);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.message);
      }
    };

    if (bookingId) {
      fetchBooking();
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

  const handlePayment = async () => {
    try {
      // Show processing modal
      setIsProcessingPayment(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessingPayment(false);
        alert("Failed to load Razorpay SDK");
        return;
      }

      const res = await fetch('/api/adventure/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingData._id
        }),
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
        name: 'Adventure Booking',
        description: 'Adventure Experience',
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/adventure/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...response,
              bookingId: bookingData._id
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
            alert(result.message || 'Payment verification failed');
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
          }
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
      setError(err.message);
    }
  };

  const handlePaymentFailure = async (response, reason, description, errorCode = null, orderId = null) => {
    try {
      const failureRes = await fetch('/api/adventure/payment/failure', {
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
      } else {
        console.error('Failed to record payment failure:', result.message);
      }
    } catch (error) {
      console.error('Error recording payment failure:', error);
    }
  };

 

  // Comprehensive Payment Success Page
  if (paymentSuccess && paymentDetails) {
    console.log('Rendering payment success with:', paymentDetails);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-4">

            <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
            <p className="text-lg text-green-700">Your adventure booking has been confirmed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Booking & Adventure Details */}
            <div className="space-y-6">
              {/* Booking Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Booking Information</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Booking ID:</span>
                    <span className="text-gray-800 ">{paymentDetails.booking?._id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Adventure Date:</span>
                    <span className="text-gray-800 ">
                      {paymentDetails.booking?.adventureDate ?
                        new Date(paymentDetails.booking.adventureDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Booking Status:</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                      {paymentDetails.booking?.paymentStatus || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Customer Email:</span>
                    <span className="text-gray-800 font-semibold">{paymentDetails.booking?.userEmail || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Adventure Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Adventure Details</h2>
                </div>

                <div className="space-y-4">
                  {paymentDetails.booking?.items && Array.isArray(paymentDetails.booking.items) && paymentDetails.booking.items.length > 0 ?
                    paymentDetails.booking.items.map((item, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-blue-800 text-sm">{item.name || item.title}</h3>
                            <p className="text-blue-600 mt-1 text-sm">
                              {item.count} person{item.count > 1 ? 's' : ''} × ₹{item.pricePerPerson} per person
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-800">₹{item.total}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-2">No adventure items found</p>
                    )
                  }
                </div>
              </div>
            </div>

            {/* Right Column - Payment Details & Actions */}
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Payment ID:</span>
                    <span className="text-gray-800 font-mono text-sm">
                      {paymentDetails.booking?.razorpay_payment_id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Order ID:</span>
                    <span className="text-gray-800 font-mono text-sm">
                      {paymentDetails.booking?.razorpay_orderId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Payment Date:</span>
                    <span className="text-gray-800 font-semibold">
                      {paymentDetails.booking?.paidAt ?
                        new Date(paymentDetails.booking.paidAt).toLocaleString('en-IN') : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-amber-50 rounded-lg px-4 mt-4">
                    <span className="text-amber-800 font-bold text-lg">Total Amount Paid:</span>
                    <span className="text-amber-800 font-bold text-xl">₹{paymentDetails.booking?.totalAmount || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Important Information</h2>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-1 mt-0.5">✓</span>
                    <span>Confirmation email has been sent to your registered email address</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-1 mt-0.5">✓</span>
                    <span>Please arrive 15 minutes before your scheduled adventure time</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-1 mt-0.5">✓</span>
                    <span>Carry a valid government-issued photo ID for verification</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-1 mt-0.5">✓</span>
                    <span>Wear comfortable clothes and closed-toe shoes</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}

            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Thank You for Choosing Our Adventures!</h3>
              <p className="text-gray-600">
               {`We're excited to provide you with an amazing adventure experience.
                Have a great time and create unforgettable memories!`}
              </p>
            </div>
          </div>
          <div className=" flex justify-between items-center mt-2 gap-4 w-full">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition font-bold text-lg shadow-lg"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => {
                // Add functionality to download/print receipt
                window.print();
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-lg"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (!bookingData) {
    return <div className="text-center p-8">Loading adventure details...</div>;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-3">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Compact Header */}
          <div className="bg-green-900 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Booking Summary
                </h2>
                <p className="text-gray-300 text-xs mt-1">Review your selection</p>
              </div>
              {/* <div className="text-right">
                <p className="text-gray-300 text-xs">Step 2 of 3</p>
                <div className="w-12 bg-gray-700 rounded-full h-1.5 mt-1">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div> */}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Adventure Date */}
            {bookingData.adventureDate && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-1.5 bg-gray-200 rounded-md mr-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Adventure Date</h3>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(bookingData.adventureDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Adventures */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Selected Adventures
                </h4>
                {bookingData.items && bookingData.items.length > 0 && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    {bookingData.items.length} item{bookingData.items.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {bookingData.items && Array.isArray(bookingData.items) && bookingData.items.length > 0 ?
                  bookingData.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                            <h5 className="font-medium text-gray-900 text-sm">{item.name}</h5>
                          </div>
                          <div className="flex items-center text-gray-600 text-xs space-x-3">
                            <div className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                              </svg>
                              <span>{item.count} person{item.count > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center">
                             
                              <span>₹{item.pricePerPerson} each</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">₹{item.total}</div>
                          <div className="text-xs text-gray-500">
                            {item.count} × ₹{item.pricePerPerson}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No Adventures Selected</h3>
                      <p className="text-xs text-gray-600">Please go back and select adventures</p>
                    </div>
                  )
                }
              </div>
            </div>

            {/* Total Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                {/* <div> */}
                  <p className="text-xl font-bold text-gray-600">Total Amount</p>
                  <p className="text-xl text-right font-bold text-gray-900">₹{bookingData.totalAmount || 0}</p>
                  {/* <p className="text-xs text-gray-500">
                    {bookingData.items ? bookingData.items.reduce((acc, item) => acc + item.count, 0) : 0} participant{bookingData.items && bookingData.items.reduce((acc, item) => acc + item.count, 0) !== 1 ? 's' : ''}
                  </p> */}
                {/* </div> */}
                {/* <div className="text-right">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Ready
                  </div>
                </div> */}
              </div>
            </div>

            {/* Payment Button */}
            <div className="pt-2">
              <button
                onClick={handlePayment}
                disabled={!bookingData.items || !Array.isArray(bookingData.items) || bookingData.items.length === 0 || isProcessingPayment}
                className={`
            w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300
            ${isProcessingPayment
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : !bookingData.items || !Array.isArray(bookingData.items) || bookingData.items.length === 0
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-900 hover:bg-green-800 text-white shadow-md hover:shadow-lg'
                  }
            flex items-center justify-center space-x-2
          `}
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              
            </div>
          </div>

          {/* Compact Error Message */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Payment Processing Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600 text-center">
              Please wait while we initialize your payment...
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdventureBooking;
