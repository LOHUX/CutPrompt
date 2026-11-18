import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Copy,
  Download,
  Scissors,
  FileText,
  History,
  Upload,
  Check,
  AlertCircle,
  Settings,
  BookOpen,
  Keyboard,
  Files,
  Eye,
  Save
} from 'lucide-react';
import { estimateTokens, getSplitMethod } from '../utils/tokenCounter';
import { saveToHistory, readSettings, writeSettings } from '../utils/storage';
import SettingsPanel from './SettingsPanel';
import HistoryPanel from './HistoryPanel';
import TemplatesPanel from './TemplatesPanel';
import SplitResults from './SplitResults';
import TokenDisplay from './TokenDisplay';
import KeyboardShortcuts from './KeyboardShortcuts';
import BatchProcessor from './BatchProcessor';

function formatPart(part: string, index: number, count: number, budget: number, mode: string): string {
  // The header is optional. If it would exceed the estimated token allowance,
  // return unwrapped source content (the source remains byte-for-byte reconstructible).
  if (mode === 'characters' || budget < 250) return part;
  const numbered = `[START PART ${index + 1}/${count}]\n${part}\n[END PART ${index + 1}/${count}]`;
  const message = index === count - 1
    ? `${numbered}\nALL PARTS SENT. Now you can continue processing the request.`
    : `Do not answer yet. Acknowledge part ${index + 1}/${count} and wait for the rest.\n${numbered}`;
  return estimateTokens(message) <= budget ? message : part;
}

type PanelId = 'templates' | 'history' | 'settings' | 'batch' | 'shortcuts';
const shortcutPanels: Record<string, PanelId> = {
  t: 'templates', h: 'history', s: 'settings', k: 'shortcuts',
};

export default function PromptSplitter() {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [rawParts, setRawParts] = useState<string[]>([]);
  const [maxTokens, setMaxTokens] = useState(() => readSettings().maxTokens);
  const [modelId, setModelId] = useState(() => readSettings().modelId);
  const [splitMethod, setSplitMethod] = useState(() => readSettings().splitMethod);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const previousPanelRef = useRef<PanelId | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customDelimiter, setCustomDelimiter] = useState(() => readSettings().customDelimiter);
  const [previewParts, setPreviewParts] = useState<{ content: string; tokens: number }[]>([]);

  const [notice, setNotice] = useState('');
  const splitParts = useMemo(() => rawParts.map((part, i) => formatPart(part, i, rawParts.length, maxTokens, splitMethod)), [rawParts, maxTokens, splitMethod]);
  const totalTokens = useMemo(() => estimateTokens(inputText), [inputText]);
  useEffect(() => { writeSettings({ maxTokens, splitMethod, customDelimiter, modelId }); }, [maxTokens, splitMethod, customDelimiter, modelId]);
  useEffect(() => { setRawParts([]); setPreviewParts([]); }, [inputText, maxTokens, splitMethod, customDelimiter]);
  const computeParts = useCallback(() => {
    // Reserve space for optional copy-ready instructions. Budgets are estimated, not provider token counts.
    const usableBudget = splitMethod !== 'characters' && maxTokens >= 250 ? maxTokens - 120 : maxTokens;
    return getSplitMethod(splitMethod, inputText, usableBudget, customDelimiter);
  }, [splitMethod, inputText, maxTokens, customDelimiter]);

  const handleSplit = useCallback(() => {
    if (!inputText.length) return;
    const parts = computeParts();
    setRawParts(parts);
    setPreviewParts(parts.map(content => ({ content, tokens: estimateTokens(content) })));
    setNotice(customDelimiter && !inputText.includes(customDelimiter)
      ? t('notice.delimiterMissing')
      : '');
  }, [inputText, computeParts, customDelimiter, t]);

  const handlePreview = useCallback(() => {
    if (!inputText.length) return;
    const parts = computeParts();
    setPreviewParts(parts.map(content => ({ content, tokens: estimateTokens(content) })));
    setNotice(customDelimiter && !inputText.includes(customDelimiter)
      ? t('notice.delimiterMissing')
      : '');
  }, [inputText, computeParts, customDelimiter, t]);

  const handleSaveHistory = () => {
    const success = saveToHistory(inputText, rawParts.length, splitMethod);
    setNotice(success ? t('notice.saved') : t('notice.saveFailed'));
  };

  const handleCopy = async (text: string, index: number) => {
    try { await navigator.clipboard.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2000); }
    catch { setNotice(t('notice.clipboardDenied')); }
  };

  const handleCopyAll = async () => {
    const formatted = splitParts.join('\n\n');
    try { await navigator.clipboard.writeText(formatted); setCopiedIndex(-1); setTimeout(() => setCopiedIndex(null), 2000); }
    catch { setNotice(t('notice.clipboardDenied')); }
  };

  const handleDownload = () => {
    // For download, we want to provide the parts without the additional instructions
    // so the user can download them in the original format
    const originalParts = rawParts;
    
    const formatted = originalParts
      .map((part, idx) => `[START PART ${idx + 1}/${originalParts.length}]
${part}
[END PART ${idx + 1}/${originalParts.length}]`)
      .join('\n\n');

    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-parts-${Date.now()}.txt`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportJSON = () => {
    // For export JSON, we want to provide the parts without the additional instructions
    const originalParts = rawParts;
    
    const data = {
      originalText: inputText,
      parts: originalParts.map((part, idx) => ({
        index: idx + 1,
        content: part,
        tokens: estimateTokens(part)
      })),
      metadata: {
        totalParts: originalParts.length,
        method: splitMethod,
        maxTokens,
        timestamp: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-split-${Date.now()}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportMarkdown = () => {
    // For export Markdown, we want to provide the parts without the additional instructions
    const originalParts = rawParts;
    
    const markdown = `# Prompt Split Results

## Metadata
- Total Parts: ${originalParts.length}
- Split Method: ${splitMethod}
- Max Tokens: ${maxTokens}
- Timestamp: ${new Date().toISOString()}

## Original Text
\`\`
${inputText}
\`\`\`

## Split Parts
${originalParts.map((part, idx) => `
### Part ${idx + 1}/${originalParts.length}
\`\`\`
[START PART ${idx + 1}/${originalParts.length}]
${part}
[END PART ${idx + 1}/${originalParts.length}]
\`\`\`
`).join('')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-split-${Date.now()}.md`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportCSV = () => {
    // For export CSV, we want to provide the parts without the additional instructions
    const originalParts = rawParts;
    
    const csvContent = [
      ['Part Number', 'Total Parts', 'Content', 'Tokens'],
      ...originalParts.map((part, idx) => [
        idx + 1,
        originalParts.length,
        part,
        estimateTokens(part)
      ])
    ]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-split-${Date.now()}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.(txt|md|text|markdown)$/i.test(file.name)) {
      setNotice(t('notice.invalidFormat')); return;
    }
    if (file.size > 5 * 1024 * 1024) { setNotice(t('notice.fileTooLarge')); return; }
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
      setInputText(text);
      setNotice('');
    } catch { setNotice(t('notice.invalidUtf8')); }
  };

  const handleTemplateSelect = (content: string) => {
    setInputText(content);
    setActivePanel(null);
  };

  const togglePanel = useCallback((panel: PanelId) => {
    setActivePanel(current => current === panel ? null : panel);
  }, []);
  const closePanel = useCallback(() => setActivePanel(null), []);
  const navButtonClass = (panel: PanelId) =>
    `cp-nav-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md ${activePanel === panel ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`;

  useEffect(() => {
    const previous = previousPanelRef.current;
    // A panel's X button or a field inside it can disappear while focused.
    // Give the user a predictable keyboard target after that unmount.
    if (previous && previous !== activePanel &&
        (document.activeElement === document.body || !document.activeElement?.isConnected)) {
      document.querySelector<HTMLButtonElement>(`[aria-controls="panel-${activePanel ?? previous}"]`)?.focus();
    }
    previousPanelRef.current = activePanel;
  }, [activePanel]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault(); handleSplit();
      } else if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault(); handlePreview();
      } else if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && ['s', 'h', 't', 'k'].includes(e.key.toLowerCase())) {
        e.preventDefault(); togglePanel(shortcutPanels[e.key.toLowerCase()]);
      } else if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() in shortcutPanels) {
        // Browser-safe aliases: Ctrl/Cmd+H and +T are reserved by many browsers.
        e.preventDefault(); togglePanel(shortcutPanels[e.key.toLowerCase()]);
      } else if (e.key === 'Escape') {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleSplit, handlePreview, togglePanel, closePanel]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('main.title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('main.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5" data-testid="tool-navigation">
        <button
          onClick={() => togglePanel('templates')}
          aria-expanded={activePanel === 'templates'}
          aria-controls="panel-templates"
          className={navButtonClass('templates')}
        >
          <BookOpen className="w-4 h-4" />
          {t('button.templates')}
        </button>

        <button
          onClick={() => togglePanel('history')}
          aria-expanded={activePanel === 'history'}
          aria-controls="panel-history"
          className={navButtonClass('history')}
        >
          <History className="w-4 h-4" />
          {t('button.history')}
        </button>

        <button
          onClick={() => togglePanel('settings')}
          aria-expanded={activePanel === 'settings'}
          aria-controls="panel-settings"
          className={navButtonClass('settings')}
        >
          <Settings className="w-4 h-4" />
          {t('button.settings')}
        </button>

        <button
          onClick={() => togglePanel('batch')}
          aria-expanded={activePanel === 'batch'}
          aria-controls="panel-batch"
          className={navButtonClass('batch')}
        >
          <Files className="w-4 h-4" />
          {t('button.batch')}
        </button>

        <button
          onClick={() => togglePanel('shortcuts')}
          aria-expanded={activePanel === 'shortcuts'}
          aria-controls="panel-shortcuts"
          className={navButtonClass('shortcuts')}
        >
          <Keyboard className="w-4 h-4" />
          {t('button.shortcuts')}
        </button>
      </div>

      {activePanel === 'templates' && (
        <div id="panel-templates" role="region" aria-label={t('button.templates')}>
          <TemplatesPanel onSelect={handleTemplateSelect} onClose={closePanel} />
        </div>
      )}

      {activePanel === 'history' && (
        <div id="panel-history" role="region" aria-label={t('button.history')}>
          <HistoryPanel
            onSelect={(text) => { setInputText(text); closePanel(); }}
            onClose={closePanel}
          />
        </div>
      )}

      {activePanel === 'settings' && (
        <div id="panel-settings" role="region" aria-label={t('button.settings')}>
          <SettingsPanel
            modelId={modelId}
            setModelId={setModelId}
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            splitMethod={splitMethod}
            setSplitMethod={setSplitMethod}
            customDelimiter={customDelimiter}
            setCustomDelimiter={setCustomDelimiter}
            onClose={closePanel}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 last:mb-0">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="prompt-input" className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('main.yourPrompt')}
          </label>
          <div className="relative group">
            <label className="cp-button bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500">
              <Upload className="w-4 h-4" />
              <span>{t('main.uploadFile')}</span>
              <input
                type="file"
                accept=".txt,.md,.text,.markdown"
                onChange={handleFileUpload}
                className="hidden"
                aria-label={t('main.uploadFileAria')}
              />
            </label>
            {/* Enhanced Tooltip with better styling */}
            <div className="absolute right-0 bottom-full mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
              <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl p-4 shadow-2xl border border-gray-700 max-w-xs">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {t('main.uploadFileTooltip')}
                </div>
                <div className="text-xs text-gray-300 dark:text-gray-400 space-y-1">
                  <div>• {t('main.supportedFormats')}</div>
                  <div>• {t('main.maxFileSize')}</div>
                </div>
                <div className="absolute top-full right-4 w-3 h-3 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 transform rotate-45 -mt-1.5"></div>
              </div>
            </div>
          </div>
        </div>

        <textarea
          id="prompt-input"
          aria-label={t('main.yourPrompt')}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('main.placeholder')}
          className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />

        {notice && <p role="status" className="my-3 p-3 text-sm rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">{notice}</p>}

        <TokenDisplay tokens={totalTokens} maxTokens={maxTokens} text={inputText} />

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleSplit}
            disabled={!inputText.length}
            className="cp-button cp-button-primary bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md border border-blue-700 hover:border-blue-800 btn-primary"
          >
            <Scissors className="w-4 h-4" />
            {t('button.split')}
            <span className="hidden sm:inline text-xs opacity-90">(Ctrl+Enter)</span>
          </button>

          <button
            onClick={handlePreview}
            disabled={!inputText.length}
            className="cp-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
          >
            <Eye className="w-4 h-4" />
            {t('button.preview')}
            <span className="hidden sm:inline text-xs opacity-90">(Alt+Shift+P)</span>
          </button>

          {inputText.length > 0 && <button onClick={handleSaveHistory} className="cp-button border border-teal-400/50 text-teal-700 dark:text-teal-300 hover:bg-teal-500/10" title={t('notice.historyTooltip')}><Save className="w-4 h-4" />{t('button.saveHistory')}</button>}
          {splitParts.length > 0 && (
            <>
              <button
                onClick={handleCopyAll}
                className="cp-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                {copiedIndex === -1 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {t('button.copyAll')}
              </button>

              <button
                onClick={handleDownload}
                className="cp-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                <Download className="w-4 h-4" />
                {t('button.download')}
              </button>

              <button
                onClick={handleExportJSON}
                className="cp-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                <FileText className="w-4 h-4" />
                {t('button.export')} JSON
              </button>
              
              <button
                onClick={handleExportMarkdown}
                className="cp-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                <FileText className="w-4 h-4" />
                {t('button.export')} MD
              </button>
              
              <button
                onClick={handleExportCSV}
                className="cp-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                <FileText className="w-4 h-4" />
                {t('button.export')} CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {previewParts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
            {t('preview.title')}
          </h3>
          <p className="text-amber-800 dark:text-amber-200 text-sm mb-4">
            {t('preview.description').replace('{count}', previewParts.length.toString())}
          </p>
          
          <div className="space-y-3">
            {previewParts.map((part, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('preview.part')} {index + 1} {t('preview.of')} {previewParts.length}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ~{part.tokens.toLocaleString()} {t('main.tokens')}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                  {part.content.substring(0, 200)}
                  {part.content.length > 200 && '...'}
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setPreviewParts([])}
            className="cp-button mt-4 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          >
            {t('button.clearPreview')}
          </button>
        </div>
      )}

      {splitParts.length > 0 && (
        <SplitResults
          parts={splitParts}
          rawParts={rawParts}
          copiedIndex={copiedIndex}
          onCopy={handleCopy}
        />
      )}

      {splitParts.length === 0 && inputText && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1.5 text-sm">
              {t('main.readyToSplit')}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {t('main.readyToSplitDesc')}
            </p>
          </div>
        </div>
      )}

      {activePanel === 'shortcuts' && (
        <KeyboardShortcuts onClose={closePanel} />
      )}

      {activePanel === 'batch' && (
        <BatchProcessor
          onClose={closePanel}
          maxTokens={maxTokens}
          splitMethod={splitMethod}
          customDelimiter={customDelimiter}
        />
      )}
    </div>
  );
}
