import { Heart, Shield, Zap, Globe, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import VisitCounter from './VisitCounter';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900 gradient-border">
      <div className="container mx-auto px-4 py-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <img 
                  src="/cutprompt-logo.png"
                  alt="CutPrompts Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                CutPrompts
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{t('footer.secure')}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>{t('footer.fast')}</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {t('footer.features')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {t('footer.feature1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                {t('footer.feature2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                {t('footer.feature3')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {t('footer.feature4')}
              </li>
            </ul>
          </div>

          {/* Compatibility Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {t('footer.compatibleWith')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('footer.compatible')}
            </p>
            <div className="flex flex-wrap gap-2">
              {['ChatGPT', 'Claude', 'Gemini', 'Llama', 'Mistral'].map((model) => (
                <span
                  key={model}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t('footer.madeWith')}</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>{t('footer.for')}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <a
                href="https://ko-fi.com/lohux"
                target="_blank"
                rel="noopener noreferrer"
                className="cp-button bg-[#72a4f2] hover:bg-[#588bdb] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                <Coffee className="w-4 h-4" />
                <span>{t('footer.kofi')}</span>
              </a>
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Link 
                  to="/privacy" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
                <Link 
                  to="/terms" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t('footer.terms')}
                </Link>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{t('footer.free')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500 dark:text-gray-400">
            <span aria-live="polite"><VisitCounter /></span>
            <a href="https://github.com/LOHUX" target="_blank" rel="noopener noreferrer" className="hover:underline">
              {t('footer.by')} <strong>lohux.dev</strong>
            </a>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} CutPrompts · LOHUX. {t('footer.rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
