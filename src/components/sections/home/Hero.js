'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomCategory, setRoomCategory] = useState('');
  const [roomOptions, setRoomOptions] = useState([]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch room options from API
  useEffect(() => {
    const fetchRoomOptions = async () => {
      try {
        const response = await fetch('/api/stay?list=true');
        const data = await response.json();
        setRoomOptions(data);
        setIsLoading(false);

        // Initialize from localStorage if available
        const savedData = localStorage.getItem('bookingData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setRoomCategory(parsedData.roomCategory || (data.length > 0 ? data[0]._id : ''));
        } else if (data.length > 0) {
          setRoomCategory(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching room options:', error);
        setIsLoading(false);
      }
    };

    fetchRoomOptions();
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('bookingData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setCheckIn(parsedData.checkIn || '');
      setCheckOut(parsedData.checkOut || '');
      setAdults(parsedData.adults || 1);
      setChildren(parsedData.children || 0);
    }
  }, []);

  // Adjust guests when room category changes
  useEffect(() => {
    if (!roomCategory || roomOptions.length === 0) return;
    
    const selectedRoom = roomOptions.find(option => option._id === roomCategory);
    if (!selectedRoom) return;

    const maxGuests = selectedRoom.maxGuests;
    const totalGuests = adults + children;

    if (totalGuests > maxGuests) {
      // Reset to max capacity (minimum 1 adult)
      const newAdults = Math.min(adults, maxGuests);
      const newChildren = maxGuests - newAdults;
      setAdults(newAdults);
      setChildren(newChildren);
    }
  }, [roomCategory, roomOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage only on submit
    const bookingData = { checkIn, checkOut, roomCategory, adults, children };
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    router.push(`/details/${roomCategory}`);
  };

  // Get max guests for current room
  const getMaxGuests = () => {
    if (!roomCategory || roomOptions.length === 0) return 0;
    const selectedRoom = roomOptions.find(option => option._id === roomCategory);
    return selectedRoom ? selectedRoom.maxGuests : 0;
  };

  const totalGuests = adults + children;
  const maxGuests = getMaxGuests();
  
  const getNextDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Capitalize the first letter of a string
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <Image
        src="/Home/Banner.jpg"
        alt="Nature background"
        fill
        priority
        className="object-cover object-center z-0"
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center px-4 py-12 md:py-22 bg-black/40">
        {/* Heading Section */}
        <div className="text-center mb-6 md:mb-10 max-w-3xl px-4">
          <h1 className="text-amber-100 text-3xl sm:text-4xl  font-bold leading-tight md:leading-snug">
            Reconnect with Nature at River Tiger
          </h1>
          <p className="text-amber-100 mt-4 text-base sm:text-lg md:text-xl max-w-2xl">
            Experience luxury camping in the heart of untouched wilderness
          </p>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-green-900 bg-opacity-90 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md md:max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            {/* Check-in */}
            <div>
              <label className="block text-gray-100 mb-1 text-sm md:text-base">Check-In</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border p-2 sm:p-3 bg-amber-100 rounded-lg text-sm md:text-base"
                required
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-gray-100 mb-1 text-sm md:text-base">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                disabled={checkIn === ''}
                min={getNextDay(checkIn)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border p-2 sm:p-3 bg-amber-100 rounded-lg text-sm md:text-base"
                required
              />
            </div>

            {/* Accommodation Dropdown */}
            <div className="col-span-1">
              <label className="block text-gray-100 mb-1 text-sm md:text-base">Accommodation</label>
              {isLoading ? (
                <div className="w-full border p-2 sm:p-3 bg-amber-100 rounded-lg text-sm md:text-base animate-pulse">
                  Loading accommodation options...
                </div>
              ) : (
                <select
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                  className="w-full border p-2 sm:p-3 bg-amber-100 rounded-lg text-sm md:text-base"
                  required
                >
                  <option value="">Select Accommodation</option>
                  {roomOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {capitalize(option.category)} ({option.maxGuests} guests)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Guests - Triggers popup */}
            <div className="col-span-1">
              <label className="block text-gray-100 mb-1 text-sm md:text-base">Guests</label>
              <div
                className="w-full border p-2 sm:p-3 bg-amber-100 rounded-lg text-sm md:text-base cursor-pointer flex justify-between items-center"
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

          {/* Guest Selection Popup */}
          {showGuestPopup && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-sm p-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-medium font-bold text-gray-800">Guests ({maxGuests} max)</h3>
                  <button
                    onClick={() => setShowGuestPopup(false)}
                    className="text-gray-500 bg-amber-200 p-1 rounded hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Adults Section */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">Adults</h4>
                      <p className="text-xs text-gray-600">18+ years</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) =>{e.stopPropagation()
                           setAdults(prev => Math.max(1, prev - 1))
                          }}
                          type='button'
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${adults <= 1
                          ? 'bg-gray-200 text-gray-400 cursor-pointer'
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
                      type='button'
                        onClick={(e) =>{e.stopPropagation() 
                          setAdults(prev => prev + 1)}}
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${totalGuests >= maxGuests
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-green-700 text-white hover:bg-green-800'
                          }`}
                        disabled={totalGuests >= maxGuests}
                      >
                        <span className="sr-only">Increase adults</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Children Section */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h4 className="font-semibold text-sm  text-gray-800">Children</h4>
                      <p className="text-xs text-gray-600">2-17 years</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                      type='button'
                        onClick={(e) => setChildren(prev => Math.max(0, prev - 1))}
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${children <= 0
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
                      type='button'
                        onClick={() => setChildren(prev => prev + 1)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${totalGuests >= maxGuests
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-green-700 text-white hover:bg-green-800'
                          }`}
                        disabled={totalGuests >= maxGuests}
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

          <button
            type="submit"
            className="w-full mt-6 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition text-sm sm:text-base md:text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Loading Options...' : 'SEARCH AVAILABILITY'}
          </button>
        </form>

        {/* Info Icons */}
        <div className="mt-8 text-center text-white max-w-2xl px-4">
          <p className="text-sm sm:text-base mb-2">
            Need assistance? Call us at <span className="font-semibold">+91 9389 303576</span>
          </p>
         
        </div>
      </div>
    </div>
  );
}