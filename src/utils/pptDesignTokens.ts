// Extracted from docs/ppt-design-system.md

export const PPT_COLORS = {
  // Brand blues (legacy)
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

  // China Mobile 中国移动
  cmBlue: '#0085CF',
  cmGreen: '#00A650',
  cmLight: '#E6F5FC',

  // Alibaba 阿里巴巴
  aliOrange: '#FF6A00',
  aliDark: '#1A1A1A',
  aliLight: '#FFF5EB',

  // Tencent 腾讯商务
  txBlue: '#00A4FF',
  txDark: '#1E1E1E',
  txLight: '#E6F7FF',

  // ByteDance 字节跳动
  bdBlue: '#3C8CFF',
  bdDark: '#161823',
  bdLight: '#EBF2FF',

  // McKinsey 麦肯锡
  mkBlue: '#003087',
  mkDark: '#051C2C',
  mkLight: '#F2F4F7',
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
