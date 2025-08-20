import Navbar from "@/components/Layout/Navbar";
import Event from "@/components/sections/event/Event";
import Footer from "@/components/sections/home/Footer";

export default function page() {
  return (
    <div className="font-sans  ">
      <Navbar/>
     <Event/>
     <Footer/>
    </div>
  );
}
