import { Metadata } from 'next';
import Navbar from "@/components/Layout/Navbar";
import Gallery from "@/components/sections/gallery/Gallery";
import Footer from "@/components/sections/home/Footer";
import LoginSignup from '@/components/sections/login/LoginSignup';

export const metadata = {
  title: 'Login - River Tiger Resort',
  description: 'Login to your account to access your bookings, manage your profile, and enjoy a personalized experience at River Tiger Resort.',

};


export default function Page() {
  return (
    <>
      <div className="font-sans">
        <LoginSignup />
      </div>
    </>
  );
}
