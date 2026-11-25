import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Intro from "@/components/Intro";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Capabilities from "@/components/Capabilities";
import Process from "@/components/Process";
import Purpose from "@/components/Purpose";
import WhyUs from "@/components/WhyUs";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Testimonials />
        <Intro />
        <Marquee />
        <Services />
        <Work />
        <Capabilities />
        <Process />
        <Purpose />
        <WhyUs />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
