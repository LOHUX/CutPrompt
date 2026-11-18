import { Copy, Check } from 'lucide-react';
import { estimateTokens, graphemeCount } from '../utils/tokenCounter';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SplitResultsProps {
  parts: string[];
  rawParts: string[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export default function SplitResults({ parts, rawParts, copiedIndex, onCopy }: SplitResultsProps) {
  const { t } = useLanguage();
  const [instructionsNotice, setInstructionsNotice] = useState('');
  // Instructions that match the original ChatGPT Prompt Splitter format
  const instructions = `The total length of the content that I want to send you is too large to send in only one piece.

For sending you that content, I will follow this rule:

[START PART 1/${parts.length}]
this is the content of the part 1 out of ${parts.length} in total
[END PART 1/${parts.length}]

Then you just answer: "Received part 1/${parts.length}"

And when I tell you "ALL PARTS SENT", then you can continue processing the data and answering my requests.`;
  
  const handleCopyInstructions = async () => {
    try { await navigator.clipboard.writeText(instructions); setInstructionsNotice(t('button.copied')); }
    catch { setInstructionsNotice(t('notice.clipboardDenied')); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
        <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">
          {t('results.complete')}
        </h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          {t('results.description').replace('{count}', parts.length.toString())}
        </p>
      </div>

      {/* Instructions section similar to the original */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-base">
            {t('results.howToUse')}
          </h4>
          <button
            onClick={handleCopyInstructions}
            className="cp-button bg-amber-100 dark:bg-amber-800 hover:bg-amber-200 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
          >
            <Copy className="w-4 h-4" />
            {t('button.copy')}
          </button>
        </div>
        {instructionsNotice && <p role="status" className="text-sm text-amber-800 dark:text-amber-200 mb-2">{instructionsNotice}</p>}
        <pre className="whitespace-pre-wrap text-amber-800 dark:text-amber-200 text-sm bg-amber-100/30 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
          {instructions}
        </pre>
        <ol className="mt-4 space-y-2 text-amber-800 dark:text-amber-200 text-sm">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>{t('results.step1').replace('{count}', parts.length.toString())}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>{t('results.step2').replace('{count}', parts.length.toString())}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>{t('results.step3')}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>{t('results.step4')}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">5.</span>
            <span>{t('results.step5')}</span>
          </li>
        </ol>
      </div>

      {parts.map((part, index) => {
        // Extract the original content for token counting
        const originalContent = rawParts[index];
        const tokens = estimateTokens(originalContent);
        // Format matches the original ChatGPT Prompt Splitter format exactly
        const formattedPart = part;

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow fade-in"
          >
            <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center font-semibold text-blue-700 dark:text-blue-300 text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                    {t('results.part')} {index + 1} {t('results.of')} {parts.length}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    ~{tokens.toLocaleString()} {t('main.tokens')} ({t('notice.estimated')}) • {graphemeCount(originalContent).toLocaleString()} {t('main.characters')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onCopy(formattedPart, index)}
                className="cp-button bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('button.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('button.copy')}
                  </>
                )}
              </button>
            </div>

            <div className="p-5">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                  {formattedPart}
                </pre>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
