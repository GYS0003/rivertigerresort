
import React from 'react';
import AdminLayout from '../AdminLayout';
import Bookings from '@/components/sections/admin/category/Bookings';
import AdminRoute from '@/components/wrappers/AdminRoute';
import OflineStayBooking from '@/components/sections/admin/category/OflineStayBooking';

export const metadata = {
  title: 'Admin Stay Booking | River Tiger Resort',
  description:'',
 
};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <AdminRoute>
        <AdminLayout>
        <OflineStayBooking/>
        </AdminLayout>
        </AdminRoute>
    </div>
  );
};

export default page;


