'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

const DetailMain = () => {
    const router = useRouter();
    const { id } = useParams();
    const [stay, setStay] = useState(null);
    const [adventures, setAdventures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [numNights, setNumNights] = useState(1);
    const [adventuresLoading, setAdventuresLoading] = useState(true);
    const [noAdults, setNoAdults] = useState(1);
    const [noChildren, setNoChildren] = useState(0);
    const [stayPrice, setStayPrice] = useState(0);
    const [showAllAdventures, setShowAllAdventures] = useState(false);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    // Calculate total price whenever components change
    useEffect(() => {
        let calculatedTotal = stayPrice * numNights;

        Object.values(selectedAddons).forEach(addon => {
            calculatedTotal += addon.pricePerPerson * addon.participants;
        });

        setTotalPrice(calculatedTotal);
    }, [stayPrice, numNights, selectedAddons]);

    // Booking details from localStorage
    useEffect(() => {
        const booking = JSON.parse(localStorage.getItem('bookingData'));
        if (booking) {
            setNoAdults(booking.adults || 1);
            setNoChildren(booking.children || 0);

            const checkInDate = new Date(booking.checkIn);
            const checkOutDate = new Date(booking.checkOut);
            setCheckInDate(checkInDate);
            setCheckOutDate(checkOutDate);
            if (!isNaN(checkInDate) && !isNaN(checkOutDate)) {
                const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                setNumNights(nights > 0 ? nights : 1);
            }
        }
    }, []);

    const [showAddonModal, setShowAddonModal] = useState(false);
    const [activeAddon, setActiveAddon] = useState(null);
    const [modalCount, setModalCount] = useState(1);

    const openAddonModal = (addon) => {
        setActiveAddon(addon);
        setModalCount(selectedAddons[addon.id]?.participants || 1);
        setShowAddonModal(true);
    };

    const closeAddonModal = () => {
        setShowAddonModal(false);
        setActiveAddon(null);
        setModalCount(1);
    };

    const handleModalAdd = () => {
        if (activeAddon) {
            const count = parseInt(modalCount) || 0;
            // Ensure count does not exceed max
            const maxCount = activeAddon.maxParticipants || 0;
            const finalCount = Math.max(0, Math.min(count, maxCount));
            if (finalCount > 0) {
                handleAddonChange(activeAddon, finalCount);
            }
            closeAddonModal();
        }
    };

    // Fetch stay details and adventures
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setAdventuresLoading(true);

            try {
                // Fetch stay details
                const stayResponse = await fetch(`/api/stay?id=${id}`);
                if (!stayResponse.ok) throw new Error('Failed to fetch stay details');
                const stayData = await stayResponse.json();
                setStay(stayData);
                setStayPrice(stayData.price); // Set stay price per night

                // Fetch adventures
                const adventuresResponse = await fetch('/api/adventure');
                if (!adventuresResponse.ok) throw new Error('Failed to fetch adventures');
                const adventuresData = await adventuresResponse.json();
                setAdventures(adventuresData);

                setLoading(false);
                setAdventuresLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                setAdventuresLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddonChange = (addon, participants) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addon.id]: { ...addon, participants },
        }));
    };

 const handleBookNow = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    
    const bookingData = {
      stayId: id,
      stayName: stay?.name,
      adults: noAdults,
      children: noChildren,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      addons: Object.values(selectedAddons)
        .filter(a => a.participants > 0)
        .map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          pricePerPerson: a.pricePerPerson,
          participants: a.participants,
        })),
      userId: userInfo._id,
      userEmail: userInfo.email,
      phone: userInfo.phone,
    };

    const res = await fetch('/api/stay/prebooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/booking/${data.booking._id}`);
    } else {
      console.error('Booking failed:', await res.json());
    }
  } catch (error) {
    console.error('Booking error:', error);
  }
};



    const getDefaultImage = (category) => {
        switch (category) {
            case 'tents': return '/Home/SatySection/tent.png';
            case 'cottages': return '/Home/SatySection/cottage.jpg';
            case 'villas': return '/Home/SatySection/villa.webp';
            default: return '/Home/SatySection/default.jpg';
        }
    };

    if (loading) return (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700 mx-auto"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-10 px-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block max-w-md">
                <p className="font-medium">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-3 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition text-sm"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    if (!stay) return (
        <div className="text-center py-10 px-4">
            <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg inline-block max-w-md">
                <p className="font-medium">Stay not found</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-3 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition text-sm"
                >
                    Browse Accommodations
                </button>
            </div>
        </div>
    );

    const mainImage = stay.images?.length > 0
        ? stay.images[0]
        : getDefaultImage(stay.category);

    return (
        <>
            <div className="max-w-4xl mx-auto  sm:px-4 py-4 text-[#1f3c2e]">
                {/* Breadcrumb */}
                <div className='p-2'>
                <div className="mb-4 text-xs sm:text-sm text-gray-600">
                    <button onClick={() => router.back()} className="text-green-700 hover:underline">
                        ← Back to Accommodations
                    </button>
                </div>

                {/* Stay Header */}
                <div className="text-center mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-green-900">{stay.name}</h1>
                    <div className="mt-1">
                        <div className="bg-green-700 text-white px-2 py-1 rounded-full text-xs font-medium inline-block">
                            {stay.category.charAt(0).toUpperCase() + stay.category.slice(1)}
                        </div>
                    </div>
                </div>

                {/* Guest Info */}
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                    <h2 className="text-sm sm:text-base font-semibold text-green-800 mb-2">Your Booking Details</h2>
                    <div className="flex text-xs sm:text-sm">
                        <div className="mr-2">
                            <span className="font-medium">Adults:</span> {noAdults}
                        </div >
                        <div className="mr-2">
                            <span className="font-medium">Children:</span> {noChildren}
                        </div>
                        <div>
                            <span className="font-medium">Total Days:</span> {numNights}
                        </div>
                    </div>
                </div>

                {/* Main Image */}
                {mainImage && (
                    <div className="relative w-full h-40 sm:h-52 md:h-64 rounded-lg overflow-hidden shadow-md mb-4">
                        <Image
                            src={mainImage}
                            alt={stay.name}
                            fill
                            className="object-cover rounded-t-xl"
                            priority
                        />
                    </div>
                )}

                {/* Stay Info */}
                <div className="mb-3">
                    <h2 className="text-sm sm:text-base font-semibold text-green-800 mb-2">Description</h2>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3">{stay.description}</p>

                    <h2 className="text-sm sm:text-base font-semibold text-green-800 mb-2">{`What's Included`}</h2>
                    <ul className="space-y-1 mb-3">
                        {stay.specialNotes && (
                            <li className="flex items-start">
                                <svg className="h-4 w-4 text-green-700 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs sm:text-sm">{stay.specialNotes}</span>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Amenities */}
                <div className="py-2 mb-4">
                    <h2 className="text-sm sm:text-base font-semibold text-green-800 mb-2">Amenities</h2>
                    <div className="flex flex-wrap gap-1">
                        {stay.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center bg-green-800 px-2 py-1 rounded text-xs sm:text-sm">
                                <span className="text-gray-100">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </div>

</div>


                {/* Add-ons */}
                <div className="p-2 sm:p-3 bg-amber-100 rounded-t-lg shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4 text-green-900">
                        Explore Adventure Add-ons
                    </h2>

                    {adventuresLoading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-700 mx-auto"></div>
                        </div>
                    ) : adventures.length === 0 ? (
                        <div className="text-center py-4 text-gray-600 text-sm">
                            No adventures available at this time
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {adventures.slice(0, showAllAdventures ? adventures.length : 2).map((adventure) => {
                                const currentCount = selectedAddons[adventure._id]?.participants || 0;

                                // Calculate max participants based on activity restrictions
                                let maxParticipants;
                                if (adventure.ageRestricted) {
                                    // For 18+ activities, max is number of adults
                                    maxParticipants = Math.min(adventure.maxPeople || 100, noAdults);
                                } else {
                                    // For all ages, max is total guests
                                    maxParticipants = Math.min(adventure.maxPeople || 100, noAdults + noChildren);
                                }

                                const addon = {
                                    id: adventure._id,
                                    title: adventure.name,
                                    description: adventure.description,
                                    pricePerPerson: adventure.pricePerPerson,
                                    ageRestricted: adventure.ageRestricted,
                                    maxParticipants: maxParticipants,
                                    ageLabel: adventure.ageRestricted ? '18+ only' : 'All ages',
                                    image: adventure.image || '/images/default-adventure.jpg'
                                };

                                return (
                                    <div key={addon.id} className="border border-green-200 rounded-lg p-2 sm:p-3 bg-gradient-to-r from-green-50 to-amber-50 shadow-sm h-full flex flex-col">
                                        <div className="flex items-start mb-2">
                                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={addon.image}
                                                    alt={addon.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 4rem, 5rem"
                                                />
                                            </div>

                                            <div className="ml-2 sm:ml-3 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-sm sm:text-base text-green-900">{addon.title}</h3>
                                                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-medium">
                                                        ₹{addon.pricePerPerson}/person
                                                    </span>
                                                </div>

                                                <p className="text-gray-700 text-xs sm:text-sm mt-1">{addon.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col mt-auto">
                                            {currentCount > 0 ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="text-left">
                                                        <div className="text-[0.65rem] sm:text-xs text-gray-600">Participants: {currentCount}</div>
                                                        <div className="text-xs sm:text-xs font-bold text-green-700">
                                                            ₹{currentCount * addon.pricePerPerson}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition text-xs sm:text-xs"
                                                        onClick={() => handleAddonChange(addon, 0)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <button
                                                        className="bg-green-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg font-bold hover:bg-green-800 transition text-xs sm:text-xs"
                                                        onClick={() => openAddonModal(addon)}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {adventures.length > 2 && (
                        <div className="mt-2  flex justify-center">
                            <button
                                className="bg-green-700 text-xs text-white px-4 py-1 rounded-lg font-medium hover:bg-green-800 transition"
                                onClick={() => setShowAllAdventures(!showAllAdventures)}
                            >
                                {showAllAdventures ? 'View Less' : 'View All'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Price Breakdown */}
            <div className=" p-4 fixed md:static  bottom-0 w-full bg-white border-2 border-amber-100  rounded-b-lg">
                <h3 className="text-sm sm:text-base font-semibold text-green-800 mb-2">Price Breakdown</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Stay Price ({stayPrice} × {numNights} nights):</span>
                        <span className="font-medium">₹{stayPrice * numNights}</span>
                    </div>

                    {Object.values(selectedAddons).length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-1">Add-ons:</h4>
                            <ul className="space-y-1">
                                {Object.values(selectedAddons).map((addon, index) => (
                                    <li key={index} className="flex justify-between text-xs">
                                        <span>{addon.title} (x{addon.participants}):</span>
                                        <span>₹{addon.pricePerPerson * addon.participants}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">₹{totalPrice}</span>
                    </div>
                </div>
                {/* Book Now Button - Top */}
                <div className="my-2 p-4 bg-green-50 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="text-center sm:text-left mb-2 sm:mb-0">

                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                Total: <span className="font-bold text-green-800">₹{totalPrice}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleBookNow}
                            className="w-full sm:w-auto bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg font-bold hover:bg-green-800 transition text-sm sm:text-base"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
            </div>

            {/* Add-On Modal */}
            {showAddonModal && activeAddon && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-72">
                        <h3 className="text-lg font-medium mb-2">{activeAddon.title}</h3>
                        <p className="text-sm text-gray-700 mb-2">Max participants: {noAdults + noChildren}</p>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of participants</label>
                        <input
                            type="number"
                            min="1"
                            max={noAdults + noChildren}
                            value={modalCount}
                            onChange={(e) => setModalCount(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1  focus:outline-none focus:ring focus:border-green-300"
                        />
                        {modalCount > noAdults + noChildren && (
                            <p className="text-red-500  text-sm">
                                You can only add {noAdults + noChildren} participants.
                            </p>
                        )}
                        <div className="flex mt-4 justify-end space-x-2">
                            <button
                                onClick={closeAddonModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalAdd}
                                disabled={modalCount > noAdults + noChildren}
                                className={`${modalCount > noAdults + noChildren || modalCount == 0 ? 'bg-gray-400' : 'bg-green-700'} text-white px-4 py-2 rounded-md hover:bg-green-800 transition`}
                            >
                                Add
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default DetailMain;