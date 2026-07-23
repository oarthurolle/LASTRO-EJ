import Hero from "../../components/sections/Home/Hero/Hero";
import Indicators from "../../components/sections/Home/Indicators/Indicators";
import Services from "../../components/sections/Home/Services/Services";
import Partners from "../../components/sections/Home/Partners/Partners";
import Testimonials from "../../components/sections/Home/Testimonials/Testimonials";
import CTA from "../../components/sections/Home/CTA/CTA";
import "./Home.css";

export default function Home() {
  return (
   <main className="home">
      <Hero />
      <Indicators />
      <Services />
      <Partners />
      <Testimonials />
      <CTA />
    </main>
  );
}
  