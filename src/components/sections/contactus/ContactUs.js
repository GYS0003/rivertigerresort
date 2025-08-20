'use client';

import React, { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaGoogle, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
  
    try {
      const response = await fetch('/api/contactus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
  
      setSubmitSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: ''
      });
  
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 font-sans">
      {/* Hero Section */}
      <div className="relative h-60 md:h-80 bg-cover bg-center" 
           style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Contact Us</h1>
            <p className="text-base md:text-xl max-w-2xl mx-auto">{`We're Here to Help You Plan Your Escape to Nature`}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
            
            {submitSuccess ? (
              <div className="bg-emerald-100 text-emerald-700 p-4 rounded-lg mb-6 flex items-center">
                <FaPaperPlane className="mr-3 text-xl" />
                <div>
                  <p className="font-semibold">Message sent successfully!</p>
                  <p className="text-sm">{`We'll get back to you soon.`}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                      +91
                    </span>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter your Message*</label>
                  <textarea 
                    rows="5" 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full bg-emerald-600 text-white font-medium py-3 rounded-lg hover:bg-emerald-700 transition flex justify-center items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-3 rounded-full mr-4">
                    <FaMapMarkerAlt className="text-emerald-600 text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-gray-800">Resort Address</h3>
                    <p className="text-gray-600 mt-1">
                      Blue Tiger Resort & Camping Adventure<br />
                      Village: Lakhamandal, Tehsil Kalsi<br />
                      District: Dehradun, Uttarakhand, India
                    </p>
                    <a 
                      href="https://maps.app.goo.gl/RQCtAAAqimHdXgQp8" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-emerald-600 hover:underline"
                    >
                      View on map
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-3 rounded-full mr-4">
                    <FaPhone className="text-emerald-600 text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-gray-800">Phone & WhatsApp</h3>
                    <p className="mt-1">
                      <a 
                        href="https://wa.me/917818896167" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-emerald-600"
                      >
                        <FaWhatsapp className="mr-2 text-emerald-500" />
                        +91 9389 303576
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-3 rounded-full mr-4">
                    <FaEnvelope className="text-emerald-600 text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-gray-800">Email</h3>
                    <p className="mt-1">
                      <a 
                        href="mailto:info.rivertigerresort@gmail.com" 
                        className="text-emerald-600 hover:underline"
                      >
                        info.rivertigerresort@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Connect With Us</h2>
              <p className="text-gray-600 mb-5">Follow us on social media to stay updated with our latest offers and adventures.</p>
              
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/rivertigerresortchakratahill?igsh=MWF1N2ZtbHFzaHB1dg=="
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition"
                >
                  <FaInstagram className="text-lg" />
                </a>
                <a 
                  href="https://www.facebook.com/RiverTigerResortCampingAdventure/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition"
                >
                  <FaFacebook className="text-lg" />
                </a>
                <a 
                  href="https://www.google.com/search?q=river+tiger+resort+%26+camping+adventure&rlz=1C1CHBD_enIN1033IN1033&oq=river+tiger&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDkyEwgCEC4YrwEYxwEYgAQYmAUYmgUyBwgDEAAYgAQyBwgEEAAYgAQyBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQg3MTU4ajBqNKgCALACAA&sourceid=chrome&ie=UTF-8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition"
                >
                  <FaGoogle className="text-lg" />
                </a>
              </div>
              
              {/* <div className="mt-6 text-sm bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">Business Hours</h3>
                <p className="text-gray-600 mt-1">Monday - Sunday: 8:00 AM - 9:00 PM</p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;