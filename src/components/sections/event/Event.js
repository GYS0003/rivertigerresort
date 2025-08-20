'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/event');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBookClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!eventDate) {
      alert('Please select a date for the event');
      return;
    }

    const bookingPayload = {
      items: {
        id: selectedEvent._id,
        title: selectedEvent.title,
        price: selectedEvent.startingPrice,
        total: selectedEvent.startingPrice,
      },
      eventDate,
      totalAmount: selectedEvent.startingPrice,
    };
    console.log('Booking new event:', bookingPayload);
    const res = fetch('/api/event/prebooking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload),
    }).then((resp) => {
      return resp.json()
    }).then((res) => {
      router.push('/booking/event/' + res.bookingId);
    }).catch((error) => {
      console.error('Error creating booking:', error);
    })
      
    setIsModalOpen(false);
  };

  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-[#163B2A]">
          Events
        </h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700 mx-auto"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No events available at this time.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={event.image || '/placeholder.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-[#163B2A]">{event.title}</h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-green-700 font-medium">
                        ₹{event.startingPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Capacity: {event.capacity}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookClick(event)}
                      className="bg-[#163B2A] text-white px-4 py-2 rounded hover:bg-green-900 transition text-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Selection Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 bg-black/30  overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <Dialog.Title className="text-lg font-bold mb-4">
              Select Event Date
            </Dialog.Title>

            {selectedEvent && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <Image
                      src={selectedEvent.image || '/placeholder.jpg'}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{selectedEvent.startingPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select a date for your event
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={!eventDate}
                className={`px-4 py-2 rounded-lg ${!eventDate
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-700 text-white hover:bg-green-800'
                  }`}
              >
                Confirm Booking
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Event;