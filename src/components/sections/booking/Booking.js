// app/booking/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Booking = () => {
  const [bookingData, setBookingData] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

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
          console.log('Booking data received:', data); // Debug log
          setBookingData(data.booking);
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
    }
  }, []);

  // **UPDATED: Helper function to get selected meals info**
  const getSelectedMeals = (booking) => {
    const meals = [];
    if (booking.breakfastPrice && booking.breakfastPrice > 0) {
      meals.push({
        name: 'Breakfast',
        price: booking.breakfastPrice,
        total: booking.breakfastPrice * (booking.adults + booking.children) * booking.numNights
      });
    }
    if (booking.lunchPrice && booking.lunchPrice > 0) {
      meals.push({
        name: 'Lunch',
        price: booking.lunchPrice,
        total: booking.lunchPrice * (booking.adults + booking.children) * booking.numNights
      });
    }
    if (booking.dinnerPrice && booking.dinnerPrice > 0) {
      meals.push({
        name: 'Dinner',
        price: booking.dinnerPrice,
        total: booking.dinnerPrice * (booking.adults + booking.children) * booking.numNights
      });
    }
    return meals;
  };

  // **UPDATED: Helper function to calculate meal total**
  const getMealTotal = (booking) => {
    const meals = getSelectedMeals(booking);
    return meals.reduce((total, meal) => total + meal.total, 0);
  };

  // **ADDED: Helper function to calculate stay price**
  const getStayPrice = (booking) => {
    const mealTotal = getMealTotal(booking);
    const addonTotal = booking.addons?.reduce((total, addon) => total + (addon.totalPrice || addon.pricePerPerson * addon.participants), 0) || 0;
    return booking.totalPrice - mealTotal - addonTotal;
  };

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
              email: bookingData.userEmail,
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
          email: bookingData.userEmail,
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

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    localStorage.removeItem('bookingData');
    router.push('/');
  };

  // Payment Success Screen
  if (paymentSuccess && paymentDetails) {
    const selectedMeals = getSelectedMeals(paymentDetails.booking);
    const stayPrice = paymentDetails.booking.totalPrice - getMealTotal(paymentDetails.booking) - (paymentDetails.booking.addons?.reduce((total, addon) => total + addon.totalPrice, 0) || 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-2 sm:py-4 lg:py-6 px-2 sm:px-3 lg:px-4">
        <div className="max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-4 sm:mb-6">

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-1 sm:mb-2">Payment Successful!</h1>
            <p className="text-sm sm:text-base text-green-700">{`Your booking has been confirmed. Here's your receipt:`}</p>
          </div>

          {/* **RESPONSIVE INVOICE-STYLE CARD** */}
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl border border-gray-200 overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">River Tiger Resort</h2>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs sm:text-sm text-green-100">Booking ID</p>
                  <p className="font-mono text-sm sm:text-base lg:text-lg font-semibold break-all sm:break-normal">
                    {paymentDetails.booking._id}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Stay Information Section */}
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-4 pb-2 border-b-2 border-green-200 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span className="text-sm sm:text-base lg:text-xl">Accommodation Details</span>
                </h3>

                <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
                  <div className="grid grid-cols-1  gap-3 sm:gap-4 lg:gap-6">
                    <div className="col-span-1 sm:col-span-2 xl:col-span-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Property</label>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 break-words">{paymentDetails.booking.stayName}</p>
                    </div>
                    <div className='flex justify-between'>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Check-in</label>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                        {new Date(paymentDetails.booking.checkIn).toLocaleDateString('en-GB', {
                          weekday: window.innerWidth < 640 ? undefined : 'short',
                          day: 'numeric',
                          month: 'short',
                          year: window.innerWidth < 640 ? '2-digit' : 'numeric'
                        })}
                      </p>
                    </div>
                    <div className='flex justify-between'>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Check-out</label>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                        {new Date(paymentDetails.booking.checkOut).toLocaleDateString('en-GB', {
                          weekday: window.innerWidth < 640 ? undefined : 'short',
                          day: 'numeric',
                          month: 'short',
                          year: window.innerWidth < 640 ? '2-digit' : 'numeric'
                        })}
                      </p>
                    </div>
                    <div className='flex justify-between'>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Duration</label>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">{paymentDetails.booking.numNights} night(s)</p>
                    </div>
                    <div className='flex justify-between'>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Guests</label>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                        {paymentDetails.booking.adults} Adults, {paymentDetails.booking.children} Children
                      </p>
                    </div>
                    <div className='flex justify-between'>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Email</label>
                      <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 truncate max-w-full">
                        {paymentDetails.booking.userEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown Section */}
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-4 pb-2 border-b-2 border-blue-200 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-sm sm:text-base lg:text-xl">Payment Breakdown</span>
                </h3>

                <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
                  {/* Stay Cost */}
                  <div className="flex flex-row justify-between items-center  py-3 border-b border-blue-200 space-y-1 sm:space-y-0">
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800">Accommodation</p>
                      <p className="text-xs sm:text-sm text-gray-600">{paymentDetails.booking.numNights} nights</p>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-800">₹{stayPrice}</p>
                  </div>

                  {/* Meals Section */}
                  {selectedMeals.length > 0 && (
                    <div className="py-2 sm:py-3 border-b border-blue-200">
                      <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">Meals</p>
                      <div className="space-y-2">
                        {selectedMeals.map((meal, index) => (
                          <div key={index} className="flex flex-row justify-between items-center space-y-0">
                            <div className="flex-1">
                              <p className="text-sm sm:text-base font-medium text-gray-700">{meal.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                ₹{meal.price} × {paymentDetails.booking.adults + paymentDetails.booking.children} guests × {paymentDetails.booking.numNights} days
                              </p>
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-gray-800 self-start sm:self-center">₹{meal.total}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-ons Section */}
                  {paymentDetails.booking.addons?.length > 0 && (
                    <div className="py-2 sm:py-3 border-b border-blue-200">
                      <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">Adventure Add-ons</p>
                      <div className="space-y-2">
                        {paymentDetails.booking.addons.map((addon, index) => (
                          <div key={index} className="flex flex-row justify-between items-center space-y-0">
                            <div className="flex-1">
                              <p className="text-sm sm:text-base font-medium text-gray-700">{addon.title}</p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {addon.participants} participant(s) × ₹{addon.pricePerPerson}
                              </p>
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-gray-800 self-start sm:self-center">₹{addon.totalPrice}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Section */}
                  <div className="pt-3 sm:pt-4">
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 sm:p-4 border-2 border-green-300">
                      <div className="flex flex-row justify-between items-center space-y-2 ">
                        <div>
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Total Amount Paid</p>
                          <p className="text-xs sm:text-sm text-gray-600">All taxes included</p>
                        </div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">₹{paymentDetails.booking.totalPrice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information Section */}
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-4 pb-2 border-b-2 border-purple-200 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="text-sm sm:text-base lg:text-xl">Transaction Details</span>
                </h3>

                <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="lg:col-span-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Payment ID</label>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-gray-800 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded  break-all">
                        {paymentDetails.booking.paymentId}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Transaction Status</label>
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-800">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {paymentDetails.booking.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Payment Date</label>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {new Date().toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: window.innerWidth < 640 ? '2-digit' : 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
                  <button
                    onClick={handlePrint}
                    className="flex-1 bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-blue-700 transition font-semibold text-sm sm:text-base lg:text-lg shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    <span className="hidden xs:inline sm:hidden md:inline">Download Receipt</span>
                    <span className="xs:hidden sm:inline md:hidden">Receipt</span>
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="flex-1 bg-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-green-700 transition font-semibold text-sm sm:text-base lg:text-lg shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span className="hidden xs:inline sm:hidden md:inline">Return to Home</span>
                    <span className="xs:hidden sm:inline md:hidden">Home</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600 px-2">
              Thank you for choosing River Tiger Resort. We look forward to hosting you!
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2 px-2">
              For any queries, please contact us with your booking ID.
            </p>
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

  // **UPDATED: Calculate pricing for display**
  const selectedMeals = getSelectedMeals(bookingData);
  const mealTotal = getMealTotal(bookingData);
  const stayPrice = getStayPrice(bookingData);
  const addonTotal = bookingData.addons?.reduce((total, addon) => total + (addon.totalPrice || addon.pricePerPerson * addon.participants), 0) || 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-4 px-3">
        <div className="max-w-2xl mx-auto">
          {/* **ENHANCED: Header Section with Logo** */}
          <div className="text-center mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">River Tiger Resort</h1>
                  <p className="text-sm text-gray-600">Complete Your Booking</p>
                </div>
              </div>
            </div>
          </div>

          {/* **ENHANCED: Booking Summary Card** */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
              <h2 className="text-lg font-bold">Booking Summary</h2>
              <p className="text-green-100 text-sm">Review your reservation details</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Stay Details */}
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-green-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    {bookingData.stayName}
                  </h3>
                  <span className="text-lg font-bold text-green-700">₹{stayPrice}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Check-in:</span>
                    <p className="font-medium">{new Date(bookingData.checkIn).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Check-out:</span>
                    <p className="font-medium">{new Date(bookingData.checkOut).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{bookingData.numNights} night(s)</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Guests:</span>
                    <p className="font-medium">{bookingData.adults} Adults, {bookingData.children} Children</p>
                  </div>
                </div>
              </div>

              {/* Meals Section - Only show if meals exist */}
              {selectedMeals.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                    Selected Meals
                  </h3>
                  <div className="space-y-2">
                    {selectedMeals.map((meal, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-orange-200 last:border-b-0">
                        <div>
                          <p className="font-medium text-orange-800">{meal.name}</p>
                          <p className="text-xs text-orange-600">₹{meal.price} × {bookingData.adults + bookingData.children} guests × {bookingData.numNights} nights</p>
                        </div>
                        <span className="font-bold text-orange-700">₹{meal.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Section - Only show if addons exist */}
              {bookingData.addons && bookingData.addons.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                    </svg>
                    Adventure Add-ons
                  </h3>
                  <div className="space-y-2">
                    {bookingData.addons.map((addon, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-blue-200 last:border-b-0">
                        <div>
                          <p className="font-medium text-blue-800">{addon.title}</p>
                          <p className="text-xs text-blue-600">{addon.participants} participant(s)</p>
                        </div>
                        <span className="font-bold text-blue-700">₹{addon.totalPrice || addon.pricePerPerson * addon.participants}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Section */}
              <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">₹{bookingData.totalPrice}</span>
                </div>
                <p className="text-xs text-gray-600">Inclusive of all taxes and fees</p>
              </div>
            </div>
          </div>



          {/* **ENHANCED: Payment Button** */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl transition font-bold flex items-center justify-center text-lg shadow-lg"
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Pay ₹{bookingData.totalPrice} Securely
                  </>
                )}
              </button>

              <div className="flex items-center justify-center mt-4">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span className="text-sm text-gray-600">256-bit SSL Encrypted & Secure</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Processing Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600 text-center mb-4">
              Please wait while we securely process your payment...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Booking;
