import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PX_TO_MM = 25.4 / 96;
const WAIT_MS = 600;

interface CanvasSnapshot {
  dataUrl: string;
  width: number;
  height: number;
  style: string;
}

interface CanvasReplacement {
  parent: Node;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
}

function captureCanvasData(root: HTMLElement): Map<HTMLCanvasElement, CanvasSnapshot> {
  const map = new Map<HTMLCanvasElement, CanvasSnapshot>();
  const canvases = root.querySelectorAll('canvas');
  canvases.forEach((canvas) => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      map.set(canvas, {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        style: canvas.getAttribute('style') || '',
      });
    } catch {
      // tainted canvas — skip
    }
  });
  return map;
}

function replaceCanvasesWithImages(
  root: HTMLElement,
  snapshotMap: Map<HTMLCanvasElement, CanvasSnapshot>
): CanvasReplacement[] {
  const restored: CanvasReplacement[] = [];
  const canvases = root.querySelectorAll('canvas');
  canvases.forEach((canvas) => {
    const snap = snapshotMap.get(canvas);
    if (!snap) return;

    const img = document.createElement('img');
    img.src = snap.dataUrl;
    img.style.cssText = snap.style || window.getComputedStyle(canvas).cssText;
    img.width = snap.width;
    img.height = snap.height;
    img.style.display = 'block';
    img.style.maxWidth = '100%';

    const parent = canvas.parentNode;
    if (parent) {
      parent.insertBefore(img, canvas);
      parent.removeChild(canvas);
      restored.push({ parent, img, canvas });
    }
  });
  return restored;
}

function restoreCanvases(restored: CanvasReplacement[]) {
  restored.forEach(({ parent, img, canvas }) => {
    parent.insertBefore(canvas, img);
    parent.removeChild(img);
  });
}

function freezeVhHeights(root: HTMLElement): Array<{ el: HTMLElement; original: string }> {
  const restored: Array<{ el: HTMLElement; original: string }> = [];
  const allEls = root.querySelectorAll<HTMLElement>('*');
  allEls.forEach((el) => {
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') return;
    const computed = window.getComputedStyle(el);
    const height = computed.height;
    const cls = el.getAttribute('class') || '';
    if (height.includes('vh') || cls.includes('h-[calc(100vh') || cls.includes('h-screen')) {
      restored.push({ el, original: el.style.height });
      el.style.height = `${el.getBoundingClientRect().height}px`;
    }
  });
  return restored;
}

function restoreHeights(restored: Array<{ el: HTMLElement; original: string }>) {
  restored.forEach(({ el, original }) => {
    el.style.height = original;
  });
}

function freezeLayoutSizes(root: HTMLElement): Array<{ el: HTMLElement; originalHeight: string; originalWidth: string; originalMinHeight: string; originalMinWidth: string; originalBoxSizing: string }> {
  const restored: Array<{ el: HTMLElement; originalHeight: string; originalWidth: string; originalMinHeight: string; originalMinWidth: string; originalBoxSizing: string }> = [];
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];

  for (const el of elements) {
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') continue;

    const cls = el.getAttribute('class') || '';
    const style = el.getAttribute('style') || '';
    const computed = window.getComputedStyle(el);

    const needsFreeze =
      cls.includes('h-full') ||
      cls.includes('w-full') ||
      cls.includes('flex-1') ||
      cls.includes('min-h-0') ||
      cls.includes('grid-cols-') ||
      cls.includes('grid-rows-') ||
      cls.includes('h-[calc(100vh') ||
      cls.includes('h-screen') ||
      style.includes('height:100%') ||
      style.includes('height: 100%') ||
      style.includes('width:100%') ||
      style.includes('width: 100%') ||
      computed.flex !== '0 1 auto' ||
      computed.display === 'grid';

    if (needsFreeze) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        restored.push({
          el,
          originalHeight: el.style.height,
          originalWidth: el.style.width,
          originalMinHeight: el.style.minHeight,
          originalMinWidth: el.style.minWidth,
          originalBoxSizing: el.style.boxSizing,
        });
        el.style.boxSizing = 'border-box';
        if (rect.height > 0) {
          el.style.height = `${rect.height}px`;
        }
        if (rect.width > 0) {
          el.style.width = `${rect.width}px`;
        }
        el.style.minHeight = '0px';
        el.style.minWidth = '0px';
      }
    }
  }

  return restored;
}

function restoreLayoutSizes(
  restored: Array<{ el: HTMLElement; originalHeight: string; originalWidth: string; originalMinHeight: string; originalMinWidth: string; originalBoxSizing: string }>
) {
  restored.forEach(({ el, originalHeight, originalWidth, originalMinHeight, originalMinWidth, originalBoxSizing }) => {
    el.style.height = originalHeight;
    el.style.width = originalWidth;
    el.style.minHeight = originalMinHeight;
    el.style.minWidth = originalMinWidth;
    el.style.boxSizing = originalBoxSizing;
  });
}

function freezeMotionStyles(root: HTMLElement): Array<{ el: HTMLElement; originalOpacity: string; originalTransform: string }> {
  const restored: Array<{ el: HTMLElement; originalOpacity: string; originalTransform: string }> = [];
  const allEls = root.querySelectorAll<HTMLElement>('*');
  allEls.forEach((el) => {
    const style = el.getAttribute('style') || '';
    if (style.includes('opacity') || style.includes('transform')) {
      restored.push({
        el,
        originalOpacity: el.style.opacity,
        originalTransform: el.style.transform,
      });
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  });
  return restored;
}

function restoreMotionStyles(restored: Array<{ el: HTMLElement; originalOpacity: string; originalTransform: string }>) {
  restored.forEach(({ el, originalOpacity, originalTransform }) => {
    el.style.opacity = originalOpacity;
    el.style.transform = originalTransform;
  });
}

export async function exportSlidesToPDF(containerSelector: string, filename: string): Promise<void> {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) {
    throw new Error('未找到容器元素');
  }

  const slides = container.querySelectorAll<HTMLElement>('[data-slide]');
  if (slides.length === 0) {
    throw new Error('未找到幻灯片元素');
  }

  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;
  const isDark = document.documentElement.classList.contains('dark');

  let pdf: jsPDF | null = null;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    slide.scrollIntoView({ behavior: 'instant', block: 'start' });
    await new Promise<void>((resolve) => setTimeout(resolve, WAIT_MS));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const canvasSnapshots = captureCanvasData(slide);
    const canvasReplacements = replaceCanvasesWithImages(slide, canvasSnapshots);
    const layoutFixes = freezeLayoutSizes(slide);
    const motionFixes = freezeMotionStyles(slide);

    try {
      const rect = slide.getBoundingClientRect();
      const widthPx = rect.width;
      const heightPx = rect.height;

      const dpr = window.devicePixelRatio || 2;

      const canvas = await html2canvas(slide, {
        scale: dpr,
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: widthPx,
        windowHeight: heightPx,
        width: Math.ceil(widthPx),
        height: Math.ceil(heightPx),
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          if (isDark) {
            clonedDoc.documentElement.classList.add('dark');
          }
        },
      });

      const widthMM = (canvas.width / dpr) * PX_TO_MM;
      const heightMM = (canvas.height / dpr) * PX_TO_MM;
      const orientation = widthMM > heightMM ? 'l' : 'p';

      if (i === 0) {
        pdf = new jsPDF(orientation, 'mm', [widthMM, heightMM]);
      } else {
        pdf!.addPage([widthMM, heightMM], orientation);
      }

      const imgData = canvas.toDataURL('image/png');
      pdf!.addImage(imgData, 'PNG', 0, 0, widthMM, heightMM);
    } finally {
      restoreMotionStyles(motionFixes);
      restoreLayoutSizes(layoutFixes);
      restoreCanvases(canvasReplacements);
    }
  }

  window.scrollTo(originalScrollX, originalScrollY);
  pdf!.save(`${filename}.pdf`);
}
