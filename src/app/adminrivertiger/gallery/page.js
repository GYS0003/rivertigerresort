
import React from 'react';
import AdminLayout from '../AdminLayout';
import Events from '@/components/sections/admin/events/Events';
import AdminRoute from '@/components/wrappers/AdminRoute';
import Gallery from '@/components/sections/admin/gallery/Gallery';

export const metadata = {
  title: 'Admin Dashboard | River Tiger Resort',
  description: 'Admin dashboard for River Tiger Resort',
};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <AdminRoute>
        <AdminLayout>
          <Gallery />
        </AdminLayout>
      </AdminRoute>
    </div>
  );
};

export default page;


