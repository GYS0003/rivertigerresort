import AdventureBooking from "@/components/sections/booking/AdventureBooking";

export const metadata = {
  title: 'Adventure Booking - River Tiger Resort',
  description: 'Adventure Booking for River Tiger Resort',
  icons:{
    icon: '/Home/icon.jpeg',
  }
}

export default function page() {
  return (
    <div className="font-sans  ">
     <AdventureBooking/>
    </div>
  );
}
