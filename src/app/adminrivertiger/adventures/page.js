
import React from 'react';
import AdminLayout from '../AdminLayout';
import Adventures from '@/components/sections/admin/adventures/Adventures';
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
        <Adventures/>
        </AdminLayout>
        </AdminRoute>
    </div>
  );
};

export default page;


