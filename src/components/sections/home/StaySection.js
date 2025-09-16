'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StaySection() {
  const router = useRouter()
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStay, setSelectedStay] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [showGuestPopup, setShowGuestPopup] = useState(false)

  useEffect(() => {
    const fetchStays = async () => {
      try {
        const response = await fetch('/api/stay')
        if (!response.ok) {
          throw new Error('Failed to fetch stays')
        }
        const data = await response.json()
        setStays(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStays()
  }, [])

  // Initialize from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('bookingData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setCheckIn(parsedData.checkIn || '')
      setCheckOut(parsedData.checkOut || '')
      setAdults(parsedData.adults || 1)
      setChildren(parsedData.children || 0)
    }
  }, [])

  // Save to localStorage with timestamp
  useEffect(() => {
    const bookingData = {
      checkIn,
      checkOut,
      adults,
      children,
      timestamp: Date.now() // Add timestamp
    }
    localStorage.setItem('bookingData', JSON.stringify(bookingData))
  }, [checkIn, checkOut, adults, children])

  // Update your initialization useEffect to check expiration
  useEffect(() => {
    const savedData = localStorage.getItem('bookingData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)

      // Check if data is older than 5 minutes
      if (parsedData.timestamp && parsedData.timestamp < fiveMinutesAgo) {
        localStorage.removeItem('bookingData')
        console.log('Expired booking data removed')
      } else {
        setCheckIn(parsedData.checkIn || '')
        setCheckOut(parsedData.checkOut || '')
        setAdults(parsedData.adults || 1)
        setChildren(parsedData.children || 0)
      }
    }
  }, [])


  const getNextDay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    const bookingData = {
      checkIn,
      checkOut,
      adults,
      children,
      stayId: selectedStay._id
    };

    localStorage.setItem('bookingData', JSON.stringify(bookingData));

    router.push(`/details/${selectedStay._id}`);
    setShowBookingModal(false);
  };

  // **UPDATED: Handle card click with disabled check**
  const handleCardClick = (stay) => {
    if (stay.isDisabled) {
      // Show coming soon message for disabled stays
      alert('This accommodation is currently not available. Coming soon!');
      return;
    }
    openBookingModal(stay);
  };

  const openBookingModal = (stay) => {
    setSelectedStay(stay)
    setShowBookingModal(true)
  }

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-900">Stay Amidst Nature</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Loading accommodations...
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl overflow-hidden shadow-md bg-white animate-pulse">
              <div className="bg-gray-200 rounded-xl w-full h-56 sm:h-64 md:h-72" />
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-900">Stay Amidst Nature</h2>
          <p className="text-red-500 mt-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-900 text-white px-4 py-2 rounded-md hover:bg-green-800 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }

  // Default images based on category
  const getDefaultImage = (category) => {
    switch (category) {
      case 'tents':
        return '/Home/SatySection/tent.png';
      case 'cottages':
        return '/Home/SatySection/cottage.jpg';
      case 'villas':
        return '/Home/SatySection/villa.webp';
      default:
        return '/Home/SatySection/default.jpg';
    }
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-green-900">Stay Amidst Nature</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Tents and cottages designed for explorers
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stays.map((stay) => {
          const imageUrl = stay.images && stay.images.length > 0
            ? stay.images[0]
            : getDefaultImage(stay.category);

          return (
            <div
              key={stay._id}
              className={`rounded-xl overflow-hidden shadow-md bg-white transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer relative ${stay.isDisabled
                  ? 'grayscale opacity-70 hover:opacity-80 cursor-not-allowed'
                  : 'cursor-pointer'
                }`}
              onClick={() => handleCardClick(stay)}
            >
              <div className="relative w-full h-56 sm:h-64 md:h-72">
                <Image
                  src={imageUrl}
                  alt={stay.name}
                  fill
                  className="object-cover rounded-t-xl"
                  priority
                />

                {/* **UPDATED: Enhanced disabled overlay** */}
                {stay.isDisabled && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-transparent to-gray-900 bg-opacity-70 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2">
                        <span className="font-bold text-lg">COMING SOON</span>
                      </div>
                      <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                        Currently not available
                      </p>
                    </div>
                  </div>
                )}

                {/* **UPDATED: Conditional price badge** */}
                {!stay.isDisabled && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex justify-between items-end">
                      <h3 className="text-xl font-semibold text-white">{stay.name}</h3>
                      <span className="bg-green-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ₹{stay.price}/night
                      </span>
                    </div>
                  </div>
                )}

                {/* **NEW: Disabled stay title overlay** */}
                {stay.isDisabled && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex justify-between items-end">
                      <h3 className="text-xl font-semibold text-white opacity-75">{stay.name}</h3>
                      <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium opacity-75">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center text-gray-600 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className={`text-sm ${stay.isDisabled ? 'text-gray-400' : ''}`}>
                    Max {stay.maxGuests} {stay.maxGuests > 1 ? 'guests' : 'guest'}
                  </span>
                </div>

                <p className={`mb-4 line-clamp-2 ${stay.isDisabled ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                  {stay.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {stay.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className={`text-xs px-2 py-1 rounded ${stay.isDisabled
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {amenity}
                    </span>
                  ))}
                  {stay.amenities.length > 3 && (
                    <span className={`text-xs px-2 py-1 rounded ${stay.isDisabled
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      +{stay.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {/* **UPDATED: Conditional button rendering** */}
                {stay.isDisabled ? (
                  <button
                    className="w-full text-center bg-gray-400 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    className="w-full text-center bg-green-900 text-white px-4 py-2 rounded-md hover:bg-green-800 transition"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      openBookingModal(stay);
                    }}
                  >
                    Book Now for ₹{stay.price} →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {stays.length === 0 && !loading && (
        <div className="text-center py-10">
          <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">No accommodations available</h3>
          <p className="text-gray-600 mt-2">Check back later for new stay options</p>
        </div>
      )}

      {/* Booking Modal - Only for enabled stays */}
      {showBookingModal && selectedStay && !selectedStay.isDisabled && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-green-900">Book {selectedStay.name}</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Check-In</label>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border p-3 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Check-Out</label>
                    <input
                      type="date"
                      value={checkOut}
                      disabled={!checkIn}
                      min={getNextDay(checkIn)}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border p-3 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Guests</label>
                  <div
                    className="w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center"
                    onClick={() => setShowGuestPopup(true)}
                  >
                    <span>
                      {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-green-900 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition font-semibold"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Selection Popup */}
      {showGuestPopup && selectedStay && !selectedStay.isDisabled && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Guests ({selectedStay.maxGuests} max)</h3>
              <button
                onClick={() => setShowGuestPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium text-gray-800">Adults</h4>
                  <p className="text-sm text-gray-600">18+ years</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${adults <= 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-700 text-white hover:bg-green-800'
                      }`}
                    disabled={adults <= 1}
                  >
                    <span className="sr-only">Decrease adults</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium w-6 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(prev => prev + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${adults + children >= selectedStay.maxGuests
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-700 text-white hover:bg-green-800'
                      }`}
                    disabled={adults + children >= selectedStay.maxGuests}
                  >
                    <span className="sr-only">Increase adults</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">Children</h4>
                  <p className="text-sm text-gray-600">2-17 years</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${children <= 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-700 text-white hover:bg-green-800'
                      }`}
                    disabled={children <= 0}
                  >
                    <span className="sr-only">Decrease children</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium w-6 text-center">{children}</span>
                  <button
                    onClick={() => setChildren(prev => prev + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${adults + children >= selectedStay.maxGuests
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-700 text-white hover:bg-green-800'
                      }`}
                    disabled={adults + children >= selectedStay.maxGuests}
                  >
                    <span className="sr-only">Increase children</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuestPopup(false)}
              className="w-full bg-green-700 text-white py-2 text-sm rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
