import { useLanguage } from '../contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('privacy.title')}
      </h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.introduction')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.introText')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.dataCollection')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {t('privacy.noDataCollected')}
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>{t('privacy.noAccountRequired')}</li>
            <li>{t('privacy.noPersonalInfo')}</li>
            <li>{t('privacy.noTracking')}</li>
            <li>{t('privacy.clientSideOnly')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.cookies')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.cookieUsage')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.thirdParty')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.thirdPartyServices')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.analytics')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.analyticsInfo')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.security')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.securityMeasures')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('privacy.changes')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.policyChanges')}
          </p>
        </section>

        {/* Removed contact section as requested */}

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-12">
        </div>
      </div>
    </div>
  );
}
