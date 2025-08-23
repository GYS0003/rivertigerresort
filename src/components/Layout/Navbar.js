// components/Navbar.jsx
'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Check authentication status
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthenticated(!!token);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to determine if a link is active
  const isActiveLink = (href) => {
    return pathname === href ||
      (href !== '/' && pathname.startsWith(href));
  };

  // Navigation items
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/aboutus", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contactus", label: "Contact Us" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-amber-100 shadow-lg py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white">
                <Image
                  src="/Home/icon.jpeg"
                  alt="River Tiger Resort Logo"
                  width={45}
                  height={45}
                  className="object-cover rounded-full"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-baseline justify-center space-x-8">
            <div className="flex space-x-8 ">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors relative ${scrolled ? 'text-gray-700' : 'text-white'
                    } ${isActiveLink(item.href)
                      ? 'text-amber-600 font-semibold'
                      : 'hover:text-amber-600'
                    }`}
                >
                  {item.label}
                  {isActiveLink(item.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600"></span>
                  )}
                </Link>
              ))}

              {/* Conditionally show My Bookings */}
              {isAuthenticated ? (
                <Link
                  href="/my-bookings"
                  className={`font-medium transition-colors relative ${scrolled ? 'text-gray-700' : 'text-white'
                    } ${isActiveLink('/my-bookings')
                      ? 'text-amber-600 font-semibold'
                      : 'hover:text-amber-600'
                    }`}
                >
                  My Bookings
                  {isActiveLink('/my-bookings') && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600"></span>
                  )}
                </Link>
              ) : (
                <Link href="/login" className='rounded-lg  text-orange-500  font-bold  '>
                  LogIn
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${scrolled ? 'text-gray-700' : 'text-white'}`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className={`px-4 pt-2 pb-4 space-y-1 ${scrolled ? 'bg-white' : 'bg-gray-800'}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${scrolled
                  ? `${isActiveLink(item.href) ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`
                  : `${isActiveLink(item.href) ? 'bg-gray-700' : 'text-white hover:bg-gray-700'}`
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Conditionally show My Bookings in mobile menu */}
          {isAuthenticated ? (
            <Link
              href="/my-bookings"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${scrolled
                  ? `${isActiveLink('/my-bookings') ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`
                  : `${isActiveLink('/my-bookings') ? 'bg-gray-700' : 'text-white hover:bg-gray-700'}`
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              My Bookings
            </Link>
          ) : (
            <Link href="/login" className='rounded-lg px-2 py-2 mt-4 mx-2 bg-orange-300 font-bold text-sm border-orange-600'>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;