
import React from 'react';

import Login from '@/components/sections/admin/login/Login';
export const metadata = {
  title: 'Admin Login | River Tiger Resort',

  description:
    '',
 
};


const page = () => {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
        <Login/>
    </div>
  );
};

export default page;


