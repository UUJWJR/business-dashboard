import type { PptTemplate } from '../types/ppt';
import { PPT_COLORS } from './pptDesignTokens';

export const PPT_TEMPLATES: PptTemplate[] = [
  {
    id: 'china-mobile',
    name: '经营分析',
    backgroundColor: PPT_COLORS.white,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.cmBlue,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.textDark,
      backgroundColor: PPT_COLORS.cmLight,
      borderColor: PPT_COLORS.cmBlue,
    },
    noteStyle: {
      color: PPT_COLORS.textMid,
      fontSize: 12,
    },
    pageNumberStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
  },
  {
    id: 'alibaba',
    name: '发展攻坚',
    backgroundColor: PPT_COLORS.white,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.aliOrange,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.textDark,
      backgroundColor: PPT_COLORS.aliLight,
      borderColor: PPT_COLORS.aliOrange,
    },
    noteStyle: {
      color: PPT_COLORS.textMid,
      fontSize: 12,
    },
    pageNumberStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
  },
  {
    id: 'tencent',
    name: '复盘调度',
    backgroundColor: PPT_COLORS.white,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.txBlue,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.textDark,
      backgroundColor: PPT_COLORS.txLight,
      borderColor: PPT_COLORS.txBlue,
    },
    noteStyle: {
      color: PPT_COLORS.textMid,
      fontSize: 12,
    },
    pageNumberStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
  },
  {
    id: 'bytedance',
    name: '文案策划',
    backgroundColor: PPT_COLORS.white,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.bdBlue,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.bdDark,
      backgroundColor: PPT_COLORS.bdLight,
      borderColor: PPT_COLORS.bdBlue,
    },
    noteStyle: {
      color: PPT_COLORS.textMid,
      fontSize: 12,
    },
    pageNumberStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
  },
  {
    id: 'mckinsey',
    name: '运维协同',
    backgroundColor: PPT_COLORS.white,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.mkBlue,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.mkDark,
      backgroundColor: PPT_COLORS.mkLight,
      borderColor: PPT_COLORS.mkBlue,
    },
    noteStyle: {
      color: PPT_COLORS.textMid,
      fontSize: 12,
    },
    pageNumberStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
  },
];

const CUSTOM_TEMPLATES_KEY = 'dashboard-ppt-custom-templates';

function loadCustomTemplates(): PptTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PptTemplate[];
  } catch {
    return [];
  }
}

export function getTemplateById(id: string): PptTemplate {
  const builtIn = PPT_TEMPLATES.find((t) => t.id === id);
  if (builtIn) return builtIn;
  const custom = loadCustomTemplates().find((t) => t.id === id);
  return custom || PPT_TEMPLATES[0];
}

export const DEFAULT_TEMPLATE_ID = 'china-mobile';
