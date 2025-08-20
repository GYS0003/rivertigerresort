
import React from 'react';
import AdminLayout from '../AdminLayout';
import Category from '@/components/sections/admin/category/Category';
import AdminRoute from '@/components/wrappers/AdminRoute';
import ContactUs from '@/components/sections/admin/contactus/ContactUs';

export const metadata = {
  title: 'Contact Us | River Tiger Resort',
  description:
    '',

};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <AdminRoute>
        <AdminLayout>
          <ContactUs />
        </AdminLayout>
      </AdminRoute>
    </div>
  );
};

export default page;


