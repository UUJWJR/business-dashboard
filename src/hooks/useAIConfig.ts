import { useState, useCallback } from 'react';

const STORAGE_KEY = 'dashboard-ai-config';

export interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
}

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

export function useAIConfig() {
  const [config, setConfigState] = useState<AIConfig>(loadConfig);

  const setConfig = useCallback((partial: Partial<AIConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...partial };
      saveConfig(next);
      return next;
    });
  }, []);

  const isConfigured = config.enabled && config.apiKey.length > 10;

  return { config, setConfig, isConfigured };
}

export async function generateConclusion(
  apiKey: string,
  model: string,
  baseUrl: string,
  tableData: { columns: string[]; rows: Record<string, string | number>[] },
  title: string
): Promise<string> {
  const prompt = `你是一位数据分析专家。请根据以下表格数据，为"${title}"生成一段分析结论。

要求：
- 中文输出
- 简洁有力，不超过150字
- 包含关键数据洞察和趋势判断
- 适合放入PPT的结论区

表格数据：
列：${tableData.columns.join(', ')}
前5行数据：
${tableData.rows.slice(0, 5).map((row) => tableData.columns.map((c) => `${c}: ${row[c]}`).join(', ')).join('\n')}

请直接输出结论文本，不要添加任何前缀或说明。`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一位资深数据分析师，擅长从表格数据中提取关键洞察并生成简洁有力的分析结论。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API 请求失败 (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '生成失败，请重试';
}

export async function polishConclusion(
  apiKey: string,
  model: string,
  baseUrl: string,
  conclusion: string,
  instruction: string
): Promise<string> {
  const prompt = `请对以下分析结论进行润色/修改。

要求：${instruction}
- 中文输出
- 简洁有力，不超过150字

原文：
${conclusion}

请直接输出修改后的文本，不要添加任何前缀或说明。`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一位专业的商务文案编辑，擅长优化分析报告的表达。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API 请求失败 (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '润色失败，请重试';
}
