
import React from 'react';
import ReceptionLayout from '../ReceptionLayout';
import ReceptionRoute from '@/components/wrappers/ReceptionRoute';
import Bookings from '@/components/sections/admin/category/Bookings';
import StayBookings from '@/components/sections/reception/staybookings/StayBookings';


export const metadata = {
  title: 'Admin Stay Offline Booking | River Tiger Resort',
  description:'',
 
};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <ReceptionRoute>
        <ReceptionLayout>
        <StayBookings/>
        </ReceptionLayout>
        </ReceptionRoute>
    </div>
  );
};

export default page;


