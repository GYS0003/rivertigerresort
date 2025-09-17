
import React from 'react';
import AdminLayout from '../../adminrivertiger/AdminLayout';
import Bookings from '@/components/sections/admin/category/Bookings';
import AdminRoute from '@/components/wrappers/AdminRoute';
import OflineStayBooking from '@/components/sections/admin/category/OflineStayBooking';
import ReceptionLayout from '../ReceptionLayout';
import ReceptionRoute from '@/components/wrappers/ReceptionRoute';
import EventBoking from '@/components/sections/reception/eventbookings/EventBoking';
import AdventureBookings from '@/components/sections/reception/adventurebooking/AdventureBookings';

export const metadata = {
  title: 'Admin Stay Offline Booking | River Tiger Resort',
  description:'',
   icons:{
    icon: '/Home/icon.jpeg',
  }
};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <ReceptionRoute>
        <ReceptionLayout>
        <AdventureBookings/>
        </ReceptionLayout>
        </ReceptionRoute>
    </div>
  );
};

export default page;


