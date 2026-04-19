import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { Users, LayoutDashboard, UserCircle, Share2, AlertTriangle, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, CustomerAcquisitionData } from '../types';
import CustomerAcquisitionOverview from './customer-acquisition/Overview';
import CustomerAcquisitionProfile from './customer-acquisition/Profile';
import CustomerAcquisitionChannel from './customer-acquisition/Channel';
import CustomerAcquisitionChurn from './customer-acquisition/Churn';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/customer-acquisition/overview' },
  { icon: UserCircle, label: '客户画像', path: '/customer-acquisition/profile' },
  { icon: Share2, label: '渠道分析', path: '/customer-acquisition/channel' },
  { icon: AlertTriangle, label: '流失预警', path: '/customer-acquisition/churn' },
];

const slidePaths = [
  '/customer-acquisition/overview',
  '/customer-acquisition/profile',
  '/customer-acquisition/channel',
  '/customer-acquisition/churn',
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

export default function CustomerAcquisition() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<CustomerAcquisitionData>('customer-acquisition', timeRange);

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
    await exportSlidesToPDF('#customer-acquisition-slides', `客户新增报表_${dateStr}`);
  };

  return (
    <ModuleLayout
      title="客户新增"
      icon={<Users className="w-6 h-6" />}
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
        <div id="customer-acquisition-slides" className="flex flex-col">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-slide-index={0}
          >
            <SlideSection
              id="slide-0"
              title="总览"
              description="本页展示客户新增的核心运营指标与整体趋势。顶部 KPI 卡片实时反映新增客户数、同比增长率、目标达成率及客户获取成本等关键数据。中部折线图呈现近半年月度新增客户走势，右侧饼图拆解客户类型构成，帮助管理者快速把握全局获客状况。"
              pageNumber={1}
              totalPages={4}
            >
              <CustomerAcquisitionOverview data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-slide-index={1}
          >
            <SlideSection
              id="slide-1"
              title="客户画像"
              description="本页从客户类型维度分析新增客群结构。左侧饼图展示各类型客户在当前周期的占比，右侧折线图追踪不同类型客户近半年的新增变化趋势，识别高价值客群增长亮点与潜在下滑风险，为精准营销和产品定位提供数据支撑。"
              pageNumber={2}
              totalPages={4}
            >
              <CustomerAcquisitionProfile data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-slide-index={2}
          >
            <SlideSection
              id="slide-2"
              title="渠道分析"
              description="本页聚焦渠道维度的获客表现与效率对比。左侧条形图直观对比各渠道的新增客户占比，右侧折线图展示各渠道近半年的获客趋势变化。通过对比线上、线下及合作伙伴等渠道的增减趋势，辅助制定渠道投放预算与运营策略调整方案。"
              pageNumber={3}
              totalPages={4}
            >
              <CustomerAcquisitionChannel data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-slide-index={3}
          >
            <SlideSection
              id="slide-3"
              title="流失预警"
              description="本页从流失风险维度监控客户健康度。左侧条形图呈现各风险等级的客户数量分布，右侧折线图追踪近半年高、中、低风险客户的趋势变化。通过提前识别高风险客群，辅助制定客户挽留策略，降低流失率并提升客户生命周期价值。"
              pageNumber={4}
              totalPages={4}
            >
              <CustomerAcquisitionChurn data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
