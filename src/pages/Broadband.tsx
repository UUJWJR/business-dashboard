import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { Wifi, LayoutDashboard, Zap, MapPin, BarChart3, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, BroadbandData } from '../types';
import BroadbandOverview from './broadband/Overview';
import BroadbandSpeed from './broadband/Speed';
import BroadbandCoverage from './broadband/Coverage';
import BroadbandCompetitor from './broadband/Competitor';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/broadband/overview' },
  { icon: Zap, label: '速率分析', path: '/broadband/speed' },
  { icon: MapPin, label: '区域覆盖', path: '/broadband/coverage' },
  { icon: BarChart3, label: '竞品对比', path: '/broadband/competitor' },
];

const slidePaths = [
  '/broadband/overview',
  '/broadband/speed',
  '/broadband/coverage',
  '/broadband/competitor',
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

export default function Broadband() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<BroadbandData>('broadband', timeRange);

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
    await exportSlidesToPDF('#broadband-slides', `宽带新增报表_${dateStr}`);
  };

  return (
    <ModuleLayout
      title="宽带新增"
      icon={<Wifi className="w-6 h-6" />}
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
        <div id="broadband-slides" className="flex flex-col">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-slide-index={0}
          >
            <SlideSection
              id="slide-0"
              title="总览"
              description="本页展示宽带新增业务的核心运营指标与整体趋势。顶部KPI卡片实时反映新增宽带数、同比增长率、目标达成率及平均带宽等关键数据。中部折线图呈现近半年月度新增宽带走势，右侧饼图拆解带宽速率构成，底部条形图对比各区域新增宽带与目标完成情况，帮助管理者快速把握全局宽带拓展状况。"
              pageNumber={1}
              totalPages={4}
            >
              <BroadbandOverview data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-slide-index={1}
          >
            <SlideSection
              id="slide-1"
              title="速率分析"
              description="本页从带宽速率维度分析新增宽带结构。左侧饼图展示各速率档次在当前周期的占比，右侧折线图追踪不同速率档次近半年的变化趋势，识别高带宽用户增长亮点与潜在需求变化，为带宽升级策略和产品定价提供数据支撑。"
              pageNumber={2}
              totalPages={4}
            >
              <BroadbandSpeed data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-slide-index={2}
          >
            <SlideSection
              id="slide-2"
              title="区域覆盖"
              description="本页聚焦区域维度的宽带新增表现与目标完成度。顶部条形图直观对比各区域实际新增宽带与目标值的差距，底部表格详细列出各区域的目标完成率，通过颜色标签快速识别达标与未达标区域，辅助制定区域资源投放与营销策略调整方案。"
              pageNumber={3}
              totalPages={4}
            >
              <BroadbandCoverage data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-slide-index={3}
          >
            <SlideSection
              id="slide-3"
              title="竞品对比"
              description="本页从市场竞争维度监控宽带市场份额。左侧饼图展示各竞品运营商的市场份额分布，右侧条形图对比各竞品的份额数据。通过对比分析识别自身竞争优势与不足，辅助制定差异化竞争策略和市场拓展计划。"
              pageNumber={4}
              totalPages={4}
            >
              <BroadbandCompetitor data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
