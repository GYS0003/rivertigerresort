'use client';
import React, { useEffect, useState } from 'react';

const OfflineStayBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        stayType: 'Villa',
        checkIn: '',
        checkOut: '',
        numberOfRooms: 1,
        roomNumbers: [],
        adults: 1,
        children: 0,
        totalAmount: 0,
        status: 'Pending',
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // OTP related states
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);

    // Fetch bookings from API
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/stay-offline-bookings');
            if (!res.ok) throw new Error('Failed to fetch bookings');

            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings.map(b => ({
                    ...b,
                    checkIn: new Date(b.checkIn),
                    checkOut: new Date(b.checkOut)
                })));
            } else {
                throw new Error(data.message || 'Error fetching data');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            // Reset verification states when email changes
            setEmailVerified(false);
            setOtpSent(false);
            setOtp('');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open side panel for new booking
    const handleAddNew = () => {
        setFormData({
            name: '',
            email: '',
            stayType: 'Villa',
            checkIn: '',
            checkOut: '',
            adults: 1,
            children: 0,
            totalAmount: 0,
            numberOfRooms: 1,
            roomNumbers: [],
            status: 'Pending',
        });
        setEditId(null);
        // Reset OTP states
        setOtp('');
        setOtpSent(false);
        setEmailVerified(false);
        setIsPanelOpen(true);
    };

    // Close side panel
    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditId(null);
        setFormData({
            name: '',
            email: '',
            stayType: 'Villa',
            checkIn: '',
            checkOut: '',
            adults: 1,
            children: 0,
            roomNumbers: [],
            numberOfRooms: 1,
            totalAmount: 0,
            status: 'Pending',
        });
        // Reset OTP states
        setOtp('');
        setOtpSent(false);
        setEmailVerified(false);
    };

    // Send OTP function
    const handleVerifyEmail = async () => {
        if (!formData.name || !formData.email) {
            setError('Please enter name and email first');
            return;
        }

        setOtpSending(true);
        setError(null);
        try {
            const res = await fetch('/api/user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email }),
            });
            
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }
            
            setOtpSent(true);
            setEmailVerified(false);
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center';
            notification.innerHTML = `
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>OTP sent successfully!</span>
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        } catch (err) {
            console.error('OTP send error:', err);
            setError(err.message || 'Failed to send OTP');
        } finally {
            setOtpSending(false);
        }
    };

    // Verify OTP function
    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setOtpVerifying(true);
        setError(null);
        try {
            const res = await fetch('/api/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to verify OTP');
            }
            
            setEmailVerified(true);
            setOtpSent(false);
            setOtp('');
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center';
            notification.innerHTML = `
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Email verified successfully!</span>
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        } catch (err) {
            console.error('OTP verification error:', err);
            setError(err.message || 'Failed to verify OTP');
        } finally {
            setOtpVerifying(false);
        }
    };

    // Create or Update booking
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Check if email is verified for new bookings
        if (!editId && !emailVerified) {
            setError('Please verify your email before creating a booking');
            return;
        }

        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId
                ? `/api/stay-offline-bookings?id=${editId}`
                : '/api/stay-offline-bookings';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    checkIn: new Date(formData.checkIn).toISOString().split('T')[0],
                    checkOut: new Date(formData.checkOut).toISOString().split('T')[0]
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Operation failed');
            }

            await fetchBookings();
            handleClosePanel();

            document.getElementById('successNotification').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('successNotification').classList.add('hidden');
            }, 3000);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to save booking');
        }
    };

    // Delete booking
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        setError(null);

        try {
            const res = await fetch(`/api/stay-offline-bookings?id=${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Delete failed');
            }

            await fetchBookings();
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete booking');
        }
    };

    // Edit booking - now opens side panel
    const handleEdit = (booking) => {
        setFormData({
            name: booking.name,
            email: booking.email,
            stayType: booking.stayType,
            checkIn: booking.checkIn.toISOString().split('T')[0],
            checkOut: booking.checkOut.toISOString().split('T')[0],
            adults: booking.adults,
            roomNumbers: booking.roomNumbers,
            numberOfRooms: booking.numberOfRooms,
            children: booking.children,
            totalAmount: booking.totalAmount,
            status: booking.status,
        });
        setEditId(booking._id);
        // Set email as verified for edit mode
        setEmailVerified(true);
        setOtpSent(false);
        setOtp('');
        setIsPanelOpen(true);
    };

    // Filter bookings by status
    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const revenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Offline Stay Bookings</h1>
                        <p className="text-gray-600 mt-2">Manage all offline reservations and bookings</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Success">Success</option>
                        </select>

                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span className="hidden sm:inline">Add Stay</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Side Panel Overlay */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/30 bg-opacity-10 z-30 transition-opacity"
                    onClick={handleClosePanel}
                />
            )}

            {/* Side Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 lg:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isPanelOpen ? 'translate-x-0' : 'translate-x-full'
            } overflow-y-auto`}>
                <div className="p-6">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editId ? 'Edit Booking' : 'Create New Booking'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {editId ? 'Update booking details' : 'Add a new offline booking'}
                            </p>
                        </div>
                        <button
                            onClick={handleClosePanel}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter guest name"
                            />
                        </div>

                        {/* Email Verification Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address * 
                                {emailVerified && (
                                    <span className="ml-2 text-green-600 text-xs">
                                        ✓ Verified
                                    </span>
                                )}
                            </label>
                            <div className="flex border rounded-lg justify-start w-full items-center">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={emailVerified}
                                    className={`w-full px-4 py-2 rounded-l-lg border-none focus:outline-none ${
                                        emailVerified ? 'bg-green-50 text-green-800' : ''
                                    }`}
                                    placeholder="guest@example.com"
                                />
                                {!emailVerified && (
                                    <button 
                                        type="button" 
                                        className={`px-4 py-2  rounded-r-lg  bg-blue-700 text-white  ${otpSending ? 'bg-gray-200' :otpSent? 'bg-gray-200':''} `} 

                                        onClick={handleVerifyEmail}
                                        disabled={otpSending || otpSent}
                                    >
                                        {otpSending ? 'Sending...' : otpSent ? 'Sent' : 'Send'}
                                    </button>
                                )}
                            </div>

                            {/* OTP Input Section */}
                            {otpSent && !emailVerified && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Enter 6-digit OTP"
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono"
                                            maxLength="6"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyOTP}
                                            disabled={otpVerifying || otp.length !== 6}
                                            className="px-6 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {otpVerifying ? 'Verifying...' : 'Verify'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Check your email for OTP</span>
                                        {/* <button
                                            type="button"
                                            onClick={handleVerifyEmail}
                                            disabled={otpSending}
                                            className="text-blue-600 hover:text-blue-800 disabled:text-blue-400"
                                        >
                                            Resend OTP
                                        </button> */}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stay Type</label>
                                <select
                                    name="stayType"
                                    value={formData.stayType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="Villa">Villa</option>
                                    <option value="Cottage">Cottage</option>
                                    <option value="Tent">Tent</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
                                <input
                                    type="date"
                                    name="checkIn"
                                    value={formData.checkIn}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                                <input
                                    type="date"
                                    name="checkOut"
                                    min={formData.checkIn}
                                    value={formData.checkOut}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adults *</label>
                                <input
                                    type="number"
                                    name="adults"
                                    value={formData.adults}
                                    min="1"
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                                <input
                                    type="number"
                                    name="children"
                                    value={formData.children}
                                    min="0"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms *</label>
                                <input
                                    type="number"
                                    name="numberOfRooms"
                                    value={formData.numberOfRooms}
                                    min="1"
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Numbers *</label>
                                <input
                                    type="text"
                                    name="roomNumbers"
                                    value={formData.roomNumbers}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter room numbers separated by commas</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹) *</label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={formData.totalAmount}
                                    min="0"
                                    step="0.01"
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Success">Success</option>
                                </select>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="pt-6 space-y-3">
                            <button
                                type="submit"
                                disabled={loading || (!editId && !emailVerified)}
                                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                                    editId
                                        ? 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400'
                                        : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {editId ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    editId ? 'Update Booking' : 
                                    (!emailVerified ? 'Verify Email First' : 'Create Booking')
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleClosePanel}
                                className="w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Notification */}
            <div id="successNotification" className="hidden fixed top-6 right-6 z-50">
                <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Booking {editId ? 'updated' : 'added'} successfully!</span>
                </div>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center max-w-md">
                        <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="flex-1">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Bookings Table */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">All Bookings</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">Loading bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto text-red-500 mb-4">
                                <svg className="w-16 h-16 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-800">Failed to load bookings</p>
                            <p className="mt-2 text-gray-600">{error}</p>
                            <button
                                onClick={fetchBookings}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay Type</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No of Rooms</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Numbers</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="px-2 py-8 text-center text-gray-500">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <p className="mt-4 text-lg font-medium">No bookings found</p>
                                                <p className="mt-1">Try adjusting your search or filter</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((b) => (
                                            <tr key={b._id} className="hover:bg-gray-50">
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-2">
                                                            <div className="text-sm font-medium text-gray-900">{b.name}</div>
                                                            <div className="text-sm text-gray-500">{b.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{b.stayType}</div>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {b.checkIn.toLocaleDateString()} - {b.checkOut.toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {Math.ceil((b.checkOut - b.checkIn) / (1000 * 60 * 60 * 24))} nights
                                                    </div>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>{b.adults} {b.adults === 1 ? 'Adult' : 'Adults'}</div>
                                                    <div>{b.children} {b.children === 1 ? 'Child' : 'Children'}</div>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {b.numberOfRooms}
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {b.roomNumbers}
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{b.totalAmount.toLocaleString()}
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        b.status === 'Success'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(b)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(b._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p className="mt-1">Showing {filteredBookings.length} of {bookings.length} bookings</p>
                </div>
            </div>
        </div>
    );
};

export default OfflineStayBooking;
