import { Hero } from './components/Hero';
import { ComparisonSection } from './components/ComparisonSection';
import { ThreeModes } from './components/ThreeModes';
import { ComponentSection } from './components/ComponentSection';
import { MCPSection } from './components/MCPSection';
import { VerificationSection } from './components/VerificationSection';
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
        <ComponentSection />
        <MCPSection />
        <VerificationSection />
        <RealResults />
        <CISection />
      </main>
      <Footer />
    </>
  );
}
