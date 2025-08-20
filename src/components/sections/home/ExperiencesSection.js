'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ExperiencesSection() {
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdventures = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/adventure');
      const data = await res.json();
      setAdventures(data.slice(0, 3)); // Use only first 3 adventures
    } catch (err) {
      console.error('Error fetching adventures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdventures();
  }, []);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-12 text-[#163B2A] font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold">
            Experiences to Remember
          </h2>
          <p className="text-sm sm:text-base mt-2">Camp. Hike. Explore.</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading adventures...</div>
        ) : (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {adventures.map((exp, idx) => (
              <Link href={`/adventure`} key={idx}>
              <div key={idx}>
                <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={exp.image}
                    alt={exp.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="mt-2 text-sm sm:text-base text-[#163B2A] underline hover:no-underline cursor-pointer">
                  {exp.name}
                </p>
              </div>
              </Link>
            ))}
          </div>
        )}
            <div className="flex justify-end items-center">
              <Link href="/adventure">
                <button className="bg-[#163B2A] text-white px-6 py-2 rounded-full">
                  View All
                </button>
              </Link>
            </div>
      </div>
    </section>
  );
}
