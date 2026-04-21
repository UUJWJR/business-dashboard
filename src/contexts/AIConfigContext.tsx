import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
  backup?: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
}

const STORAGE_KEY = 'dashboard-ai-config';

const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  model: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  enabled: false,
};

function loadConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

interface AIConfigContextValue {
  config: AIConfig;
  setConfig: (partial: Partial<AIConfig>) => void;
  isConfigured: boolean;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<void>;
}

const AIConfigContext = createContext<AIConfigContextValue | null>(null);

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<AIConfig>(loadConfig);

  const setConfig = useCallback((partial: Partial<AIConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...partial };
      saveConfig(next);
      return next;
    });
  }, []);

  const isConfigured = config.enabled && (
    config.apiKey.length > 10 ||
    (config.backup?.apiKey?.length ?? 0) > 10
  );

  const exportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const importConfig = useCallback(async (file: File): Promise<void> => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const next: AIConfig = {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
    setConfigState(next);
    saveConfig(next);
  }, []);

  const value = useMemo(
    () => ({ config, setConfig, isConfigured, exportConfig, importConfig }),
    [config, setConfig, isConfigured, exportConfig, importConfig]
  );

  return <AIConfigContext.Provider value={value}>{children}</AIConfigContext.Provider>;
}

export function useAIConfigContext(): AIConfigContextValue {
  const ctx = useContext(AIConfigContext);
  if (!ctx) throw new Error('useAIConfigContext must be used within AIConfigProvider');
  return ctx;
}
