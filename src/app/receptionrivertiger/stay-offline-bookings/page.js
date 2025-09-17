
import React from 'react';
import AdminLayout from '../../adminrivertiger/AdminLayout';
import Bookings from '@/components/sections/admin/category/Bookings';
import AdminRoute from '@/components/wrappers/AdminRoute';
import OflineStayBooking from '@/components/sections/admin/category/OflineStayBooking';
import ReceptionLayout from '../ReceptionLayout';
import ReceptionRoute from '@/components/wrappers/ReceptionRoute';

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
        <OflineStayBooking/>
        </ReceptionLayout>
        </ReceptionRoute>
    </div>
  );
};

export default page;


