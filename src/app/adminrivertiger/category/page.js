
import React from 'react';
import AdminLayout from '../AdminLayout';
import Category from '@/components/sections/admin/category/Category';
import AdminRoute from '@/components/wrappers/AdminRoute';

export const metadata = {
  title: 'Category | River Tiger Resort',
  description:
    '',

};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <AdminRoute>
        <AdminLayout>
          <Category />
        </AdminLayout>
      </AdminRoute>
    </div>
  );
};

export default page;


