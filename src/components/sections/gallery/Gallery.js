'use client';

import React from 'react';

const Gallery = () => {
    const images = ['/Home/Gallery/camp.avif', '/Home/Gallery/capms.jpeg', '/Home/Gallery/cottage.webp', '/Home/Gallery/dining.jpg', '/Home/Gallery/home.avif', '/Home/Gallery/rooms.jpg', '/Home/Gallery/stay.avif', '/Home/Gallery/tents.webp', '/Home/Gallery/tentsriver.jpeg', '/Home/Gallery/villa.webp','/Home/Gallery/rt1.avif', '/Home/Gallery/rt3.avif', '/Home/Gallery/rt4.avif', '/Home/Gallery/rt5.avif', '/Home/Gallery/rt6.avif', '/Home/Gallery/rtv3.avif', '/Home/Gallery/rtv4.jpeg', '/Home/Gallery/rtv4.avif', '/Home/Gallery/rtv6.jpg'];
    if (!images.length) return null;

    return (
        <div className="">
            <div className="relative h-60 md:h-80 bg-cover bg-center"
                style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">Gallery </h1>
                        <p className="text-base md:text-xl max-w-2xl mx-auto">{`We're Here to Help You Plan Your Escape to Nature`}</p>
                    </div>
                </div>
            </div>
            <div className="  max-w-5xl p-4 mx-auto ">
            <div 
                className="columns-2 md:columns-3 lg:columns-4 gap-4"
            >
                {images.map((img, index) => (
                    <div 
                        key={index} 
                        className="relative group overflow-hidden rounded-xl mb-4 break-inside-avoid transition-all duration-500
                                   opacity-[var(--i,1)] hover:!opacity-100
                                   scale-[var(--i,1)] hover:!scale-105"
                        style={{'--i': 'calc(1 - var(--hover, 0))'}}
                    >
                        <img
                            src={img}
                            alt={`Gallery image ${index + 1}`}
                            className="object-cover w-full h-auto transition-transform duration-500"
                        />
                        {/* Overlay with a gradient and icon that appears on hover */}
                        {/* <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                       flex items-center justify-center"
                        >
                            <div className="p-4 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <ViewIcon />
                                <h3 className="text-white font-bold mt-2">View Image</h3>
                            </div>
                        </div> */}
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
};

export default Gallery;
