import { X, Keyboard } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export default function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    return () => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else document.querySelector<HTMLButtonElement>('[aria-controls="panel-shortcuts"]')?.focus();
    };
  }, []);
  
  const shortcuts = [
    { keys: ['Ctrl/⌘', 'Enter'], description: t('button.split') },
    { keys: ['Alt', 'Shift', 'P'], description: t('button.preview') },
    { keys: ['Alt', 'Shift', 'K'], description: t('button.shortcuts') },
    { keys: ['Alt', 'Shift', 'T'], description: t('button.templates') },
    { keys: ['Alt', 'Shift', 'H'], description: t('button.history') },
    { keys: ['Alt', 'Shift', 'S'], description: t('button.settings') },
    { keys: ['Ctrl/⌘', 'T'], description: t('button.templates') },
    { keys: ['Ctrl/⌘', 'H'], description: t('button.history') },
    { keys: ['Ctrl/⌘', 'S'], description: t('button.settings') },
    { keys: ['Ctrl/⌘', 'K'], description: t('button.shortcuts') },
    { keys: ['Esc'], description: t('button.close') === 'button.close' ? 'Close dialog/panel' : t('button.close') },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div id="panel-shortcuts" role="dialog" aria-modal="true" aria-label={t('button.shortcuts')} onKeyDown={e => {
        if (e.key === 'Tab') {
          const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'));
          const first = controls[0]; const last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto p-6 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('button.shortcuts')}
            </h3>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-900 dark:text-purple-100">
            💡 <strong>{t('settings.proTips')}</strong> {t('howto.tip1')}!
          </p>
        </div>
      </div>
    </div>
  );
}
