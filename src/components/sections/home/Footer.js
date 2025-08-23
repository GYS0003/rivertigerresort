'use client'

import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-[#163B2A] text-[#F4EBD0] px-4 py-10 sm:px-6 lg:px-12 text-sm font-sans">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start gap-10 border-b border-[#F4EBD0]/30 pb-8">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white mb-2">River Tiger Resort</h3>
          <p className="text-sm text-[#F4EBD0]">Village Kanasar,<br />Chakrata, Uttarakhand</p>
          <p className="mt-2 text-[#F4EBD0]">+91 9389 303576</p>
          <div className="flex gap-4 mt-4">
            <a href="https://www.facebook.com/RiverTigerResortCampingAdventure/" aria-label="Facebook" className="text-white hover:text-[#F4EBD0]">
              <FaFacebookF />
            </a>
            <a href='https://www.instagram.com/rivertiger_resort/' aria-label="Instagram" className="text-white hover:text-[#F4EBD0]">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Link Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-[#F4EBD0] text-sm">
          <a href="/aboutus" className="hover:underline">About</a>
          <a href="/gallery" className="hover:underline">Gallery</a>
          <a href="/contactus" className="hover:underline">Contact Us</a>
          <a href="/terms-conditions" className="hover:underline">Terms & Conditions</a>
          <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>

      {/* Subscribe Section */}
      <div className="max-w-3xl mx-auto mt-10 text-center">
        <h4 className="text-base sm:text-lg text-white font-medium mb-4">
          Ready for Your Next Adventure?
        </h4>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full sm:w-auto px-4 py-2 rounded border border-[#F4EBD0] bg-transparent text-[#F4EBD0] placeholder-[#F4EBD0]/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button className="bg-[#F4EBD0] text-[#163B2A] font-medium px-6 py-2 rounded hover:bg-amber-100 transition">
            Subscribe →
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center text-xs mt-8 text-[#F4EBD0]/80">
        © 2025 River Tiger Resort. All rights reserved.
        <div className='mt-2'>
        Powered by <a href="https://www.gystechnologies.in/" target="_blank" rel="noopener noreferrer" className="text-[#F4EBD0] hover:underline">GYS Technologies</a>
      </div>
      </div>
    </footer>
  )
}
