import { X, Copy, Upload, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HowToUseProps {
  onClose: () => void;
}

export default function HowToUse({ onClose }: HowToUseProps) {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <img src="/cutprompt-logo.png" alt="CutPrompts Logo" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('howto.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Quick Start */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold">
                ⚡
              </span>
              {t('howto.quickStart')}
            </h4>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('howto.step1')}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('main.placeholder')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('howto.step2')}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('main.readyToSplitDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('howto.step3')}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('results.step1')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Guide */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('howto.features')}
            </h4>
            <div className="grid gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  {t('button.templates')}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('howto.feature4Desc')}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-purple-500" />
                  {t('button.history')}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('howto.feature4Desc')}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <img src="/cutprompt-logo.png" alt="CutPrompts Logo" className="w-4 h-4 object-contain" />
                  {t('button.settings')}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('howto.feature2Desc')}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-500" />
                  {t('howto.feature3')}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('howto.feature3Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              💡 {t('howto.proTips')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{t('howto.tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{t('howto.tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{t('howto.tip3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{t('results.step4')}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{t('button.copyAll')}</span>
              </li>
            </ul>
          </div>

          {/* No Limits Notice */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              ✨ {t('howto.unlimited')}
            </h5>
            <p className="text-sm text-green-800 dark:text-green-200">
              {t('howto.unlimitedDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
