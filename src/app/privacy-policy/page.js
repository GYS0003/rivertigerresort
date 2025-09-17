import PrivacyandPolicy from '@/components/sections/termsandprivacy/PrivacyandPolicy';
import { Metadata } from 'next';


export const metadata = {
  title: 'Privacy Policy - River Tiger Resort',
  description: 'Privacy Policy for River Tiger Resort',
  icons:{
    icon: '/Home/icon.jpeg',
  }
};


export default function Page() {
  return (
    <>
      <div className="font-sans">
        <PrivacyandPolicy />
      </div>
    </>
  );
}
