import { useState } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useAIConfig } from '../../../hooks/useAIConfig';

interface Props {
  onClose: () => void;
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, '');
  if (/\/v\d+$/.test(trimmed)) return trimmed;
  return `${trimmed}/v1`;
}

export default function AISettings({ onClose }: Props) {
  const { config, setConfig, isConfigured } = useAIConfig();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTest = async () => {
    if (!config.apiKey) return;
    setTestStatus('testing');
    setTestMessage('');

    const baseUrl = normalizeBaseUrl(config.baseUrl);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1,
        }),
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('连接成功');
      } else {
        let detail = '';
        try {
          const err = await response.json();
          detail = err.error?.message || err.message || '';
        } catch {
          detail = await response.text().catch(() => '');
        }
        setTestStatus('error');
        setTestMessage(`连接失败 (${response.status})${detail ? `：${detail}` : ''}`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(err instanceof Error ? err.message : '网络请求失败，请检查 Base URL');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI 模型配置</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">启用 AI 功能</label>
            <button
              onClick={() => setConfig({ enabled: !config.enabled })}
              className={`w-11 h-6 rounded-full transition-colors ${
                config.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">仅存储在浏览器本地，不会上传至服务器</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              模型
            </label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ model: e.target.value })}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1（自动补全 /v1）"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={!config.apiKey || testStatus === 'testing'}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {testStatus === 'testing' ? '测试中...' : '测试连通性'}
            </button>
            {testStatus === 'success' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="w-3 h-3" /> {testMessage}
              </span>
            )}
            {testStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" /> {testMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
