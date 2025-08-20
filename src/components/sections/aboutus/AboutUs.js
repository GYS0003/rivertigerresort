'use client';

import React from 'react';
import Image from 'next/image';
import StaySection from '../home/StaySection';
import ExperiencesSection from '../home/ExperiencesSection';
import EventSection from '../home/EventSection';
import Link from 'next/link';

const AboutUs = () => {


  // Values data
  const values = [
    {
      title: 'Sustainability',
      description: 'We minimize our environmental footprint through eco-friendly practices and renewable energy.',
      icon: '♻️'
    },
    {
      title: 'Community',
      description: 'We partner with local artisans and farmers to support the regional economy.',
      icon: '🤝'
    },
    {
      title: 'Adventure',
      description: 'We believe in pushing boundaries while maintaining the highest safety standards.',
      icon: '🏔️'
    },
    {
      title: 'Wellness',
      description: 'We create spaces for rejuvenation and connection with nature.',
      icon: '🧘'
    }
  ];

  // Offerings data
  const offerings = [
    {
      title: 'Luxury Tents',
      description: 'Eco-luxury tents with comfortable beds, private decks, and stunning views.',
      image: '/tent'
    },
    {
      title: 'Adventure Packages',
      description: 'Curated experiences from river rafting to mountain treks with expert guides.',
      image: '/adventure'
    },
    {
      title: 'Event Hosting',
      description: 'Memorable weddings, corporate retreats, and special celebrations in nature.',
      image: '/event'
    }
  ];

  return (
    <div className="font-sans text-gray-800 bg-white">

      <div className="relative h-60 md:h-80 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">About Us </h1>
            <p className="text-base md:text-xl max-w-2xl mx-auto">Reconnect. Rewild. Rejuvenate.</p>
          </div>
        </div>
      </div>
      {/* Our Story */}
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Our Story</h2>
          <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Started with a passion for nature and adventure, River Tiger Resort was envisioned
              as a sanctuary for explorers, families, and dreamers.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              What began as a few tents by the river has now grown into a full-fledged retreat offering
              stays, experiences, and event planning — all with nature at the heart of it.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, we welcome thousands of guests annually who come to experience the magic of the
              Himalayas and create memories that last a lifetime.
            </p>
          </div>

          <div className="order-1 lg:order-2 relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/Home/Gallery/cottage.webp" // Replace with your image path or external URL
              alt="Descriptive Alt Text"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section id='stay' className="py-16 bg-emerald-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center ">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">What We Offer</h2>
            <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
              Stays and experiences that speak to the soul
            </p>
            <div className="w-20 h-1 bg-emerald-600 mx-auto mt-4"></div>
          </div>
          <StaySection />
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerings.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Our Values */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center ">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">Adventures That Thrill</h2>
            <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <ExperiencesSection />
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div> */}
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center ">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-800 font-bold mb-2">Events That Last a Lifetime</h2>
            <div className="w-20 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <EventSection />
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div> */}
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready for Your Adventure?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join us at River Tiger Resort and experience the magic of the Himalayas
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={'/aboutus#stay'} className="px-8 py-3 bg-white text-emerald-800 font-bold rounded-lg hover:bg-emerald-100 transition-colors">
              Book Your Stay
            </Link>
            <Link href={'/gallery'} className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              View Experiences
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;