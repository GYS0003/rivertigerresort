'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import LoginSignupModal from '@/components/sections/login/LoginSignupModal';

const DetailMain = () => {
    const router = useRouter();
    const { id } = useParams();
    const [stay, setStay] = useState(null);
    const [adventures, setAdventures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState({});
    const [selectedMeals, setSelectedMeals] = useState({
        breakfast: false,
        lunch: false,
        dinner: false
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [numNights, setNumNights] = useState(1);
    const [adventuresLoading, setAdventuresLoading] = useState(true);
    const [noAdults, setNoAdults] = useState(1);
    const [noChildren, setNoChildren] = useState(0);
    const [stayPrice, setStayPrice] = useState(0);
    const [showAllAdventures, setShowAllAdventures] = useState(false);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [showAllMeals, setShowAllMeals] = useState(false);
    // **FIXED: Image Gallery States**
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayRef = useRef(null);

    // Calculate total price whenever components change
    useEffect(() => {
        let calculatedTotal = stayPrice * numNights;

        // Add addons
        Object.values(selectedAddons).forEach(addon => {
            calculatedTotal += addon.pricePerPerson * addon.participants;
        });

        // Add meals (per person per night)
        if (stay) {
            const totalGuests = noAdults + noChildren;
            if (selectedMeals.breakfast && stay.breakfastPrice) {
                calculatedTotal += stay.breakfastPrice * totalGuests * numNights;
            }
            if (selectedMeals.lunch && stay.lunchPrice) {
                calculatedTotal += stay.lunchPrice * totalGuests * numNights;
            }
            if (selectedMeals.dinner && stay.dinnerPrice) {
                calculatedTotal += stay.dinnerPrice * totalGuests * numNights;
            }
        }

        setTotalPrice(calculatedTotal);
    }, [stayPrice, numNights, selectedAddons, selectedMeals, stay, noAdults, noChildren]);

    // **FIXED: Auto-play functionality with proper cleanup**
    useEffect(() => {
        if (!stay?.images || stay.images.length <= 1 || !isAutoPlaying) {
            return;
        }

        autoPlayRef.current = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === stay.images.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [stay?.images?.length, isAutoPlaying]);

    // **FIXED: Pause and resume functions**
    const pauseAutoPlay = () => {
        setIsAutoPlaying(false);
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
    };

    const resumeAutoPlay = () => {
        setTimeout(() => {
            setIsAutoPlaying(true);
        }, 8000);
    };

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
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                setStayPrice(stayData.price);

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

    const handleMealToggle = (mealType) => {
        setSelectedMeals(prev => ({
            ...prev,
            [mealType]: !prev[mealType]
        }));
    };

    // **FIXED: Image navigation functions**
    const nextImage = () => {
        if (!stay?.images?.length) return;
        pauseAutoPlay();
        setCurrentImageIndex((prevIndex) =>
            prevIndex === stay.images.length - 1 ? 0 : prevIndex + 1
        );
        resumeAutoPlay();
    };

    const prevImage = () => {
        if (!stay?.images?.length) return;
        pauseAutoPlay();
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? stay.images.length - 1 : prevIndex - 1
        );
        resumeAutoPlay();
    };

    const goToImage = (index) => {
        if (!stay?.images?.length || index < 0 || index >= stay.images.length) return;
        pauseAutoPlay();
        setCurrentImageIndex(index);
        resumeAutoPlay();
    };

    // **FIXED: Lightbox functions**
    const openLightbox = (index) => {
        setLightboxImageIndex(index);
        setShowLightbox(true);
        pauseAutoPlay();
    };

    const closeLightbox = () => {
        setShowLightbox(false);
        resumeAutoPlay();
    };

    const nextLightboxImage = () => {
        if (!stay?.images?.length) return;
        setLightboxImageIndex((prevIndex) =>
            prevIndex === stay.images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevLightboxImage = () => {
        if (!stay?.images?.length) return;
        setLightboxImageIndex((prevIndex) =>
            prevIndex === 0 ? stay.images.length - 1 : prevIndex - 1
        );
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
                selectedMeals,
                userId: userInfo._id,
                userEmail: userInfo.email,
                phone: userInfo.phone,
            };

            const res = await fetch('/api/stay/prebooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
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

    // **FIXED: Prepare images array with fallback**
    const images = stay?.images?.length > 0
        ? stay.images
        : [getDefaultImage(stay.category)];

    const totalGuests = noAdults + noChildren;

    return (
        <>
            <div className="max-w-4xl mx-auto sm:px-4 py-4 text-[#1f3c2e]">
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
                            </div>
                            <div className="mr-2">
                                <span className="font-medium">Children:</span> {noChildren}
                            </div>
                            <div>
                                <span className="font-medium">Total Days:</span> {numNights}
                            </div>
                        </div>
                    </div>

                    {/* **ENHANCED: Image Gallery with Radio Button Style Thumbnails** */}
                    <div className="mb-4">
                        {/* Main Image Carousel */}
                        <div className="relative w-full h-40 sm:h-52 md:h-64 lg:h-80 rounded-lg overflow-hidden shadow-lg mb-4 group">
                            {images.length > 0 ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={images[currentImageIndex]}
                                        alt={`${stay?.name || "Stay"} - Image ${currentImageIndex + 1}`}
                                        fill
                                        className="object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                                        priority
                                        onClick={() => openLightbox(currentImageIndex)}
                                        sizes="100vw"
                                    />

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}

                                    {/* Selection Status Display */}
                                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                                        <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                            Selected: {currentImageIndex + 1} / {images.length}
                                        </div>
                                        <button
                                            onClick={() => openLightbox(currentImageIndex)}
                                            className="bg-black bg-opacity-60 text-white p-1.5 rounded-md hover:bg-opacity-80 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m-3 0h3m-3 0H7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Auto-play Status */}
                                    {images.length > 1 && isAutoPlaying && (
                                        <div className="absolute top-2 left-2">
                                            <div className="bg-blue-600 bg-opacity-80 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                                                Auto
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm">No images available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* **RADIO BUTTON STYLE: Thumbnail Strip** */}
                        {images.length > 1 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">View Gallery:</h3>
                                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((image, index) => (
                                        <label key={index} className="relative py-2 pl-1  cursor-pointer">
                                            {/* Hidden Radio Input */}
                                            <input
                                                type="radio"
                                                name="image-selection"
                                                value={index}
                                                checked={index === currentImageIndex}
                                                onChange={() => goToImage(index)}
                                                className="sr-only"
                                            />

                                            {/* Thumbnail Button */}
                                            <div
                                                className={`relative flex-shrink-0  w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentImageIndex
                                                    ? 'border-green-500 ring-2 ring-green-300 ring-opacity-50 shadow-lg transform scale-105'
                                                    : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                                                    }`}
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${stay?.name || "Stay"} thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 4rem, 5rem"
                                                />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

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

                {(stay.breakfastPrice > 0 || stay.lunchPrice > 0 || stay.dinnerPrice > 0) && (
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-sm mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4 text-green-900">
                            Meal Options
                        </h2>

                        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
                            {stay.breakfastPrice > 0 && (
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedMeals.breakfast ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200 hover:border-gray-300'
                                    } ${!showAllMeals ? 'block' : 'block'} md:block`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className='flex justify-start items-center'>
                                                <input type="checkbox" checked={selectedMeals.breakfast} onChange={() => handleMealToggle('breakfast')} className="sr-only" />
                                                <div className={`w-4 h-4 mr-2 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMeals.breakfast ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-400'
                                                    }`}>
                                                    {selectedMeals.breakfast && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold ${selectedMeals.breakfast ? 'text-purple-800' : 'text-gray-800'}`}>Breakfast</h3>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedMeals.breakfast ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-700'
                                                }`}>₹{stay.breakfastPrice}/person</span>
                                        </div>
                                        {selectedMeals.breakfast && (
                                            <div className="mt-3 pt-2 border-t border-purple-200 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-600">{totalGuests} guests × {numNights} nights</span>
                                                    <span className="font-semibold text-purple-700">₹{stay.breakfastPrice * totalGuests * numNights}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            )}

                            {stay.lunchPrice > 0 && (
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedMeals.lunch ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200 hover:border-gray-300'
                                    } ${!showAllMeals ? 'hidden' : 'block'} md:block`}>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className='flex justify-start items-center'>
                                                <input type="checkbox" checked={selectedMeals.lunch} onChange={() => handleMealToggle('lunch')} className="sr-only" />
                                                <div className={`w-4 h-4 mr-2 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMeals.lunch ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-400'
                                                    }`}>
                                                    {selectedMeals.lunch && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold ${selectedMeals.lunch ? 'text-purple-800' : 'text-gray-800'}`}>Lunch</h3>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedMeals.lunch ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-700'
                                                }`}>₹{stay.lunchPrice}/person</span>
                                        </div>
                                        {selectedMeals.lunch && (
                                            <div className="mt-3 pt-2 border-t border-purple-200 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-600">{totalGuests} guests × {numNights} nights</span>
                                                    <span className="font-semibold text-purple-700">₹{stay.lunchPrice * totalGuests * numNights}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            )}

                            {stay.meals && stay.dinnerPrice > 0 && (
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedMeals.dinner ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200 hover:border-gray-300'
                                    } ${!showAllMeals ? 'hidden' : 'block'} md:block`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className='flex justify-start items-center'>
                                                <input type="checkbox" checked={selectedMeals.dinner} onChange={() => handleMealToggle('dinner')} className="sr-only" />
                                                <div className={`w-4 h-4 mr-2 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMeals.dinner ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-400'
                                                    }`}>
                                                    {selectedMeals.dinner && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold ${selectedMeals.dinner ? 'text-purple-800' : 'text-gray-800'}`}>Dinner</h3>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedMeals.dinner ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-700'
                                                }`}>₹{stay.dinnerPrice}/person</span>
                                        </div>
                                        {selectedMeals.dinner && (
                                            <div className="mt-3 pt-2 border-t border-purple-200 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-600">{totalGuests} guests × {numNights} nights</span>
                                                    <span className="font-semibold text-purple-700">₹{stay.dinnerPrice * totalGuests * numNights}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Mobile Toggle Button */}
                        <div className="md:hidden mt-4 text-center">
                            {((stay.lunchPrice > 0 && stay.breakfastPrice > 0) || (stay.dinnerPrice > 0 && stay.breakfastPrice > 0)) && (
                                <button
                                    onClick={() => setShowAllMeals(!showAllMeals)}
                                    className="inline-flex items-center border p-1 rounded-md text-green-700 hover:text-green-800 font-medium transition-colors"
                                >
                                    {showAllMeals ? 'View Less' : 'View All'}
                                    <svg className={`ml-2 w-4 h-4 transition-transform duration-300 ${showAllMeals ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}



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

                                let maxParticipants;
                                if (adventure.ageRestricted) {
                                    maxParticipants = Math.min(adventure.maxPeople || 100, noAdults);
                                } else {
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
                        <div className="mt-2 flex justify-center">
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
                <div className="p-4 fixed md:static bottom-0 w-full bg-white border-2 border-amber-100 rounded-b-lg">
                    <h3 className="text-sm sm:text-base font-semibold text-green-800 mb-2">Price Breakdown</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Stay Price ({stayPrice} × {numNights} nights):</span>
                            <span className="font-medium">₹{stayPrice * numNights}</span>
                        </div>

                        {/* Meal pricing breakdown */}
                        {(selectedMeals.breakfast || selectedMeals.lunch || selectedMeals.dinner) && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Meals:</h4>
                                <ul className="space-y-1">
                                    {selectedMeals.breakfast && stay.breakfastPrice > 0 && (
                                        <li className="flex justify-between text-xs">
                                            <span>Breakfast ({totalGuests} guests × {numNights} nights):</span>
                                            <span>₹{stay.breakfastPrice * totalGuests * numNights}</span>
                                        </li>
                                    )}
                                    {selectedMeals.lunch && stay.lunchPrice > 0 && (
                                        <li className="flex justify-between text-xs">
                                            <span>Lunch ({totalGuests} guests × {numNights} nights):</span>
                                            <span>₹{stay.lunchPrice * totalGuests * numNights}</span>
                                        </li>
                                    )}
                                    {selectedMeals.dinner && stay.dinnerPrice > 0 && (
                                        <li className="flex justify-between text-xs">
                                            <span>Dinner ({totalGuests} guests × {numNights} nights):</span>
                                            <span>₹{stay.dinnerPrice * totalGuests * numNights}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

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

                    {/* Book Now Button */}
                    <div className="my-2 p-4 bg-green-50 rounded-lg shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <div className="text-center sm:text-left mb-2 sm:mb-0">
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    Total: <span className="font-bold text-green-800">₹{totalPrice}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (!localStorage.getItem('token')) {
                                        setIsModalOpen(true);
                                        return;
                                    }
                                    handleBookNow();
                                }}
                                className="w-full sm:w-auto bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg font-bold hover:bg-green-800 transition text-sm sm:text-base"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* **ENHANCED: Image Lightbox Modal** */}
            {showLightbox && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevLightboxImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextLightboxImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Main Lightbox Image */}
                        <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
                            <Image
                                src={images[lightboxImageIndex]}
                                alt={`${stay.name} - Large view ${lightboxImageIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Image Info */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
                            <p className="text-sm font-medium">{stay.name}</p>
                            {images.length > 1 && (
                                <p className="text-xs opacity-75">{lightboxImageIndex + 1} of {images.length}</p>
                            )}
                        </div>

                        {/* Lightbox Thumbnail Navigation */}
                        {images.length > 1 && (
                            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setLightboxImageIndex(index)}
                                        className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${index === lightboxImageIndex
                                            ? 'border-white opacity-100'
                                            : 'border-gray-500 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="3rem"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:border-green-300"
                        />
                        {modalCount > noAdults + noChildren && (
                            <p className="text-red-500 text-sm">
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

            <LoginSignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleBooking={handleBookNow} />

            {/* CSS for hiding scrollbar */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
};

export default DetailMain;
