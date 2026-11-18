import { BarChart, FileText, Hash } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { graphemeCount } from '../utils/tokenCounter';

interface TokenDisplayProps {
  tokens: number;
  maxTokens: number;
  text: string;
}

export default function TokenDisplay({ tokens, maxTokens, text }: TokenDisplayProps) {
  const { t } = useLanguage();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = graphemeCount(text);
  const lines = text ? text.split('\n').length : 0;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  
  const exceedsLimit = tokens > maxTokens;
  const percentage = Math.min(100, Math.round((tokens / maxTokens) * 100));

  return (
    <div className="mt-4 space-y-3">
      {/* Main Token Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ~{tokens.toLocaleString()} {t('main.tokens')} ({t('main.estimatedTokens') === 'main.estimatedTokens' ? 'estimated' : t('main.estimatedTokens')})
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('main.max')} {maxTokens.toLocaleString()}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {percentage}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            exceedsLimit 
              ? 'bg-red-500' 
              : percentage > 80 
                ? 'bg-yellow-500' 
                : 'bg-teal-500'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
      </div>
      
      {/* Detailed Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('main.words')}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {words.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('main.characters')}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {characters.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('main.lines') === 'main.lines' ? 'Lines' : t('main.lines')}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {lines.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('main.paragraphs') === 'main.paragraphs' ? 'Paragraphs' : t('main.paragraphs')}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {paragraphs.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Warning Message */}
      {exceedsLimit && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t('main.exceedsLimit')}
          </p>
        </div>
      )}
    </div>
  );
}
