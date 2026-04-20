import { useReducer, useCallback, useEffect } from 'react';
import type {
  PageBuilderElement,
  PageBuilderElementType,
  Position,
  Size,
  TitlePayload,
  TextPayload,
  TablePayload,
  ChartPayload,
  ElementPayload,
} from '../types/pageBuilder';

interface State {
  elements: PageBuilderElement[];
  selectedId: string | null;
}

type Action =
  | { type: 'ADD_ELEMENT'; payload: PageBuilderElement }
  | { type: 'UPDATE_ELEMENT'; id: string; partial: Partial<PageBuilderElement> }
  | { type: 'REMOVE_ELEMENT'; id: string }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'BRING_TO_FRONT'; id: string }
  | { type: 'AUTO_RESIZE'; id: string }
  | { type: 'LOAD_STATE'; state: State }
  | { type: 'CLEAR_ALL' };

const STORAGE_KEY = 'page-builder-draft';

function createDefaultContent(type: PageBuilderElementType): ElementPayload {
  switch (type) {
    case 'title':
      return { text: '请输入标题', fontSize: 24, align: 'left' } as TitlePayload;
    case 'text':
      return { text: '请输入正文内容', fontSize: 14 } as TextPayload;
    case 'table':
      return {
        headers: ['列1', '列2', '列3'],
        rows: [
          ['数据1', '数据2', '数据3'],
          ['数据4', '数据5', '数据6'],
        ],
      } as TablePayload;
    case 'chart':
      return {
        chartType: 'bar',
        title: '图表标题',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [
            { name: '系列1', values: [120, 200, 150, 80, 70, 110], color: '#6366f1' },
          ],
        },
      } as ChartPayload;
    default:
      return { text: '' } as TextPayload;
  }
}

function createDefaultSize(type: PageBuilderElementType): Size {
  switch (type) {
    case 'title':
      return { width: 40, height: 8 };
    case 'text':
      return { width: 35, height: 15 };
    case 'table':
      return { width: 50, height: 25 };
    case 'chart':
      return { width: 45, height: 35 };
    default:
      return { width: 30, height: 20 };
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const newState = {
        ...state,
        elements: [...state.elements, action.payload],
        selectedId: action.payload.id,
      };
      saveState(newState);
      return newState;
    }
    case 'UPDATE_ELEMENT': {
      const newState = {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.partial } : el
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'REMOVE_ELEMENT': {
      const newState = {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
      saveState(newState);
      return newState;
    }
    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id };
    case 'BRING_TO_FRONT': {
      const maxZ = Math.max(0, ...state.elements.map((el) => el.zIndex));
      const newState = {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, zIndex: maxZ + 1 } : el
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'AUTO_RESIZE': {
      const el = state.elements.find((e) => e.id === action.id);
      if (!el) return state;

      let newSize = el.size;
      if (el.type === 'title') {
        const content = el.content as TitlePayload;
        const textLength = content.text.length;
        const fontSize = content.fontSize || 24;
        const estimatedWidth = Math.min(90, Math.max(20, (textLength * fontSize * 0.6) / 12));
        const estimatedHeight = Math.min(20, Math.max(6, (fontSize * 1.5) / 10));
        newSize = { width: estimatedWidth, height: estimatedHeight };
      } else if (el.type === 'text') {
        const content = el.content as TextPayload;
        const textLength = content.text.length;
        const fontSize = content.fontSize || 14;
        const charsPerLine = 40;
        const lines = Math.ceil(textLength / charsPerLine);
        const estimatedWidth = 35;
        const estimatedHeight = Math.min(50, Math.max(8, (lines * fontSize * 1.6) / 10));
        newSize = { width: estimatedWidth, height: estimatedHeight };
      } else if (el.type === 'table') {
        const content = el.content as TablePayload;
        const estimatedWidth = Math.min(90, Math.max(30, content.headers.length * 12));
        const estimatedHeight = Math.min(60, Math.max(15, (content.rows.length + 1) * 8));
        newSize = { width: estimatedWidth, height: estimatedHeight };
      }

      const newState = {
        ...state,
        elements: state.elements.map((e) =>
          e.id === action.id ? { ...e, size: newSize } : e
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'LOAD_STATE':
      return action.state;
    case 'CLEAR_ALL': {
      const newState = { elements: [], selectedId: null };
      saveState(newState);
      return newState;
    }
    default:
      return state;
  }
}

function saveState(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function loadState(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as State;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function usePageBuilder() {
  const [state, dispatch] = useReducer(reducer, { elements: [], selectedId: null });

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', state: saved });
    }
  }, []);

  const addElement = useCallback(
    (type: PageBuilderElementType, position: Position) => {
      const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const maxZ = Math.max(0, ...state.elements.map((el) => el.zIndex));
      const element: PageBuilderElement = {
        id,
        type,
        position,
        size: createDefaultSize(type),
        content: createDefaultContent(type),
        zIndex: maxZ + 1,
      };
      dispatch({ type: 'ADD_ELEMENT', payload: element });
      return id;
    },
    [state.elements]
  );

  const updateElement = useCallback((id: string, partial: Partial<PageBuilderElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, partial });
  }, []);

  const removeElement = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ELEMENT', id });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', id });
  }, []);

  const bringToFront = useCallback((id: string) => {
    dispatch({ type: 'BRING_TO_FRONT', id });
  }, []);

  const autoResize = useCallback((id: string) => {
    dispatch({ type: 'AUTO_RESIZE', id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return {
    elements: state.elements,
    selectedId: state.selectedId,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    bringToFront,
    autoResize,
    clearAll,
  };
}
