import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({ value, onChange, placeholder = '', rows = 4 }: Props) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-400">支持 **粗体**、*斜体*、换行等 Markdown 语法</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('edit')}
            className={`p-1 rounded ${mode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
          >
            <Edit3 className={`w-3.5 h-3.5 ${mode === 'edit' ? 'text-primary-600' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`p-1 rounded ${mode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
          >
            <Eye className={`w-3.5 h-3.5 ${mode === 'preview' ? 'text-primary-600' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none resize-none"
        />
      ) : (
        <div className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 min-h-[80px] prose dark:prose-invert prose-sm max-w-none">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
