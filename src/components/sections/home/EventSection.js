'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/event');
      const data = await res.json();
      setEvents(data.slice(0, 3)); // show only 3 events
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-12 text-[#163B2A] font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold">
            Plan Unforgettable Moments with Us
          </h2>
          <p className="text-sm sm:text-base mt-2">Plan. Celebrate. Cherish.</p>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading events...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, idx) => (
              <Link href={'/event'} key={idx}>
                <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="mt-2 text-sm sm:text-base text-[#163B2A] underline hover:no-underline cursor-pointer">
                  {event.title}
                </p>
              </Link>
            ))}
          </div>
        )}
        {events.length > 3 && <div className="flex justify-center items-center">
           <Link href="/event">
             <button className="bg-[#163B2A] text-white px-6 py-2 rounded-full">
               View All
             </button>
           </Link>
         </div>}
      </div>
    </section>
  );
}
