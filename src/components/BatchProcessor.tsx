import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Upload, Download, FileText, Trash2 } from 'lucide-react';
import { estimateTokens, getSplitMethod, graphemeCount } from '../utils/tokenCounter';
import { useLanguage } from '../contexts/LanguageContext';

interface ProcessedFile {
  id: string;
  name: string;
  content: string;
  parts: string[];
  tokens: number;
}
interface BatchProcessorProps {
  onClose: () => void;
  maxTokens: number;
  splitMethod: string;
  customDelimiter: string;
}
const MAX_FILES = 10;
const MAX_BYTES = 1024 * 1024;

function downloadFile(name: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BatchProcessor({ onClose, maxTokens, splitMethod, customDelimiter }: BatchProcessorProps) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const busy = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    return () => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else document.querySelector<HTMLButtonElement>('[aria-controls="panel-batch"]')?.focus();
    };
  }, []);

  const ingest = useCallback(async (incoming: File[]) => {
    if (busy.current || !incoming.length) return;
    busy.current = true;
    setProcessing(true);
    const newFiles: ProcessedFile[] = [];
    const newErrors: string[] = [];
    const remaining = Math.max(0, MAX_FILES - files.length);
    if (incoming.length > remaining) newErrors.push(t('batch.filesLimit'));
    for (const file of incoming.slice(0, remaining)) {
      if (!/\.(txt|text|md|markdown)$/i.test(file.name)) {
        newErrors.push(`${file.name}: ${t('notice.invalidFormat')}`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        newErrors.push(`${file.name}: ${t('batch.filesLimit')}`);
        continue;
      }
      try {
        const content = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
        const parts = getSplitMethod(splitMethod, content, maxTokens, customDelimiter);
        newFiles.push({ id: crypto.randomUUID(), name: file.name, content, parts, tokens: estimateTokens(content) });
      } catch {
        newErrors.push(`${file.name}: ${t('notice.invalidUtf8')}`);
      }
    }
    setFiles(current => [...current, ...newFiles].slice(0, MAX_FILES));
    setErrors(newErrors);
    setProcessing(false);
    busy.current = false;
  }, [files.length, maxTokens, splitMethod, customDelimiter, t]);

  const downloadSingle = (file: ProcessedFile) => {
    downloadFile(`${file.name.replace(/\.[^/.]+$/, '')}-parts.json`, JSON.stringify({
      fileName: file.name, originalText: file.content, parts: file.parts, method: splitMethod,
      budget: maxTokens, tokenCount: 'estimated'
    }, null, 2), 'application/json;charset=utf-8');
  };
  const downloadAll = () => {
    downloadFile('cutprompt-batch.json', JSON.stringify({
      format: 'CutPrompt batch', version: 1, tokenCount: 'estimated',
      method: splitMethod, budget: maxTokens,
      files: files.map(file => ({ name: file.name, originalText: file.content, parts: file.parts }))
    }, null, 2), 'application/json;charset=utf-8');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section id="panel-batch" role="dialog" aria-modal="true" aria-labelledby="batch-heading" onKeyDown={e => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')).filter(el => el.getClientRects().length);
          const first = controls[0]; const last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }} className="w-full max-w-3xl max-h-[92dvh] flex flex-col overflow-hidden rounded-xl border border-teal-400/30 bg-white text-gray-900 shadow-2xl dark:bg-gray-800 dark:text-white">
        <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-5">
          <h3 id="batch-heading" className="flex items-center gap-2 text-xl font-semibold"><Upload className="h-5 w-5 text-teal-500" />{t('batch.title')}</h3>
          <button ref={closeRef} aria-label="Close batch" onClick={onClose} className="cp-icon-button hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-4 w-4" /></button>
        </header>
        <div className="overflow-y-auto p-4 sm:p-5">
          <label onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void ingest(Array.from(e.dataTransfer.files)); }}
            className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center hover:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500 dark:border-gray-600 dark:bg-gray-900">
            <Upload className="mb-2 h-7 w-7 text-teal-500" />
            <span className="text-sm font-medium">{t('batch.uploadLabel')} {t('batch.dragDrop')}</span>
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('batch.supportedFormats')} · {t('batch.filesLimit')}</span>
            <input type="file" multiple accept=".txt,.text,.md,.markdown" className="sr-only" disabled={processing}
              onChange={e => { const picked = Array.from(e.target.files || []); e.target.value = ''; void ingest(picked); }} />
          </label>
          {processing && <p role="status" className="mt-3 text-sm">{t('batch.processing')}</p>}
          {errors.length > 0 && <div role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            <strong>{t('batch.errors')}</strong><ul className="mt-1 list-disc pl-5">{errors.map((e, i) => <li key={i} className="break-all">{e}</li>)}</ul>
          </div>}
          {files.length > 0 ? <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold">{t('batch.processedFiles').replace('{count}', String(files.length))}</h4>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setFiles([]); setErrors([]); }} className="cp-button border border-gray-300 dark:border-gray-600">{t('batch.clear')}</button>
                <button onClick={downloadAll} className="cp-button bg-teal-600 font-semibold text-white hover:bg-teal-700"><Download className="h-4 w-4" />{t('batch.downloadAll')} JSON</button>
              </div>
            </div>
            {files.map(file => <div key={file.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
              <FileText className="h-5 w-5 shrink-0 text-teal-500" />
              <div className="min-w-0 flex-1"><p className="truncate font-medium" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">~{file.tokens.toLocaleString()} {t('main.tokens')} · {file.parts.length} {t('results.part')} · {graphemeCount(file.content).toLocaleString()} {t('main.characters')}</p>
              </div>
              <button aria-label={`${t('batch.download')} ${file.name}`} title={t('batch.download')} onClick={() => downloadSingle(file)} className="cp-icon-button hover:bg-teal-100 dark:hover:bg-teal-900"><Download className="h-4 w-4" /></button>
              <button aria-label={`${t('batch.remove')} ${file.name}`} title={t('batch.remove')} onClick={() => setFiles(current => current.filter(f => f.id !== file.id))} className="cp-icon-button hover:bg-red-100 dark:hover:bg-red-900"><Trash2 className="h-4 w-4" /></button>
            </div>)}
          </div> : !processing && <p className="py-7 text-center text-sm text-gray-500 dark:text-gray-400">{t('batch.noFilesDesc')}</p>}
        </div>
        <footer className="border-t border-gray-200 bg-teal-50 p-3 text-xs text-teal-900 dark:border-gray-700 dark:bg-teal-950/40 dark:text-teal-200">
          {t('batch.tipDesc').replace('{maxTokens}', String(maxTokens)).replace('{splitMethod}', t(`settings.${splitMethod}`))}
        </footer>
      </section>
    </div>
  );
}
