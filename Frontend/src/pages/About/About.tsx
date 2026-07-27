import Hero from "../../components/sections/About/Hero/Hero";
import Indicators from "../../components/sections/Home/Indicators/Indicators";
import History from "../../components/sections/About/History/History";
import Essence from "../../components/sections/About/Essence/Essence";
import Differential from "../../components/sections/About/Differential/Differential";
import UERN from "../../components/sections/About/UERN/UERN";
import "./About.css";

export default function About() {
  return (
    <>
      
      <main className="about">
        <Hero />
         <Indicators
            theme="dark"
            floating={false}
        />
        <History />
        <Essence />
        <Differential />
        <UERN />
      </main>
    </>
  );
}