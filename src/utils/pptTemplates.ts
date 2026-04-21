import type { PptTemplate } from '../types/ppt';
import { PPT_COLORS } from './pptDesignTokens';

export const PPT_TEMPLATES: PptTemplate[] = [
  {
    id: 'brand-blue',
    name: '品牌蓝（默认）',
    backgroundColor: PPT_COLORS.white,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.brandDark,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.textDark,
      backgroundColor: `${PPT_COLORS.brandLight}66`,
      borderColor: PPT_COLORS.brandMid,
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
    id: 'light-gray',
    name: '浅灰商务',
    backgroundColor: PPT_COLORS.bgGray,
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.textDark,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.textDark,
      backgroundColor: `${PPT_COLORS.borderGray}40`,
      borderColor: PPT_COLORS.textLight,
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
    id: 'dark-luxury',
    name: '深色高端',
    backgroundColor: '#0f172a',
    headerStyle: {
      fontSize: 24,
      color: PPT_COLORS.white,
      fontWeight: 'bold',
    },
    conclusionStyle: {
      color: PPT_COLORS.white,
      backgroundColor: `${PPT_COLORS.brandAux}20`,
      borderColor: PPT_COLORS.brandAux,
    },
    noteStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
    pageNumberStyle: {
      color: PPT_COLORS.textLight,
      fontSize: 12,
    },
  },
];

export function getTemplateById(id: string): PptTemplate | undefined {
  return PPT_TEMPLATES.find((t) => t.id === id);
}

export const DEFAULT_TEMPLATE_ID = 'brand-blue';
