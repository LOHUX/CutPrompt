import { X, Sliders, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { aiModels, providers } from '../utils/aiModels';
import { useLanguage } from '../contexts/LanguageContext';
import { defaultSettings } from '../utils/storage';
import { validBudget } from '../utils/tokenCounter';

interface SettingsPanelProps {
  modelId: string;
  setModelId: (value: string) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  customDelimiter: string;
  setCustomDelimiter: (value: string) => void;
  onClose: () => void;
}

export default function SettingsPanel({
  modelId,
  setModelId,
  maxTokens,
  setMaxTokens,
  splitMethod,
  setSplitMethod,
  customDelimiter,
  setCustomDelimiter,
  onClose
}: SettingsPanelProps) {
  const { t } = useLanguage();
  const [sliderValue, setSliderValue] = useState(Math.max(500, Math.min(50000, maxTokens)));
  const [budgetDraft, setBudgetDraft] = useState(String(maxTokens));
  const [budgetError, setBudgetError] = useState(false);
  
  // Sync slider value with maxTokens, but clamp to slider range
  useEffect(() => {
    const clampedValue = Math.max(500, Math.min(50000, maxTokens));
    setSliderValue(clampedValue);
    setBudgetDraft(String(maxTokens));
    setBudgetError(false);
  }, [maxTokens]);
  const commitBudget = () => {
    const n = Number(budgetDraft);
    if (budgetDraft.trim() && validBudget(n)) { setMaxTokens(n); setBudgetError(false); }
    else { setBudgetError(true); setBudgetDraft(String(maxTokens)); }
  };
  
  // Calculate filled percentage
  const filledPercentage = ((sliderValue - 500) / (50000 - 500)) * 100;
  
  const handleSliderChange = (value: number) => {
    const clampedValue = Math.max(500, Math.min(50000, value));
    setSliderValue(clampedValue);
    setMaxTokens(clampedValue);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h3>
        </div>
        <button
          aria-label="Close settings"
          onClick={onClose}
          className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <button className="cp-button mb-5 border border-teal-500/40 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-900/20"
        onClick={() => { setModelId(defaultSettings.modelId); setMaxTokens(defaultSettings.maxTokens); setSplitMethod(defaultSettings.splitMethod); setCustomDelimiter(defaultSettings.customDelimiter); }}>
        {t('settings.resetDefaults')}
      </button>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t('settings.aiPresets')}
          </label>
          <div className="space-y-4">
            {providers.filter(p => p !== 'All').map((provider) => {
              const providerModels = provider === 'All' 
                ? aiModels 
                : aiModels.filter(m => m.provider === provider);
              
              if (providerModels.length === 0) return null;
              
              return (
                <div key={provider}>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t(`aiProviders.${provider.toLowerCase().replace(/ /g, '')}`) || provider}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {providerModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { setModelId(model.id); setMaxTokens(model.maxTokens); }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          modelId === model.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                        title={`${model.name} • ${model.status} • ${model.description}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <img 
                            src={model.icon} 
                            alt={model.name} 
                            className={`w-4 h-4 object-contain ${model.id === 'custom' || model.provider === 'Recommended' ? 'opacity-90' : ''}`}
                            onError={(e) => {
                              // Fallback if icon doesn't load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className={`text-xs font-bold bg-gradient-to-r ${model.color} bg-clip-text text-transparent truncate`}>
                            {model.name}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {model.maxTokens.toLocaleString()} suggested / chunk · {model.status}
                        </div>
                        {model.contextTokens && <div className="text-[11px] text-gray-500 dark:text-gray-400">Context: {model.contextTokens.toLocaleString()}</div>}
                        {model.outputTokens && <div className="text-[11px] text-gray-500 dark:text-gray-400">Max output: {model.outputTokens.toLocaleString()}</div>}


                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('settings.maxTokens')}
            </label>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {maxTokens.toLocaleString()}
            </span>
          </div>
          
          {/* Custom Range Slider */}
          <div className="relative" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
            {/* Background track - perfectly aligned with slider track */}
            <div 
              className="absolute left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full pointer-events-none"
              style={{ 
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              {/* Filled portion - perfectly synchronized with thumb center */}
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                style={{ 
                  width: `${filledPercentage}%`,
                  transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
            {/* Slider input - thumb centered on track */}
            <input
              type="range"
              value={sliderValue}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                handleSliderChange(newValue);
              }}
              onInput={(e) => {
                const newValue = Number((e.target as HTMLInputElement).value);
                handleSliderChange(newValue);
              }}
              aria-label="Chunk budget slider"
              min={500}
              max={50000}
              step={100}
              className="w-full appearance-none cursor-pointer slider relative z-10"
              style={{ 
                height: '20px',
                margin: 0,
                padding: 0,
                background: 'transparent',
                position: 'relative'
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>500</span>
            <span>50,000</span>
          </div>
          
          {/* Direct Input for Large Values */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('settings.maxTokens')} (100–1,000,000):
            </label>
            <input
              type="number"
              value={budgetDraft}
              onChange={(e) => { setBudgetDraft(e.target.value); setBudgetError(false); }}
              onBlur={commitBudget}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitBudget(); e.currentTarget.blur(); } }}
              aria-invalid={budgetError}
              aria-describedby={budgetError ? 'budget-validation-error' : undefined}
              min="100"
              max="1000000"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              placeholder="Enter token limit"
            />
            {budgetError && <p id="budget-validation-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{t('settings.invalidBudget')}</p>}
          </div>
          
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            💡 {t('settings.recommended')} · Estimated tokens only; not provider-native counts. Character mode counts Unicode graphemes. Wrappers use part of the budget. Official references: <a className="underline text-teal-600 dark:text-teal-400" href="https://developers.openai.com/api/docs/models" target="_blank" rel="noreferrer">OpenAI</a> · <a className="underline text-teal-600 dark:text-teal-400" href="https://platform.claude.com/docs/en/models/overview" target="_blank" rel="noreferrer">Claude</a> · <a className="underline text-teal-600 dark:text-teal-400" href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noreferrer">Gemini</a> · <a className="underline text-teal-600 dark:text-teal-400" href="https://docs.mistral.ai/models" target="_blank" rel="noreferrer">Mistral</a> · <a className="underline text-teal-600 dark:text-teal-400" href="https://ai.meta.com/resources/models-and-libraries/llama-downloads/" target="_blank" rel="noreferrer">Meta</a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('settings.splitMethod')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'tokens', labelKey: 'settings.smartTokens', descKey: 'settings.smartTokensDesc' },
              { value: 'characters', labelKey: 'settings.characters', descKey: 'settings.charactersDesc' },
              { value: 'paragraphs', labelKey: 'settings.paragraphs', descKey: 'settings.paragraphsDesc' },
              { value: 'sentences', labelKey: 'settings.sentences', descKey: 'settings.sentencesDesc' }
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setSplitMethod(method.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  splitMethod === method.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t(method.labelKey)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t(method.descKey)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.customDelimiter')}
          </label>
          <input
            type="text"
            value={customDelimiter}
            onChange={(e) => setCustomDelimiter(e.target.value)}
            placeholder={t('settings.delimiterPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t('settings.delimiterNote')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
            💡 {t('settings.proTips')}
          </h4>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <li>• {t('settings.tip1')}</li>
            <li>• {t('settings.tip2')}</li>
            <li>• {t('settings.tip3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
