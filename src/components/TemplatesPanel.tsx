import { X, BookOpen, Search } from 'lucide-react';
import { useState } from 'react';
import { templates, categories } from '../utils/templates';
import { useLanguage } from '../contexts/LanguageContext';

interface TemplatesPanelProps {
  onSelect: (content: string) => void;
  onClose: () => void;
}

export default function TemplatesPanel({ onSelect, onClose }: TemplatesPanelProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('templates.title')}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close templates"
          className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('templates.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`cp-button ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t(`templates.categories.${category.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('templates.noResults')}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template.content)}
              className="text-left p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {t(`templates.${template.id.toLowerCase()}.name`) || template.name}
                </h4>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded font-medium">
                  {t(`templates.categories.${template.category.toLowerCase()}`) || template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(`templates.${template.id.toLowerCase()}.description`) || template.description}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
