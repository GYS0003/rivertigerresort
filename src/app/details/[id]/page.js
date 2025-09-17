import Details from "@/components/sections/details/Details";
import Home from "@/components/sections/home/Home";

export const metadata = {
  title: "River Tigert Resort | Details",
  description: "River Tigert Resort | Details",
  icons:{
    icon: '/Home/icon.jpeg',
  }
};

export default function page() {
  return (
    <div className="font-sans  ">
     <Details/>
    </div>
  );
}
