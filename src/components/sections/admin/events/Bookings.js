'use client';

import React, { useEffect, useState } from 'react';
import { FiSearch, FiCalendar, FiX, FiUser, FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiChevronUp, FiDollarSign } from 'react-icons/fi';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventDate: '', // Auto-select today's date
    searchQuery: '',
    paymentStatus: 'all',
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchEventBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/event/bookings', {
        method: 'GET',
      });

      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching event bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventBookings();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      eventDate: '', // Reset to today's date
      searchQuery: '',
      paymentStatus: 'all',
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const { eventDate, searchQuery, paymentStatus } = filters;
    const bookingEventDate = booking.eventDate ? new Date(booking.eventDate) : null;
    
    // Date filtering - exact match with selected date
    if (eventDate && bookingEventDate) {
      const selectedDate = new Date(eventDate);
      if (bookingEventDate.toDateString() !== selectedDate.toDateString()) {
        return false;
      }
    }
    
    // Payment status filtering
    if (paymentStatus !== 'all' && booking.paymentStatus !== paymentStatus) {
      return false;
    }
    
    // Search filtering with proper null checks
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Check booking ID with null check
      const matchesId = booking._id ? booking._id.toLowerCase().includes(query) : false;
      
      // Check user email with null check
      const matchesEmail = booking.userEmail ? booking.userEmail.toLowerCase().includes(query) : false;
      
      // Check event title with null check
      const matchesEvent = booking.items && booking.items.title ? booking.items.title.toLowerCase().includes(query) : false;
      
      // Check formatted date with null check
      const matchesDate = bookingEventDate ? 
        bookingEventDate.toLocaleDateString('en-IN').toLowerCase().includes(query) : false;
      
      if (!(matchesId || matchesEmail || matchesEvent || matchesDate)) return false;
    }
    
    return true;
  });

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString, includeYear = true) => {
    if (!dateString) return 'N/A';
    const options = {
      day: 'numeric',
      month: 'short',
      ...(includeYear && { year: 'numeric' })
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Event Bookings
          </h1>
          <p className="text-gray-600 mt-1 hidden sm:block">
            Manage all event reservations in one place
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <button 
              onClick={clearFilters}
              className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center justify-center"
            >
              <FiX className="mr-1" /> Clear Filters
            </button>
          </div>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="md:hidden px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
          >
            Filters {isFiltersOpen ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        </div>
      </div>

      {/* Filter Section - Collapsible on mobile */}
      <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6 ${isMobile && !isFiltersOpen ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Search & Filter</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Bookings
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                name="searchQuery"
                id="search"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="ID, email, event, or date..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={filters.eventDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Bookings</p>
              <p className="text-lg sm:text-xl font-bold">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg mr-3">
              <FiCheckCircle className="text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Successful</p>
              <p className="text-lg sm:text-xl font-bold">
                {bookings.filter(b => b.paymentStatus === 'success').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg mr-3">
              <FiClock className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-lg sm:text-xl font-bold">
                {bookings.filter(b => b.paymentStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg mr-3">
              <FiXCircle className="text-red-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Failed</p>
              <p className="text-lg sm:text-xl font-bold">
                {bookings.filter(b => b.paymentStatus === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-gray-500">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-12 text-center">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-gray-500 max-w-prose mx-auto">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Date
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-xs font-mono text-gray-900">
                        {booking._id.substring(0, 10)}...
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.userEmail}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(booking.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.eventDate)}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.items.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Payment ID: {booking.razorpay_payment_id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.items.total)}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.paymentStatus === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.paymentStatus === 'failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-gray-500">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-xl p-6">
            <FiSearch className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {booking.items.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      ID: {booking._id.substring(0, 16)}...
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    booking.paymentStatus === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.paymentStatus === 'failed' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center text-sm mt-1">
                  <FiUser className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{booking.userEmail}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Booked On</div>
                    <div className="text-sm font-medium mt-1">
                      {formatDate(booking.createdAt, false)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Event Date</div>
                    <div className="text-sm font-medium mt-1">
                      {formatDate(booking.eventDate, false)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Payment ID</div>
                  <div className="text-sm font-medium mt-1 truncate">
                    {booking.paymentId || 'Not available'}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(booking.items.total)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;
