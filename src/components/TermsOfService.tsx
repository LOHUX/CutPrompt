import { useLanguage } from '../contexts/LanguageContext';

export default function TermsOfService() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('terms.title')}
      </h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('terms.acceptance')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('terms.acceptanceText')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('terms.useOfService')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {t('terms.useOfServiceText')}
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>{t('terms.use1')}</li>
            <li>{t('terms.use2')}</li>
            <li>{t('terms.use3')}</li>
            <li>{t('terms.use4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('terms.intellectualProperty')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('terms.intellectualPropertyText')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('terms.thirdPartyServices')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('terms.thirdPartyServicesText')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('terms.limitation')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('terms.limitationText')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('terms.changes')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('terms.changesText')}
          </p>
        </section>

        {/* Removed contact section as requested */}

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-12">
        </div>
      </div>
    </div>
  );
}