import Booking from "@/components/sections/booking/Booking";

export const metadata = {
  title: 'Booking - River Tiger Resort',
  description: 'Booking for River Tiger Resort',
  icons:{
    icon: '/Home/icon.jpeg',
  }
}

export default function page() {
  return (
    <div className="font-sans  ">
     <Booking/>
    </div>
  );
}
