'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MdHome, MdMiscellaneousServices, MdHotel, MdContactMail, MdMenu,
} from 'react-icons/md';
import {
  FaImage, FaCalendarAlt, FaCalendarCheck, FaPowerOff, FaHiking, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import { RiGalleryFill } from 'react-icons/ri';
import { BiTestTube } from 'react-icons/bi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('Token');
    router.push('/');
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const navItems = [
    {
      name: "Offline Stay Booking",
      icon: <MdHotel />,
      route: '/adminrivertiger/stay-offline-bookings',
    },
    {
      name: 'Stay Category',
      icon: <MdHome />,
      route: '/adminrivertiger/category',
    },
    {
      name: 'Adventures',
      icon: <RiGalleryFill />,
      route: '/adminrivertiger/adventures',
    },
    {
      name: 'Events',
      icon: <FaCalendarAlt />,
      route: '/adminrivertiger/events',
    },
    {
      name: 'Stay Bookings',
      icon: <MdHotel />,
      route: '/adminrivertiger/stay-booking',
    },
    {
      name: 'Adventure Bookings',
      icon: <FaHiking />,
      route: '/adminrivertiger/adventure-booking',
    },
    {
      name: 'Event Bookings',
      icon: <FaCalendarCheck />,
      route: '/adminrivertiger/event-booking',
    },
    {
      name: 'Contact Us',
      icon: <MdContactMail />,
      route: '/adminrivertiger/contactus',
    },
    {
      name: 'Logout',
      icon: <FaPowerOff />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-30 top-0 left-0 h-full bg-gray-100 border-r border-gray-300 p-4 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:w-64 lg:block`}
      >
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-800">
            ✕
          </button>
        </div>

        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.route || '');
            const hasSubRoutes = item.subRoutes?.length > 0;
            const isOpen = openMenus[item.name];

            return (
              <li key={index}>
                {hasSubRoutes ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center gap-3 w-full p-2 rounded-md hover:bg-purple-100 transition ${
                        isActive ? 'bg-purple-100 font-semibold text-purple-700' : ''
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium flex-1 text-left">{item.name}</span>
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </button>

                    {isOpen && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.subRoutes.map((sub, idx) => (
                          <li key={idx}>
                            <Link
                              href={sub.route}
                              className={`block text-sm p-2 rounded-md hover:bg-purple-100 transition ${
                                pathname === sub.route
                                  ? 'bg-purple-100 font-semibold text-purple-700'
                                  : ''
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="flex items-center gap-3 w-full text-left p-2 rounded-md hover:bg-purple-100 transition"
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    href={item.route}
                    className={`flex items-center gap-3 p-2 rounded-md hover:bg-purple-100 transition ${
                      pathname === item.route
                        ? 'bg-purple-100 font-semibold text-purple-700'
                        : ''
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-300 p-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-800 focus:outline-none"
          >
            <MdMenu size={24} />
          </button>
          <span className="text-lg font-semibold">Admin Panel</span>
          <div className="w-6" />
        </div>

        <main className="p-4 bg-gray-50 h-full">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;