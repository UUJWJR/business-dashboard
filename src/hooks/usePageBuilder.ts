import { useReducer, useCallback, useEffect } from 'react';
import type {
  PageBuilderElement,
  PageBuilderElementType,
  Position,
  Size,
  Slide,
  PageBuilderState,
  GridType,
  ElementPayload,
} from '../types/pageBuilder';

const STORAGE_KEY = 'page-builder-draft';

function createDefaultSlide(id: number): Slide {
  return {
    id: `slide-${Date.now()}-${id}`,
    name: `幻灯片 ${id + 1}`,
    elements: [],
    background: '#ffffff',
  };
}

function createDefaultContent(type: PageBuilderElementType): ElementPayload {
  switch (type) {
    case 'title':
      return { text: '请输入标题', fontSize: 24, color: '#1e293b', textAlign: 'left' } as ElementPayload;
    case 'text':
      return { text: '请输入正文内容', fontSize: 14, color: '#334155', textAlign: 'left', lineHeight: 1.6 } as ElementPayload;
    case 'table':
      return {
        cells: [
          [{ value: '列1' }, { value: '列2' }, { value: '列3' }],
          [{ value: '数据1' }, { value: '数据2' }, { value: '数据3' }],
          [{ value: '数据4' }, { value: '数据5' }, { value: '数据6' }],
        ],
        colWidths: [33.33, 33.33, 33.34],
        rowHeights: [33.33, 33.33, 33.34],
        headerRowCount: 1,
      } as ElementPayload;
    case 'chart':
      return {
        chartType: 'bar',
        chartTheme: 'mckinsey',
        title: '图表标题',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{ name: '系列1', values: [120, 200, 150, 80, 70, 110], color: '#6366f1' }],
        },
      } as ElementPayload;
    case 'shape':
      return { shapeType: 'rect', fillColor: '#3b82f6', strokeColor: '#2563eb', strokeWidth: 0, opacity: 1 } as ElementPayload;
    case 'image':
      return { src: '', opacity: 1, borderRadius: 0 } as ElementPayload;
    default:
      return { text: '' } as ElementPayload;
  }
}

function createDefaultSize(type: PageBuilderElementType): Size {
  switch (type) {
    case 'title': return { width: 40, height: 8 };
    case 'text': return { width: 35, height: 15 };
    case 'table': return { width: 50, height: 25 };
    case 'chart': return { width: 45, height: 35 };
    case 'shape': return { width: 20, height: 20 };
    case 'image': return { width: 30, height: 25 };
    default: return { width: 30, height: 20 };
  }
}

type Action =
  | { type: 'LOAD_STATE'; state: PageBuilderState }
  | { type: 'ADD_SLIDE' }
  | { type: 'DELETE_SLIDE'; slideId: string }
  | { type: 'SET_ACTIVE_SLIDE'; slideId: string }
  | { type: 'UPDATE_SLIDE'; slideId: string; partial: Partial<Slide> }
  | { type: 'ADD_ELEMENT'; slideId: string; element: PageBuilderElement }
  | { type: 'UPDATE_ELEMENT'; slideId: string; elementId: string; partial: Partial<PageBuilderElement> }
  | { type: 'REMOVE_ELEMENT'; slideId: string; elementId: string }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'BRING_TO_FRONT'; slideId: string; elementId: string }
  | { type: 'SET_GRID'; gridType: GridType; gridSize: number }
  | { type: 'SUBMIT' }
  | { type: 'UNDO_SUBMIT' }
  | { type: 'CLEAR_ALL' };

function getActiveSlide(state: PageBuilderState): Slide | undefined {
  return state.slides.find((s) => s.id === state.activeSlideId);
}

function reducer(state: PageBuilderState, action: Action): PageBuilderState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;
    case 'ADD_SLIDE': {
      const newSlide = createDefaultSlide(state.slides.length);
      return { ...state, slides: [...state.slides, newSlide], activeSlideId: newSlide.id };
    }
    case 'DELETE_SLIDE': {
      if (state.slides.length <= 1) return state;
      const newSlides = state.slides.filter((s) => s.id !== action.slideId);
      const newActive = state.activeSlideId === action.slideId ? newSlides[0].id : state.activeSlideId;
      return { ...state, slides: newSlides, activeSlideId: newActive, selectedId: null };
    }
    case 'SET_ACTIVE_SLIDE':
      return { ...state, activeSlideId: action.slideId, selectedId: null };
    case 'UPDATE_SLIDE':
      return {
        ...state,
        slides: state.slides.map((s) => (s.id === action.slideId ? { ...s, ...action.partial } : s)),
      };
    case 'ADD_ELEMENT': {
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId ? { ...s, elements: [...s.elements, action.element] } : s
        ),
        selectedId: action.element.id,
      };
      saveState(newState);
      return newState;
    }
    case 'UPDATE_ELEMENT': {
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === action.elementId ? { ...el, ...action.partial } : el
                ),
              }
            : s
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'REMOVE_ELEMENT': {
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId
            ? { ...s, elements: s.elements.filter((el) => el.id !== action.elementId) }
            : s
        ),
        selectedId: state.selectedId === action.elementId ? null : state.selectedId,
      };
      saveState(newState);
      return newState;
    }
    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id };
    case 'BRING_TO_FRONT': {
      const slide = state.slides.find((s) => s.id === action.slideId);
      const maxZ = Math.max(0, ...(slide?.elements || []).map((el) => el.zIndex));
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === action.elementId ? { ...el, zIndex: maxZ + 1 } : el
                ),
              }
            : s
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'SET_GRID':
      return { ...state, gridType: action.gridType, gridSize: action.gridSize };
    case 'SUBMIT':
      return { ...state, isSubmitted: true, submittedAt: new Date().toISOString() };
    case 'UNDO_SUBMIT':
      return { ...state, isSubmitted: false, submittedAt: null };
    case 'CLEAR_ALL': {
      const newSlide = createDefaultSlide(0);
      const newState = {
        slides: [newSlide],
        activeSlideId: newSlide.id,
        selectedId: null,
        gridType: 'grid' as GridType,
        gridSize: 20,
        isSubmitted: false,
        submittedAt: null,
      };
      saveState(newState);
      return newState;
    }
    default:
      return state;
  }
}

function saveState(state: PageBuilderState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadState(): PageBuilderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 兼容旧格式（单页无 slides）
      if (!parsed.slides && parsed.elements) {
        const newSlide = createDefaultSlide(0);
        newSlide.elements = parsed.elements;
        return {
          slides: [newSlide],
          activeSlideId: newSlide.id,
          selectedId: parsed.selectedId || null,
          gridType: 'grid',
          gridSize: 20,
          isSubmitted: false,
          submittedAt: null,
        };
      }
      return parsed as PageBuilderState;
    }
  } catch {
    // ignore
  }
  const firstSlide = createDefaultSlide(0);
  return {
    slides: [firstSlide],
    activeSlideId: firstSlide.id,
    selectedId: null,
    gridType: 'grid',
    gridSize: 20,
    isSubmitted: false,
    submittedAt: null,
  };
}

export function usePageBuilder() {
  const [state, dispatch] = useReducer(reducer, loadState()!);

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
  }, []);

  const activeSlide = state.slides.find((s) => s.id === state.activeSlideId);
  const elements = activeSlide?.elements || [];

  const addSlide = useCallback(() => dispatch({ type: 'ADD_SLIDE' }), []);
  const deleteSlide = useCallback((slideId: string) => dispatch({ type: 'DELETE_SLIDE', slideId }), []);
  const setActiveSlide = useCallback((slideId: string) => dispatch({ type: 'SET_ACTIVE_SLIDE', slideId }), []);
  const updateSlide = useCallback((slideId: string, partial: Partial<Slide>) => dispatch({ type: 'UPDATE_SLIDE', slideId, partial }), []);

  const addElement = useCallback(
    (type: PageBuilderElementType, position: Position) => {
      const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const maxZ = Math.max(0, ...elements.map((el) => el.zIndex));
      const element: PageBuilderElement = {
        id,
        type,
        position,
        size: createDefaultSize(type),
        content: createDefaultContent(type),
        zIndex: maxZ + 1,
      };
      dispatch({ type: 'ADD_ELEMENT', slideId: state.activeSlideId, element });
      return id;
    },
    [elements, state.activeSlideId]
  );

  const updateElement = useCallback(
    (elementId: string, partial: Partial<PageBuilderElement>) =>
      dispatch({ type: 'UPDATE_ELEMENT', slideId: state.activeSlideId, elementId, partial }),
    [state.activeSlideId]
  );

  const removeElement = useCallback(
    (elementId: string) => dispatch({ type: 'REMOVE_ELEMENT', slideId: state.activeSlideId, elementId }),
    [state.activeSlideId]
  );

  const selectElement = useCallback((id: string | null) => dispatch({ type: 'SELECT_ELEMENT', id }), []);

  const bringToFront = useCallback(
    (elementId: string) => dispatch({ type: 'BRING_TO_FRONT', slideId: state.activeSlideId, elementId }),
    [state.activeSlideId]
  );

  const setGrid = useCallback((gridType: GridType, gridSize: number) => dispatch({ type: 'SET_GRID', gridType, gridSize }), []);
  const submit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const undoSubmit = useCallback(() => dispatch({ type: 'UNDO_SUBMIT' }), []);
  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);

  return {
    ...state,
    elements,
    activeSlide,
    addSlide,
    deleteSlide,
    setActiveSlide,
    updateSlide,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    bringToFront,
    setGrid,
    submit,
    undoSubmit,
    clearAll,
  };
}
