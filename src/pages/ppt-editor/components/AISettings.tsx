import { useState, useRef } from 'react';
import { X, Sparkles, Check, AlertCircle, Download, Upload, Shield, Eye, EyeOff } from 'lucide-react';
import { useAIConfigContext } from '../../../contexts/AIConfigContext';

interface Props {
  onClose: () => void;
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, '');
  if (/\/v\d+$/.test(trimmed)) return trimmed;
  return `${trimmed}/v1`;
}

async function testConnection(apiKey: string, model: string, baseUrl: string): Promise<{ ok: boolean; message: string }> {
  if (!apiKey) return { ok: false, message: '请先填写 API Key' };

  const normalized = normalizeBaseUrl(baseUrl);

  try {
    const response = await fetch(`${normalized}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      }),
    });

    if (response.ok) {
      return { ok: true, message: '连接成功' };
    } else {
      let detail = '';
      try {
        const err = await response.json();
        detail = err.error?.message || err.message || '';
      } catch {
        detail = await response.text().catch(() => '');
      }
      return { ok: false, message: `连接失败 (${response.status})${detail ? `：${detail}` : ''}` };
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : '网络请求失败，请检查 Base URL' };
  }
}

export default function AISettings({ onClose }: Props) {
  const { config, setConfig, isConfigured, exportConfig, importConfig } = useAIConfigContext();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [backupTestStatus, setBackupTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [backupTestMessage, setBackupTestMessage] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBackupApiKey, setShowBackupApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTest = async () => {
    setTestStatus('testing');
    setTestMessage('');
    const result = await testConnection(config.apiKey, config.model, config.baseUrl);
    setTestStatus(result.ok ? 'success' : 'error');
    setTestMessage(result.message);
  };

  const handleBackupTest = async () => {
    if (!config.backup?.apiKey) return;
    setBackupTestStatus('testing');
    setBackupTestMessage('');
    const result = await testConnection(
      config.backup.apiKey,
      config.backup.model || config.model,
      config.backup.baseUrl || config.baseUrl
    );
    setBackupTestStatus(result.ok ? 'success' : 'error');
    setBackupTestMessage(result.message);
  };

  const updateBackup = (partial: Partial<NonNullable<typeof config.backup>>) => {
    setConfig({
      backup: {
        apiKey: config.backup?.apiKey || '',
        model: config.backup?.model || '',
        baseUrl: config.backup?.baseUrl || '',
        ...partial,
      },
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('idle');
    try {
      await importConfig(file);
      setImportStatus('success');
    } catch {
      setImportStatus('error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-[560px] mx-4 overflow-hidden">
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
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => setConfig({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={showApiKey ? '隐藏密码' : '显示密码'}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
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

          {/* 备选 AI 配置 */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                备选 AI 配置（故障自动切换）
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              当主用 AI 不可用时，系统会自动尝试使用备选配置
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  备选 API Key
                </label>
                <div className="relative">
                  <input
                    type={showBackupApiKey ? 'text' : 'password'}
                    value={config.backup?.apiKey || ''}
                    onChange={(e) => updateBackup({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBackupApiKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={showBackupApiKey ? '隐藏密码' : '显示密码'}
                  >
                    {showBackupApiKey ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  备选模型
                </label>
                <input
                  type="text"
                  value={config.backup?.model || ''}
                  onChange={(e) => updateBackup({ model: e.target.value })}
                  placeholder="留空则使用主模型"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  备选 Base URL
                </label>
                <input
                  type="text"
                  value={config.backup?.baseUrl || ''}
                  onChange={(e) => updateBackup({ baseUrl: e.target.value })}
                  placeholder="留空则使用主 Base URL"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTest}
                disabled={!config.apiKey || testStatus === 'testing'}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {testStatus === 'testing' ? '测试中...' : '测试主配置连通性'}
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackupTest}
                disabled={!config.backup?.apiKey || backupTestStatus === 'testing'}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {backupTestStatus === 'testing' ? '测试中...' : '测试备选连通性'}
              </button>
              {backupTestStatus === 'success' && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3 h-3" /> {backupTestMessage}
                </span>
              )}
              {backupTestStatus === 'error' && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" /> {backupTestMessage}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">配置文件</p>
            <div className="flex items-center gap-2">
              <button
                onClick={exportConfig}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="w-3 h-3" />
                导出配置
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-3 h-3" />
                导入配置
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
            {importStatus === 'success' && (
              <p className="text-xs text-green-600">配置导入成功</p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs text-red-500">配置导入失败，请检查文件格式</p>
            )}
          </div>

          {isConfigured && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
              <Check className="w-3 h-3" />
              当前已配置并启用 AI 功能
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
