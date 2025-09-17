import Navbar from "@/components/Layout/Navbar";
import Event from "@/components/sections/event/Event";
import Footer from "@/components/sections/home/Footer";


export const metadata = {
  title: 'Events - River Tiger Resort',
  description: 'Events for River Tiger Resort',
  icons:{
    icon: '/Home/icon.jpeg',
  }
}

export default function page() {
  return (
    <div className="font-sans  ">
      <Navbar/>
     <Event/>
     <Footer/>
    </div>
  );
}
