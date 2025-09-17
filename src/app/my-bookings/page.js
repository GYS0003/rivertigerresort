import Event from "@/components/sections/event/Event";
import UserBooking from "@/components/sections/UserBooking/UserBooking";


export const metadata = {
  title: 'My Bookings - River Tiger Resort',
  description: 'My Bookings for River Tiger Resort',
  icons:{
    icon: '/Home/icon.jpeg',
  }
}
export default function page() {
  return (
    <div className="font-sans  ">
     <UserBooking/>
    </div>
  );
}
