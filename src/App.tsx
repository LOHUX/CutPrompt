import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PromptSplitter from './components/PromptSplitter';
import Footer from './components/Footer';
import HowToUse from './components/HowToUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import VercelAttribution from './components/VercelAttribution';

function App() {
  const [showHowToUse, setShowHowToUse] = useState(false);

  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
            <Header onShowGuide={() => setShowHowToUse(true)} />
            <main className="container mx-auto px-3 sm:px-4 pt-5 pb-8 md:pt-7 md:pb-9">
              <Routes>
                <Route path="/" element={<PromptSplitter />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
              </Routes>
              <VercelAttribution />
            </main>
            <Footer />
            {showHowToUse && <HowToUse onClose={() => setShowHowToUse(false)} />}
          </div>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
