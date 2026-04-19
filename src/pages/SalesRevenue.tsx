import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { TrendingUp, LayoutDashboard, MapPin, Package, Share2, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, SalesRevenueData } from '../types';
import SalesRevenueOverview from './sales-revenue/Overview';
import SalesRevenueByRegion from './sales-revenue/ByRegion';
import SalesRevenueByProduct from './sales-revenue/ByProduct';
import SalesRevenueByChannel from './sales-revenue/ByChannel';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/sales-revenue/overview' },
  { icon: MapPin, label: '分地区', path: '/sales-revenue/by-region' },
  { icon: Package, label: '分产品', path: '/sales-revenue/by-product' },
  { icon: Share2, label: '分渠道', path: '/sales-revenue/by-channel' },
];

const slidePaths = [
  '/sales-revenue/overview',
  '/sales-revenue/by-region',
  '/sales-revenue/by-product',
  '/sales-revenue/by-channel',
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

export default function SalesRevenue() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<SalesRevenueData>('sales-revenue', timeRange);

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
    await exportSlidesToPDF('#sales-revenue-slides', `销售收入报表_${dateStr}`);
  };

  return (
    <ModuleLayout
      title="销售收入"
      icon={<TrendingUp className="w-6 h-6" />}
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
        <div id="sales-revenue-slides" className="flex flex-col">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-slide-index={0}
          >
            <SlideSection
              id="slide-0"
              title="总览"
              description="本页展示销售收入的核心运营指标与整体趋势。顶部 KPI 卡片实时反映总收入、同比增长、目标达成率及客户均价等关键数据。中部折线图呈现近半年月度收入走势，右侧饼图拆解收入业务构成，帮助管理者快速把握全局经营状况。"
              pageNumber={1}
              totalPages={4}
            >
              <SalesRevenueOverview data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-slide-index={1}
          >
            <SlideSection
              id="slide-1"
              title="分地区"
              description="本页聚焦区域维度的收入表现与目标达成情况。条形图直观对比各区域实际收入与年度目标，颜色区分达标与未达标区域。下方表格细化列出每个区域的收入额、目标值及完成率，便于快速锁定高绩效区域和需要重点关注的潜力市场。"
              pageNumber={2}
              totalPages={4}
            >
              <SalesRevenueByRegion data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-slide-index={2}
          >
            <SlideSection
              id="slide-2"
              title="分产品"
              description="本页从产品维度分析收入结构。左侧环形图展示各产品线在当前周期的收入占比，中心标注总计数值。右侧折线图追踪各产品近半年的收入变化趋势，识别增长亮点与下滑风险，为产品迭代和资源配置提供数据支撑。"
              pageNumber={3}
              totalPages={4}
            >
              <SalesRevenueByProduct data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-slide-index={3}
          >
            <SlideSection
              id="slide-3"
              title="分渠道"
              description="本页从渠道维度剖析收入来源与效率。左侧条形图呈现各渠道的收入贡献及占比，右侧折线图展示渠道收入的半年走势变化。通过对比线上、线下及合作伙伴等渠道的增减趋势，辅助制定渠道投放预算与运营策略调整方案。"
              pageNumber={4}
              totalPages={4}
            >
              <SalesRevenueByChannel data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
