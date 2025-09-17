import EventBooking from "@/components/sections/booking/EventBooking";

export const metadata = {
  title: 'Event Booking - River Tiger Resort',
  description: 'Event Booking for River Tiger Resort',
  icons:{
    icon: '/Home/icon.jpeg',
  }
}

export default function page() {
  return (
    <div className="font-sans  ">
     <EventBooking/>
    </div>
  );
}
