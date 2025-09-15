// Your UserBooking.jsx with CancelEventModel integrated
'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CancelStayModel from './CancelStayModel';
import CancelEventModel from './CancelEventModel';  // <-- new import

// util — returns true if today is 3-plus days before check-in
const canCancel = (checkIn) => {
  if (!checkIn) return false;                 // safety
  const msPerDay = 86_400_000;
  const today = new Date();               // now
  today.setHours(0, 0, 0, 0);                 // midnight
  const checkDate = new Date(checkIn);
  checkDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((checkDate - today) / msPerDay);
  return daysLeft >= 3;                       // 3 or more days left
};

const UserBooking = () => {
  const [activeTab, setActiveTab] = useState('');
  const [eventBookings, setEventBookings] = useState([]);
  const [adventureBookings, setAdventureBookings] = useState([]);
  const [stayBookings, setStayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null, type: '' });  // <-- added type

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  function closeCancelModal(reload) {
    setCancelModal({ open: false, booking: null, type: '' });
    if (reload) fetchAllBookings();          // refresh list after success
  }

  const fetchAllBookings = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [eventsRes, adventuresRes, staysRes] = await Promise.all([
        fetch('/api/event/bookings', { headers }),
        fetch('/api/adventure/bookings', { headers }),
        fetch('/api/stay/bookings', { headers })
      ]);

      const [eventData, adventureData, stayData] = await Promise.all([
        eventsRes.json(),
        adventuresRes.json(),
        staysRes.json()
      ]);

      if (eventsRes.ok) setEventBookings(eventData.bookings || []);
      if (adventuresRes.ok) setAdventureBookings(adventureData.bookings || []);
      if (staysRes.ok) setStayBookings(stayData.bookings || []);

      if ((eventData.bookings || []).length) setActiveTab('events');
      else if ((adventureData.bookings || []).length) setActiveTab('adventures');
      else if ((stayData.bookings || []).length) setActiveTab('stays');
    } catch (err) {
      console.error('Error fetching all bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllBookings();
  }, [token]);

  const Tab = ({ name, label, count }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-5 py-3 rounded-lg transition-all duration-300 ease-in-out flex items-center ${activeTab === name
        ? 'bg-emerald-600 text-white shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === name ? 'bg-emerald-700' : 'bg-gray-300'
          }`}>
          {count}
        </span>
      )}
    </button>
  );

  const formatDate = (dateString, options) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ', ' + formatDate(dateString);
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'success' || status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
      status === 'pending' ? 'bg-amber-100 text-amber-800' :
        'bg-red-100 text-red-800'
      }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Your Bookings</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          View and manage all your upcoming and past bookings in one place
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : activeTab === '' ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto bg-gray-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
          <p className="text-gray-600 mb-4">{`You haven't made any bookings yet. Start exploring our offerings!`}</p>
          <Link href="/aboutus" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300">
            Explore Activities
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {stayBookings.length > 0 && <Tab
              name="stays"
              label="Stays"
              count={stayBookings.length}
            />}
            {adventureBookings.length > 0 && <Tab
              name="adventures"
              label="Adventures"
              count={adventureBookings.length}
            />}
            {eventBookings.length > 0 && <Tab
              name="events"
              label="Events"
              count={eventBookings.length}
            />}
          </div>

          <div className="space-y-6">
            {activeTab === 'events' && eventBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start">

                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">{booking.items.title}</h3>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-700">₹{booking.totalAmount}</p>
                          <StatusBadge status={booking.paymentStatus} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Event: {formatDate(booking?.eventDate, { weekday: 'long' })}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Booked on: {formatDateTime(booking.createdAt)}</span>

                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.paymentStatus === 'success' && !booking.refund.requested && (
                    <div className="flex items-end justify-end my-2">
                      <button
                        onClick={() => setCancelModal({ open: true, booking, type: 'event' })}
                        className="w-full md:w-auto py-2 px-4 rounded-lg bg-amber-500 text-white text-sm
                                     hover:bg-amber-600 focus:outline-none">
                        Cancel booking
                      </button>
                    </div>
                  )}

                  {booking.refund.approved &&
                    <div className="flex items-end justify-end">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">Refund {booking.refund.status}</span>
                      </p>
                    </div>
                  }

                  {booking.refund.requested && !booking.refund.approved &&
                    <div className="flex items-end justify-end">
                      <p className="text-sm text-gray-600">
                        Refund Status: <span className="font-medium text-amber-600">{booking.refund.status}</span>
                      </p>
                    </div>
                  }
                </div>
              </div>
            ))}

            {activeTab === 'adventures' && adventureBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Adventure Package</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(booking.adventureDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-700">₹{booking.totalAmount}</p>
                          <StatusBadge status={booking.paymentStatus} />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Activities:</h4>
                        <ul className="space-y-2">
                          {booking.items.map((item) => (
                            <li key={item._id} className="flex justify-between">
                              <span className="text-gray-600">
                                {item.name} × {item.count}
                              </span>
                              <span className="font-medium">₹{item.total}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {booking.paymentStatus === 'success' && !booking.refund.requested && (
                    <div className="flex items-end justify-end my-2">
                      <button
                        onClick={() => setCancelModal({ open: true, booking, type: 'adventure' })}
                        className="w-full md:w-auto py-2 px-4 rounded-lg bg-amber-500 text-white text-sm
                                     hover:bg-amber-600 focus:outline-none">
                        Cancel booking
                      </button>
                    </div>
                  )}

                  {booking.refund.approved &&
                    <div className="flex items-end justify-end">
                      <p className="text-sm text-gray-600">
                        Refund Status: <span className="font-medium text-green-600">{booking.refund.status}</span>
                      </p>
                    </div>
                  }

                  {booking.refund.requested && !booking.refund.approved &&
                    <div className="flex items-end justify-end">
                      <p className="text-sm text-gray-600">
                        Refund Status: <span className="font-medium text-amber-600">{booking.refund.status}</span>
                      </p>
                    </div>
                  }
                </div>
              </div>
            ))}

            {activeTab === 'stays' && stayBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row">
                    {/* <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full md:w-1/3 h-48 md:h-auto mr-0 md:mr-6 mb-4 md:mb-0" /> */}

                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{booking.stayName}</h3>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-700">₹{booking.totalPrice}</p>
                          <StatusBadge status={booking.paymentStatus} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-2">
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p>Check-in: {formatDate(booking.checkIn)}</p>
                            <p>Check-out: {formatDate(booking.checkOut)}</p>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{booking.adults} Adults, {booking.children} Children</span>
                        </div>
                      </div>
                      {/* add-ons + cancel */}
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* add-ons take two columns on md+ */}
                        {booking.addons?.length > 0 && (
                          <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 mb-2">Add-ons:</h4>
                            <ul className="space-y-2">
                              {booking.addons.map((a) => (
                                <li key={a.id} className="flex justify-between text-gray-600">
                                  <span>{a.title} × {a.participants} </span>
                                  <span className="font-medium">₹{a.totalPrice}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {booking.paymentStatus === 'success' && !booking.refund.requested && (
                        <div className="flex items-end justify-end my-2">
                          <button
                            onClick={() => setCancelModal({ open: true, booking, type: 'stay' })}
                            className="w-full py-2 px-4 rounded-lg bg-amber-500 text-white text-sm
                 hover:bg-amber-600 focus:outline-none">
                            Cancel booking
                          </button>
                        </div>
                      )}
                      {booking.refund.approved &&
                        <div className="flex items-end justify-end">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-green-600">Refund {booking.refund.status}</span>
                          </p>
                        </div>
                      }
                      {booking.refund.requested && !booking.refund.approved &&
                        <div className="flex items-end justify-end">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-amber-600">Refund {booking.refund.status}</span>
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
      }
      <CancelStayModel
        isOpen={cancelModal.open && cancelModal.type === 'stay'}
        booking={cancelModal.booking}
        onClose={closeCancelModal}
      />
      <CancelEventModel
        isOpen={cancelModal.open && cancelModal.type === 'event'}
        booking={cancelModal.booking}
        onClose={closeCancelModal}
      />
      {/* <CancelAdventureModel
        isOpen={cancelModal.open && cancelModal.type === 'adventure'}
        booking={cancelModal.booking}
        onClose={closeCancelModal}
      /> */}

    </div >
  );
};


export default UserBooking; 
