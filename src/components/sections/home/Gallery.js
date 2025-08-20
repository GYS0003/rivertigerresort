import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Gallery = () => {
  return (
    <div className="px-4 py-8 sm:py-12 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-[#163B2A]">
        Our Gallery
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Image 1 */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group">
          <Image
            src="/Home/Gallery/tentsriver.jpeg"
            alt="Modern River Tiger building with blue and white lights at night"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-medium text-lg">River Camping</span>
          </div>
        </div>

        {/* Image 2 */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group">
          <Image
            src="/Home/Gallery/home.avif"
            alt="Waterfall cascading into pool with people posing"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-medium text-lg">Mountain View</span>
          </div>
        </div>

        {/* Image 3 */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group">
          <Image
            src="/Home/Gallery/rt3.avif"
            alt="Person sitting by calm river on rock"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-medium text-lg">River Side</span>
          </div>
        </div>

        {/* Image 4 */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group">
          <Image
            src="/Home/Gallery/dining.jpg"
            alt="White house in lush green valley with stream"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-medium text-lg">Dining Area</span>
          </div>
        </div>
      </div>
      <Link href="/gallery">
        <button className="block w-full sm:w-auto mx-auto mt-8 px-6 py-2 bg-[#163B2A] text-white font-medium rounded-full hover:bg-[#143327] transition-colors duration-300">
          View More
        </button>
      </Link>
    </div>
  );
};

export default Gallery;