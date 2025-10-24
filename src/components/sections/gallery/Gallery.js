'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
                    setImages(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch gallery images:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    const SkeletonLoader = () => (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {[...Array(12)].map((_, index) => (
                <div 
                    key={index}
                    className="relative overflow-hidden rounded-xl mb-4 break-inside-avoid bg-gray-200 animate-pulse"
                    style={{ height: `${Math.random() * 200 + 200}px` }}
                />
            ))}
        </div>
    );

    return (
        <div className="">
            <div className="relative h-60 md:h-80 bg-cover bg-center"
                style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">Gallery</h1>
                        <p className="text-base md:text-xl max-w-2xl mx-auto">{`We're Here to Help You Plan Your Escape to Nature`}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl p-4 mx-auto">
                {loading ? (
                    <SkeletonLoader />
                ) : images.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No images available</p>
                    </div>
                ) : (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                        {images.map((image, index) => (
                            <div 
                                key={image._id}
                                className="relative group overflow-hidden rounded-xl mb-4 break-inside-avoid transition-all duration-500
                                           opacity-[var(--i,1)] hover:!opacity-100
                                           scale-[var(--i,1)] hover:!scale-105"
                                style={{'--i': 'calc(1 - var(--hover, 0))'}}
                            >
                                <Image
                                    src={image.imageUrl}
                                    alt={`Gallery image ${index + 1}`}
                                    width={500}
                                    height={500}
                                    className="object-cover w-full h-auto transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
