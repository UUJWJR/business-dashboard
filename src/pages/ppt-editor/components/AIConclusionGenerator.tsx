import { useState, useCallback } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useAIConfigContext } from '../../../contexts/AIConfigContext';
import { generateConclusion, polishConclusion } from '../../../hooks/useAIConfig';

interface Props {
  tableData?: { columns: string[]; rows: Record<string, string | number>[] };
  title: string;
  currentConclusion: string;
  onUpdate: (conclusion: string) => void;
}

export default function AIConclusionGenerator({
  tableData,
  title,
  currentConclusion,
  onUpdate,
}: Props) {
  const { config, isConfigured } = useAIConfigContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [polishMode, setPolishMode] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!isConfigured) return;
    if (!tableData || tableData.rows.length === 0) {
      setError('请先将 Excel 数据映射到本页');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await generateConclusion(
        config.apiKey,
        config.model,
        config.baseUrl,
        tableData,
        title
      );
      onUpdate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }, [config, isConfigured, tableData, title, onUpdate]);

  const handlePolish = useCallback(async () => {
    if (!isConfigured) return;
    if (!currentConclusion.trim()) {
      setError('请先输入结论内容');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await polishConclusion(
        config.apiKey,
        config.model,
        config.baseUrl,
        currentConclusion,
        '让表达更专业、更有洞察力'
      );
      onUpdate(result);
      setPolishMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '润色失败');
    } finally {
      setLoading(false);
    }
  }, [config, isConfigured, currentConclusion, onUpdate]);

  if (!config.enabled) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <button
        onClick={handleGenerate}
        disabled={loading || !isConfigured}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        AI 生成结论
      </button>

      <button
        onClick={() => setPolishMode(!polishMode)}
        disabled={loading || !isConfigured || !currentConclusion.trim()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors disabled:opacity-50"
      >
        <Wand2 className="w-3 h-3" />
        AI 润色
      </button>

      {polishMode && (
        <div className="w-full flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder="输入润色要求，例如：更简洁、更有力度..."
            className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
          <button
            onClick={handlePolish}
            disabled={loading}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
          >
            确认
          </button>
        </div>
      )}

      {error && <p className="w-full text-xs text-red-500">{error}</p>}
      {!isConfigured && (
        <p className="w-full text-xs text-gray-400">请先配置 AI 模型参数</p>
      )}
    </div>
  );
}
