import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { CalendarCheck, LayoutDashboard, DollarSign, Users, Wifi, Heart, Target, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, WeekReviewData } from '../types';
import {
  weekReviewOverviewSummary,
  weekReviewRevenueSummary,
  weekReviewScaleSummary,
  weekReviewExistingSummary,
  weekReviewOtherSummary,
  weekReviewSummarySummary,
} from '../utils/slideSummary';
import WeekReviewOverview from './week-review/Overview';
import WeekReviewRevenue from './week-review/Revenue';
import WeekReviewScale from './week-review/Scale';
import WeekReviewExisting from './week-review/Existing';
import WeekReviewOtherWork from './week-review/OtherWork';
import WeekReviewSummary from './week-review/Summary';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/week-review/overview' },
  { icon: DollarSign, label: '聚焦收入', path: '/week-review/revenue' },
  { icon: Users, label: '两个规模', path: '/week-review/scale' },
  { icon: Heart, label: '存量运营', path: '/week-review/existing' },
  { icon: Target, label: '其他重点', path: '/week-review/other' },
  { icon: FileText, label: '落后改善与汇总', path: '/week-review/summary' },
];

const slidePaths = [
  '/week-review/overview',
  '/week-review/revenue',
  '/week-review/scale',
  '/week-review/existing',
  '/week-review/other',
  '/week-review/summary',
];

function useQueryRange(): TimeRange {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const range = params.get('range');
  if (range === '7d' || range === '30d' || range === '90d' || range === 'year') {
    return range;
  }
  return '30d';
}

export default function WeekReview() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<WeekReviewData>('week-review', timeRange);

  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const isNavigatingRef = useRef(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IntersectionObserver to detect active slide
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }

        if (bestEntry) {
          const index = Number(bestEntry.target.getAttribute('data-slide-index'));
          if (!Number.isNaN(index)) {
            setActiveIndex(index);
          }
        }
      },
      { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Sync URL when scrolling changes activeIndex
  useEffect(() => {
    if (isNavigatingRef.current) return;
    const expectedPath = slidePaths[activeIndex];
    if (location.pathname !== expectedPath) {
      const params = new URLSearchParams(location.search);
      navigate(`${expectedPath}?${params.toString()}`, { replace: true });
    }
  }, [activeIndex, location.search, navigate]);

  // Scroll to section when URL changes (initial load or direct navigation)
  useEffect(() => {
    const index = slidePaths.findIndex((p) => p === location.pathname);
    const targetIndex = index >= 0 ? index : 0;

    if (targetIndex === activeIndex) return;

    const el = sectionRefs.current[targetIndex];
    if (el) {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveIndex(targetIndex);
      navTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, SCROLL_DISABLE_MS);
    }
  }, [location.pathname]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleNavClick = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      const el = sectionRefs.current[index];
      if (!el) return;

      if (navTimerRef.current) clearTimeout(navTimerRef.current);

      isNavigatingRef.current = true;
      setActiveIndex(index);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const params = new URLSearchParams(location.search);
      navigate(`${slidePaths[index]}?${params.toString()}`, { replace: true });

      navTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, SCROLL_DISABLE_MS);
    },
    [activeIndex, location.search, navigate]
  );

  const handleExport = async () => {
    if (!data) return;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    await exportSlidesToPDF('#week-review-slides', `周四复盘_${dateStr}`);
  };

  const summaryFns = [
    weekReviewOverviewSummary,
    weekReviewRevenueSummary,
    weekReviewScaleSummary,
    weekReviewExistingSummary,
    weekReviewOtherSummary,
    weekReviewSummarySummary,
  ];

  const subPages = [
    WeekReviewOverview,
    WeekReviewRevenue,
    WeekReviewScale,
    WeekReviewExisting,
    WeekReviewOtherWork,
    WeekReviewSummary,
  ];

  return (
    <ModuleLayout
      title="周四复盘"
      icon={<CalendarCheck className="w-6 h-6" />}
      actions={<ExportButton onExport={handleExport} label="导出PDF" icon={FileText} />}
    >
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <SubIconNav
            items={subNavItems}
            activeIndex={activeIndex}
            onItemClick={handleNavClick}
          />
          <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}

      {!loading && data && (
        <div id="week-review-slides" className="flex flex-col">
          {subNavItems.map((_, index) => {
            const SubPage = subPages[index];
            return (
              <div
                key={index}
                ref={(el) => { sectionRefs.current[index] = el; }}
                data-slide-index={index}
              >
                <SlideSection
                  id={`slide-${index}`}
                  title={subNavItems[index].label}
                  description={summaryFns[index](data)}
                  pageNumber={index + 1}
                  totalPages={subNavItems.length}
                >
                  <SubPage data={data} isDark={isDark} onRefresh={refresh} />
                </SlideSection>
              </div>
            );
          })}
        </div>
      )}
    </ModuleLayout>
  );
}
