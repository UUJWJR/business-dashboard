// Extracted from docs/ppt-design-system.md

export const PPT_COLORS = {
  // Brand blues
  brandDark: '#00467F',
  brandMid: '#0070C0',
  brandLight: '#D6E7F5',
  brandAux: '#418FDE',

  // Neutrals
  textDark: '#1A1A1A',
  textMid: '#595959',
  textLight: '#8C8C8C',
  borderGray: '#D9D9D9',
  bgGray: '#F5F6F8',
  white: '#FFFFFF',

  // Semantic
  successDark: '#0B6E31',
  successMid: '#1AAB55',
  successLight: '#B7EB8F',
  dangerDark: '#820014',
  dangerMid: '#CF1322',
  dangerLight: '#FFCCC7',
  warning: '#FA8C16',
  referenceGray: '#8C8C8C',
} as const;

export const PPT_FONTS = {
  header: {
    sizeLg: 'text-xl md:text-2xl',
    sizeMd: 'text-lg md:text-xl',
    weight: 'font-bold',
  },
  conclusion: {
    size: 'text-sm md:text-base',
    weight: 'font-normal',
    leading: 'leading-relaxed',
  },
  note: {
    size: 'text-xs',
    weight: 'font-normal',
  },
  pageNumber: {
    size: 'text-xs',
    weight: 'font-medium',
  },
} as const;

export const PPT_LAYOUT = {
  aspectRatio: '16 / 9',
  maxWidth: '1400px',
  safeMarginTop: '0.40in',
  safeMarginBottom: '0.40in',
  safeMarginLeft: '0.40in',
  safeMarginRight: '0.40in',
} as const;
