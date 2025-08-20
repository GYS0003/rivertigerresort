
import React from 'react';
import ReceptionLayout from '../ReceptionLayout';
import ReceptionRoute from '@/components/wrappers/ReceptionRoute';
import EventBoking from '@/components/sections/reception/eventbookings/EventBoking';

export const metadata = {
  title: 'Admin Stay Offline Booking | River Tiger Resort',
  description:'',
 
};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <ReceptionRoute>
        <ReceptionLayout>
        <EventBoking/>
        </ReceptionLayout>
        </ReceptionRoute>
    </div>
  );
};

export default page;


