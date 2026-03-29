import { Hero } from './components/Hero';
import { ComparisonSection } from './components/ComparisonSection';
import { ThreeModes } from './components/ThreeModes';
import { MCPSection } from './components/MCPSection';
import { RealResults } from './components/RealResults';
import { CISection } from './components/CISection';
import { Footer } from './components/Footer';

export function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Hero />
      <main id="main">
        <ComparisonSection />
        <ThreeModes />
        <MCPSection />
        <RealResults />
        <CISection />
      </main>
      <Footer />
    </>
  );
}
