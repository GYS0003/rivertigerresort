'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gallery?enabled=true');
        const data = await res.json();
        
        if (data.success) {
          setImages(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Don't render if no images
  if (!loading && images.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-8 sm:py-12 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-[#163B2A]">
        Our Gallery
      </h2>
      
      {loading ? (
        // Skeleton loading state
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg"
            >
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        // Actual images
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {images.map((image, index) => (
            <div 
              key={image._id}
              className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <Image
                src={image.imageUrl}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-medium text-lg">View Image</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/gallery">
        <button className="block w-full sm:w-auto mx-auto mt-8 px-6 py-2 bg-[#163B2A] text-white font-medium rounded-full hover:bg-[#143327] transition-colors duration-300">
          View More
        </button>
      </Link>
    </div>
  );
};

export default Gallery;
