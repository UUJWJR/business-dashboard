import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { Home, LayoutDashboard, Trophy, Link2, MessageSquare, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, SmartHomeData } from '../types';
import {
  smartHomeOverviewSummary,
  smartHomeRankingSummary,
  smartHomeBindingSummary,
  smartHomeFeedbackSummary,
} from '../utils/slideSummary';
import SmartHomeOverview from './smart-home/Overview';
import SmartHomeRanking from './smart-home/Ranking';
import SmartHomeBinding from './smart-home/Binding';
import SmartHomeFeedback from './smart-home/Feedback';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/smart-home/overview' },
  { icon: Trophy, label: '产品排行', path: '/smart-home/ranking' },
  { icon: Link2, label: '绑定分析', path: '/smart-home/binding' },
  { icon: MessageSquare, label: '用户反馈', path: '/smart-home/feedback' },
];

const slidePaths = [
  '/smart-home/overview',
  '/smart-home/ranking',
  '/smart-home/binding',
  '/smart-home/feedback',
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

export default function SmartHome() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<SmartHomeData>('smart-home', timeRange);

  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const isNavigatingRef = useRef(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (isNavigatingRef.current) return;
    const expectedPath = slidePaths[activeIndex];
    if (location.pathname !== expectedPath) {
      const params = new URLSearchParams(location.search);
      navigate(`${expectedPath}?${params.toString()}`, { replace: true });
    }
  }, [activeIndex, location.search, navigate]);

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
    await exportSlidesToPDF('#smart-home-slides', `智家产品报表_${dateStr}`);
  };

  return (
    <ModuleLayout
      title="智家产品"
      icon={<Home className="w-6 h-6" />}
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
        <div id="smart-home-slides" className="flex flex-col">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-slide-index={0}
          >
            <SlideSection
              id="slide-0"
              title="总览"
              description={smartHomeOverviewSummary(data)}
              pageNumber={1}
              totalPages={4}
            >
              <SmartHomeOverview data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-slide-index={1}
          >
            <SlideSection
              id="slide-1"
              title="产品排行"
              description={smartHomeRankingSummary(data)}
              pageNumber={2}
              totalPages={4}
            >
              <SmartHomeRanking data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-slide-index={2}
          >
            <SlideSection
              id="slide-2"
              title="绑定分析"
              description={smartHomeBindingSummary(data)}
              pageNumber={3}
              totalPages={4}
            >
              <SmartHomeBinding data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-slide-index={3}
          >
            <SlideSection
              id="slide-3"
              title="用户反馈"
              description={smartHomeFeedbackSummary(data)}
              pageNumber={4}
              totalPages={4}
            >
              <SmartHomeFeedback data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
