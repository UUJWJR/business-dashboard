export interface PptReport {
  id: string;
  name: string;
  department: string;
  date: string;
  author: string;
  templateId: string;
  slides: PptSlideData[];
  createdAt: number;
  updatedAt: number;
}

export interface PptSlideData {
  id: string;
  title: string;
  conclusion: string;
  content: SlideContent;
  note: string;
  pageNumber: number;
}

export type SlideContent =
  | { type: 'chart'; chartType: 'line' | 'bar' | 'pie'; data: unknown }
  | { type: 'table'; columns: string[]; rows: Record<string, string | number>[] }
  | { type: 'text'; body: string }
  | { type: 'mixed'; blocks: Array<{ type: 'chart' | 'table' | 'text'; config: unknown }> };

export interface PptTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundImage?: string;
  headerStyle: {
    fontSize: number;
    color: string;
    fontWeight: string;
  };
  conclusionStyle?: {
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
  noteStyle?: {
    color: string;
    fontSize: number;
  };
  pageNumberStyle?: {
    color: string;
    fontSize: number;
  };
}
