import Hero from "../../components/sections/About/Hero/Hero";
import Indicators from "../../components/sections/Home/Indicators/Indicators";
import History from "../../components/sections/About/History/History";
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
      </main>
    </>
  );
}