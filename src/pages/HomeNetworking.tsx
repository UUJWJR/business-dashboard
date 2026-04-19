import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { Network, LayoutDashboard, Settings, MapPin, ClipboardList, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, HomeNetworkingData } from '../types';
import HomeNetworkingOverview from './home-networking/Overview';
import HomeNetworkingSolution from './home-networking/Solution';
import HomeNetworkingCoverage from './home-networking/Coverage';
import HomeNetworkingWorkorder from './home-networking/Workorder';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/home-networking/overview' },
  { icon: Settings, label: '方案分析', path: '/home-networking/solution' },
  { icon: MapPin, label: '覆盖地图', path: '/home-networking/coverage' },
  { icon: ClipboardList, label: '工单管理', path: '/home-networking/workorder' },
];

const slidePaths = [
  '/home-networking/overview',
  '/home-networking/solution',
  '/home-networking/coverage',
  '/home-networking/workorder',
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

export default function HomeNetworking() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<HomeNetworkingData>('home-networking', timeRange);

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
    await exportSlidesToPDF('#home-networking-slides', `家庭组网报表_${dateStr}`);
  };

  return (
    <ModuleLayout
      title="家庭组网"
      icon={<Network className="w-6 h-6" />}
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
        <div id="home-networking-slides" className="flex flex-col">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-slide-index={0}
          >
            <SlideSection
              id="slide-0"
              title="总览"
              description="本页展示家庭组网业务的核心运营指标与整体趋势。顶部KPI卡片实时反映组网订单数、同比增长率、目标达成率及覆盖率等关键数据。中部折线图呈现近半年月度订单走势，右侧饼图拆解组网方案构成，底部条形图对比各区域组网覆盖与目标完成情况，帮助管理者快速把握组网业务全局状况。"
              pageNumber={1}
              totalPages={4}
            >
              <HomeNetworkingOverview data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-slide-index={1}
          >
            <SlideSection
              id="slide-1"
              title="方案分析"
              description="本页从组网方案维度分析业务结构。左侧饼图展示各组网方案在当前周期的占比，右侧折线图追踪不同方案近半年的占比变化趋势，识别热门方案增长亮点与潜在需求转移，为方案优化和资源配置提供数据支撑。"
              pageNumber={2}
              totalPages={4}
            >
              <HomeNetworkingSolution data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-slide-index={2}
          >
            <SlideSection
              id="slide-2"
              title="覆盖地图"
              description="本页聚焦区域维度的组网覆盖表现与目标完成度。顶部条形图直观对比各区域实际覆盖率与目标值的差距，底部表格详细列出各区域的目标完成率，通过颜色标签快速识别达标与未达标区域，辅助制定区域网络建设和资源投放策略。"
              pageNumber={3}
              totalPages={4}
            >
              <HomeNetworkingCoverage data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-slide-index={3}
          >
            <SlideSection
              id="slide-3"
              title="工单管理"
              description="本页从工单维度监控家庭组网的售后服务状况。顶部饼图和条形图展示各状态工单的数量分布与对比，底部表格详细列出各状态工单的数量及占比。通过监控工单处理状态，辅助制定服务优化和资源配置方案。"
              pageNumber={4}
              totalPages={4}
            >
              <HomeNetworkingWorkorder data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
