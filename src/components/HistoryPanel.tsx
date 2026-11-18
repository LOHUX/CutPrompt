import { X, Clock, Trash2, Download, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getHistory, deleteHistoryItem, clearHistory, exportHistory, importHistory, HistoryItem } from '../utils/storage';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryPanelProps {
  onSelect: (text: string) => void;
  onClose: () => void;
}

export default function HistoryPanel({ onSelect, onClose }: HistoryPanelProps) {
  const { t } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (confirm(t('history.confirmClear'))) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleExport = () => {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (importHistory(content)) {
          setHistory(getHistory());
          alert(t('history.importSuccess'));
        } else {
          alert(t('history.importError'));
        }
      } catch {
        alert(t('history.importError'));
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => { alert(t('history.importError')); if (fileInputRef.current) fileInputRef.current.value = ''; };
    if (file.size > 26_000_000) { alert(t('history.importError')); return; }
    reader.readAsText(file, 'utf-8');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6 border-2 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('history.title')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('history.export')}
            disabled={history.length === 0}
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={triggerFileInput}
            className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('history.import') || 'Import history'}
          >
            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
              title={t('history.clearAll')}
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label={t('button.close') === 'button.close' ? 'Close history' : t('button.close')}
            className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('history.noHistory')}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="group p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <button onClick={() => onSelect(item.text)} className="text-left w-full text-sm text-gray-900 dark:text-white font-medium truncate mb-1 hover:text-teal-600 dark:hover:text-teal-400" title={item.text.slice(0, 100)}>{item.text.substring(0, 100)}{item.text.length > 100 ? '…' : ''}</button>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.parts} {t('history.parts')}</span>
                    <span>•</span>
                    <span className="capitalize">{item.method}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  aria-label="Delete history item"
                  className="cp-icon-button hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
