import "./Services.css";

import Hero from "../../components/sections/Services/Hero/Hero";
import Process from "../../components/sections/Services/Process/Process";
import Solutions from "../../components/sections/Services/Solutions/Solutions";
import Catalog from "../../components/sections/Services/Catalog/Catalog";
import ContactBanner from "../../components/sections/Services/ContactBanner/ContactBanner";


export default function Services() {
  return (
    <div className="services-page">
      <Hero />
      <Process />
      <Solutions />
      <Catalog />
      <ContactBanner />
    </div>
  );
}