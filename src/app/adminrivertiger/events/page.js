
import React from 'react';
import AdminLayout from '../AdminLayout';
import Events from '@/components/sections/admin/events/Events';
import AdminRoute from '@/components/wrappers/AdminRoute';

export const metadata = {
  title: 'Admin Dashboard | River Tiger Resort',
  description:
    '',

};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <AdminRoute>
        <AdminLayout>
          <Events />
        </AdminLayout>
      </AdminRoute>
    </div>
  );
};

export default page;


