import Navbar from "@/components/Layout/Navbar";
import Adventure from "@/components/sections/adventure/Adventure";
import Booking from "@/components/sections/booking/Booking";
import Footer from "@/components/sections/home/Footer";


export const metadata = {
  title: 'Adventure | River Tiger Resort',
  description:'',
 
};

export default function page() {
  return (
    <div className="font-sans  ">
      {/* <Navbar/> */}
     <Adventure/>
     <Footer/>
    </div>
  );
}
