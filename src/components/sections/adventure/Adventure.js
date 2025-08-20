'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaPlus, FaMinus, FaEdit, FaTrash, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import Link from 'next/link';
import { Fragment } from 'react';

const Adventure = () => {
    const [adventures, setAdventures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdventure, setSelectedAdventure] = useState(null);
    const [participantCount, setParticipantCount] = useState(1);
    const [bookingSummary, setBookingSummary] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [adventureDate, setAdventureDate] = useState('');
    const [showDateModal, setShowDateModal] = useState(false);
    const router = useRouter();

    const fetchAdventures = async () => {
        try {
            const res = await fetch('/api/adventure');
            const data = await res.json();
            setAdventures(data);
        } catch (error) {
            console.error('Failed to fetch adventures:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdventures();
    }, []);

    const handleAddOrEditBooking = () => {
        const newBooking = {
            id: selectedAdventure._id,
            name: selectedAdventure.name,
            pricePerPerson: selectedAdventure.pricePerPerson,
            count: participantCount,
            total: selectedAdventure.pricePerPerson * participantCount,
        };

        let updatedBookings = [...bookingSummary];

        if (editingIndex !== null) {
            updatedBookings[editingIndex] = newBooking;
        } else {
            updatedBookings.push(newBooking);
        }

        setBookingSummary(updatedBookings);
        setParticipantCount(1);
        setSelectedAdventure(null);
        setEditingIndex(null);
    };

    const handleEdit = (index) => {
        const item = bookingSummary[index];
        const adv = adventures.find((a) => a._id === item.id);
        setSelectedAdventure(adv);
        setParticipantCount(item.count);
        setEditingIndex(index);
    };

    const handleRemove = (index) => {
        const updated = [...bookingSummary];
        updated.splice(index, 1);
        setBookingSummary(updated);
    };

    const handleConfirmDate = async () => {
        if (!adventureDate) {
            alert('Please select a date for your adventure');
            return;
        }

        if (bookingSummary.length === 0) {
            alert('Please add at least one adventure to book');
            return;
        }

        try {
            const payload = {
                items: bookingSummary,
                adventureDate: adventureDate,
                totalAmount: bookingSummary.reduce((acc, item) => acc + item.total, 0)
            };

            const response = await fetch('/api/adventure/prebooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                setBookingSummary([]);
                router.push(`/booking/adventure/${result.bookingId}`);
            } else {
                throw new Error(result.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert(`Booking failed: ${error.message}`);
        } finally {
            setShowDateModal(false);
        }
    };

    const totalAmount = bookingSummary.reduce((acc, item) => acc + item.total, 0);

    return (
        <div className="min-h-screen bg-amber-50">
            {/* Compact Header Section */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <Link href="/" className='flex items-center text-gray-600 hover:text-green-900 transition-colors group text-sm'>
                            <IoIosArrowRoundBack className="text-xl mr-1 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Home</span>
                        </Link>
                        
                        {/* Mobile Booking Summary Counter */}
                        {bookingSummary.length > 0 && (
                            <div className="md:hidden">
                                <span className="bg-green-900 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    {bookingSummary.length} selected
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                {/* Compact Hero Section */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-900 mb-2">
                        Adventure Experiences
                    </h1>
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Discover thrilling adventures and create unforgettable memories
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Content */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                                        <div className="p-3 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : adventures.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                                    <HiOutlineLocationMarker className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Adventures Available</h3>
                                <p className="text-sm text-gray-600">Check back later for exciting adventures!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {adventures.map((adv) => (
                                    <div key={adv._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100">
                                        <div className="aspect-square relative overflow-hidden">
                                            <Image
                                                src={adv.image || '/placeholder.jpg'}
                                                alt={adv.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                            />
                                        </div>
                                        
                                        <div className="p-3">
                                            <h2 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-green-900 transition-colors line-clamp-1">
                                                {adv.name}
                                            </h2>
                                            <p className="text-xs text-gray-600 leading-tight mb-2 line-clamp-2">
                                                {adv.description}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center text-green-900">
                                                    <span className="text-sm font-bold">₹{adv.pricePerPerson}</span>
                                                    <span className="text-xs text-gray-500 ml-1">/ person</span>
                                                </div>
                                               
                                            </div>
                                            
                                            <button
                                                onClick={() => {
                                                    setSelectedAdventure(adv);
                                                    setParticipantCount(1);
                                                    setEditingIndex(null);
                                                }}
                                                className="w-full bg-green-900 hover:bg-green-800 text-white font-medium text-xs py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Compact Desktop Booking Summary */}
                    {bookingSummary.length > 0 && (
                        <div className="hidden lg:block w-72 h-fit sticky top-20">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-green-900 text-white p-4">
                                    <h3 className="text-lg font-bold flex items-center">
                                        <FaUsers className="mr-2 w-4 h-4" />
                                        Booking Summary
                                    </h3>
                                </div>
                                
                                <div className="p-4">
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {bookingSummary.map((item, index) => (
                                            <div key={index} className="bg-amber-50 rounded-lg p-3 border border-gray-100">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-medium text-gray-900 flex-1 text-sm">{item.name}</h4>
                                                    <div className="flex gap-1 ml-2">
                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className="p-1 text-green-900 hover:bg-green-100 rounded transition-colors"
                                                        >
                                                            <FaEdit className="w-2.5 h-2.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(index)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                        >
                                                            <FaTrash className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-600">
                                                        {item.count} × ₹{item.pricePerPerson}
                                                    </span>
                                                    <span className="font-bold text-green-900">₹{item.total}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-3 mt-4">
                                        <div className="flex justify-between items-center text-base font-bold text-gray-900 mb-4">
                                            <span>Total</span>
                                            <span className="text-lg text-green-900">₹{totalAmount}</span>
                                        </div>
                                        
                                        <button
                                            onClick={() => setShowDateModal(true)}
                                            className="w-full bg-green-900 hover:bg-green-800 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center"
                                        >
                                            <FaCalendarAlt className="mr-2 w-3 h-3" />
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compact Mobile Booking Summary - Fixed Bottom */}
            {bookingSummary.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-sm">Booking Summary</h3>
                            <span className="text-xs text-gray-600">{bookingSummary.length} item{bookingSummary.length > 1 ? 's' : ''}</span>
                        </div>
                        
                        <div className="max-h-24 overflow-y-auto mb-3">
                            {bookingSummary.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-gray-900">{item.name}</span>
                                        <span className="text-xs text-gray-600 block">
                                            {item.count} × ₹{item.pricePerPerson}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-green-900 text-xs">₹{item.total}</span>
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="p-1 text-green-900"
                                        >
                                            <FaEdit className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(index)}
                                            className="p-1 text-red-600"
                                        >
                                            <FaTrash className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-bold text-gray-900">Total: </span>
                                <span className="text-base font-bold text-green-900">₹{totalAmount}</span>
                            </div>
                            <button
                                onClick={() => setShowDateModal(true)}
                                className="bg-green-900 hover:bg-green-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center"
                            >
                                <FaCalendarAlt className="mr-1.5 w-3 h-3" />
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add bottom padding for mobile */}
            {bookingSummary.length > 0 && <div className="lg:hidden h-32"></div>}

            {/* Compact Participants Modal */}
            <Transition appear show={!!selectedAdventure} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => {
                    setSelectedAdventure(null);
                    setParticipantCount(1);
                    setEditingIndex(null);
                }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/20" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                    <div className="bg-green-900 text-white p-4">
                                        <Dialog.Title className="text-lg font-bold">
                                            {editingIndex !== null ? 'Edit Participants' : 'Add Participants'}
                                        </Dialog.Title>
                                        <p className="text-green-100 mt-1 text-sm">{selectedAdventure?.name}</p>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Number of Participants
                                            </label>
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => participantCount > 1 && setParticipantCount(participantCount - 1)}
                                                    disabled={participantCount <= 1}
                                                    className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                                >
                                                    <FaMinus className="w-3 h-3" />
                                                </button>
                                                <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                                                    {participantCount}
                                                </span>
                                                <button
                                                    onClick={() => setParticipantCount(participantCount + 1)}
                                                    className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors"
                                                >
                                                    <FaPlus className="w-3 h-3 text-green-900" />
                                                </button>
                                            </div>
                                        </div>

                                        {selectedAdventure && (
                                            <div className="bg-amber-50 rounded-lg p-3 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">Price per person:</span>
                                                    <span className="font-medium text-sm">₹{selectedAdventure.pricePerPerson}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="font-medium text-gray-900 text-xs">Total amount:</span>
                                                    <span className="text-lg font-bold text-green-900">
                                                        ₹{selectedAdventure.pricePerPerson * participantCount}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAddOrEditBooking}
                                            className="w-full bg-green-900 hover:bg-green-800 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                                        >
                                            {editingIndex !== null ? 'Update Booking' : 'Add to Booking'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Compact Date Selection Modal */}
            <Transition appear show={showDateModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowDateModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/20" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                    <div className="bg-green-900 text-white p-4">
                                        <Dialog.Title className="text-lg font-bold flex items-center">
                                            <FaCalendarAlt className="mr-2 w-4 h-4" />
                                            Select Date
                                        </Dialog.Title>
                                        <p className="text-green-100 mt-1 text-sm">Choose your preferred date</p>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Adventure Date
                                            </label>
                                            <input
                                                type="date"
                                                value={adventureDate}
                                                onChange={(e) => setAdventureDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setShowDateModal(false)}
                                                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleConfirmDate}
                                                disabled={!adventureDate}
                                                className="flex-1 bg-green-900 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 text-sm"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Adventure;
