
import React from 'react';
import AdminLayout from '../AdminLayout';
import Bookings from '@/components/sections/admin/adventures/Bookings';
import AdminRoute from '@/components/wrappers/AdminRoute';
export const metadata = {
  title: 'Admin Adventure | River Tiger Resort',
  description: '',

};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <AdminRoute>
        <AdminLayout>
          <Bookings />
        </AdminLayout>
      </AdminRoute>
    </div>
  );
};

export default page;


