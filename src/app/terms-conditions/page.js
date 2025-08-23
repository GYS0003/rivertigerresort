import TermsandConditions from '@/components/sections/termsandprivacy/TermsandConditions';
import { Metadata } from 'next';


export const metadata = {
  title: 'Terms and Conditions - River Tiger Resort',
  description: 'Terms and Conditions for River Tiger Resort',

};


export default function Page() {
  return (
    <>
      <div className="font-sans">
        <TermsandConditions />
      </div>
    </>
  );
}
