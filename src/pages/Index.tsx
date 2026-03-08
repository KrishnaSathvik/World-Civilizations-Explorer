import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CivilizationGrid } from "@/components/CivilizationGrid";
import { ThisWeekInHistory } from "@/components/ThisWeekInHistory";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CivilizationGrid />
        <ThisWeekInHistory />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
