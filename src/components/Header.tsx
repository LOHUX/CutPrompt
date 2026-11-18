import { Moon, Sun, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onShowGuide?: () => void;
}

export default function Header({ onShowGuide }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm gradient-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50">
                <img 
                  src="/cutprompt-logo.png"
                  alt="CutPrompts Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white m-0">
                  {t('header.title')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block m-0">
                  {t('header.subtitle')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setLanguage('en')}
                className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  language === 'en'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                }`}
                aria-label="English"
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('vi')}
                className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  language === 'vi'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                }`}
                aria-label="Tiếng Việt"
                title="Tiếng Việt"
              >
                VI
              </button>
            </div>

            {onShowGuide && (
              <button
                onClick={onShowGuide}
                className="cp-button bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50"
                aria-label="How to use"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('header.howToUse')}</span>
              </button>
            )}
            
            <button
              onClick={toggleTheme}
              className="cp-icon-button bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
