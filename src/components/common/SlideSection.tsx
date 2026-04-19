import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Pencil } from 'lucide-react';

interface SlideSectionProps {
  id: string;
  title: string;
  description: string;
  pageNumber?: number;
  totalPages?: number;
  children: React.ReactNode;
}

function getStorageKey(pathname: string, id: string): string {
  return `slideDesc::${pathname}::${id}`;
}

export default function SlideSection({ id, title, description, pageNumber, totalPages, children }: SlideSectionProps) {
  const location = useLocation();
  const storageKey = getStorageKey(location.pathname, id);

  const [isEditing, setIsEditing] = useState(false);
  const [displayText, setDisplayText] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ?? description;
    } catch {
      return description;
    }
  });
  const [draft, setDraft] = useState(displayText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setDisplayText(saved);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setDraft(displayText);
    setIsEditing(true);
  }, [displayText]);

  const handleConfirm = useCallback(() => {
    const trimmed = draft.trim();
    const finalText = trimmed || description;
    setDisplayText(finalText);
    setIsEditing(false);
    try {
      localStorage.setItem(storageKey, finalText);
    } catch {
      // ignore
    }
  }, [draft, description, storageKey]);

  const handleCancel = useCallback(() => {
    setDraft(displayText);
    setIsEditing(false);
  }, [displayText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleConfirm();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  return (
    <section
      id={id}
      data-slide
      className="h-[calc(100vh-64px)] flex items-center justify-center py-2 md:py-3"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full max-w-[1400px] bg-white dark:bg-surface-900 rounded-card border border-gray-100/80 dark:border-white/[0.06] shadow-card dark:shadow-card-dark flex flex-col overflow-hidden relative p-5 md:p-6"
      >
        <div className="flex-none pt-4 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>

        {isEditing ? (
          <div className="flex-none py-3 px-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-lg max-h-40 overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full resize-none bg-transparent text-base md:text-lg text-yellow-900 dark:text-yellow-100 leading-relaxed outline-none placeholder:text-yellow-400/60"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                确认
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                取消
              </button>
            </div>
          </div>
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="flex-none py-3 px-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-lg group cursor-text relative max-h-32 overflow-y-auto"
            title="双击编辑"
          >
            <p className="text-base md:text-lg text-yellow-800 dark:text-yellow-200 leading-relaxed">
              {displayText}
            </p>
            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-600 dark:text-yellow-300">
              <Pencil className="w-4 h-4" />
            </span>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto pt-4">
          {children}
        </div>

        {pageNumber !== undefined && totalPages !== undefined && (
          <div className="absolute bottom-3 right-4 text-xs md:text-sm text-gray-400 dark:text-gray-500 font-medium">
            {pageNumber} / {totalPages}
          </div>
        )}
      </motion.div>
    </section>
  );
}
