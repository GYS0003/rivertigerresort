'use client'

import Image from 'next/image'
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-green-900">
        Where Adventure Meets Serenity
      </h2>

      {/* Description */}
      <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed font-sans">
        Nestled in the heart of Chakrata, River Tiger offers a soulful escape into nature — from peaceful riverside tents to adrenaline-pumping adventures.
      </p>

      {/* Image */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 mt-8 rounded-xl overflow-hidden shadow-lg">
        <Image
          src="/Home/SatySection/tent.png" // Replace with actual image
          alt="View from tent"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Button */}
      <div className="mt-6">
        <Link href={'/aboutus'} className="bg-amber-100 text-green-900 font-medium text-sm sm:text-base px-6 py-2 rounded-full shadow hover:bg-amber-200 transition">
          Know More About Us
        </Link>
      </div>
    </section>
  );
}
