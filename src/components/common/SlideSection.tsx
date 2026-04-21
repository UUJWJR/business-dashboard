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

interface SavedDesc {
  text: string;
  originalDesc: string;
  isCustom: boolean;
}

function getStorageKey(pathname: string, id: string): string {
  return `slideDesc::${pathname}::${id}`;
}

function loadSaved(key: string): SavedDesc | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedDesc;
    if (typeof parsed.text === 'string' && typeof parsed.originalDesc === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveDesc(key: string, saved: SavedDesc) {
  try {
    localStorage.setItem(key, JSON.stringify(saved));
  } catch {
    // ignore
  }
}

export default function SlideSection({ id, title, description, pageNumber, totalPages, children }: SlideSectionProps) {
  const location = useLocation();
  const storageKey = getStorageKey(location.pathname, id);

  const [isEditing, setIsEditing] = useState(false);

  const resolveDisplayText = useCallback((desc: string): string => {
    const saved = loadSaved(storageKey);
    if (!saved) return desc;
    // If user customized the text, keep it unless the underlying description changed
    if (saved.isCustom) {
      // If the description prop is the same as when saved, respect the custom text
      if (saved.originalDesc === desc) {
        return saved.text;
      }
      // Description changed (data refreshed), discard custom text and use new auto-generated
      return desc;
    }
    // Not custom: always use latest auto-generated description
    return desc;
  }, [storageKey]);

  const [displayText, setDisplayText] = useState(() => resolveDisplayText(description));
  const [draft, setDraft] = useState(displayText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When description prop changes (data refreshed / auto-generated updated), re-evaluate display text
  useEffect(() => {
    const next = resolveDisplayText(description);
    setDisplayText(next);
  }, [description, resolveDisplayText]);

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
    const isCustom = finalText !== description;
    setDisplayText(finalText);
    setIsEditing(false);
    saveDesc(storageKey, { text: finalText, originalDesc: description, isCustom });
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
        <div className="flex-none pt-4 pb-2 border-b border-neutral-border/60 dark:border-white/[0.06] flex items-center gap-3">
          <div className="w-1 h-7 md:h-8 bg-theme rounded-sm flex-shrink-0" />
          <h2 className="text-xl md:text-2xl font-bold text-theme-dark dark:text-white tracking-tight">
            {title}
          </h2>
        </div>

        {isEditing ? (
          <div className="flex-none py-2.5 px-3 bg-theme-light/60 dark:bg-theme-light/10 border border-theme-light dark:border-theme/30 rounded-md max-h-40 overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full resize-none bg-transparent text-sm md:text-base text-neutral-text dark:text-neutral-text leading-relaxed outline-none placeholder:text-neutral-muted/60"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-theme text-white text-sm hover:bg-theme-dark transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                确认
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-bg dark:bg-neutral-bg/20 text-neutral-secondary dark:text-neutral-secondary text-sm hover:bg-neutral-border/60 dark:hover:bg-neutral-border/40 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                取消
              </button>
            </div>
          </div>
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="flex-none py-2.5 px-3 bg-theme-light/40 dark:bg-theme-light/10 border-l-4 border-theme rounded-r-md group cursor-text relative max-h-32 overflow-y-auto"
            title="双击编辑"
          >
            <p className="text-sm md:text-base text-neutral-text dark:text-neutral-text leading-relaxed">
              {displayText}
            </p>
            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-theme dark:text-theme-light">
              <Pencil className="w-4 h-4" />
            </span>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto pt-4">
          {children}
        </div>

        {pageNumber !== undefined && totalPages !== undefined && (
          <div className="absolute bottom-3 right-4 text-xs text-neutral-muted dark:text-neutral-muted font-medium">
            第 {pageNumber} 页 / 共 {totalPages} 页
          </div>
        )}
      </motion.div>
    </section>
  );
}
