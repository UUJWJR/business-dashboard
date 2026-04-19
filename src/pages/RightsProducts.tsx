import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_DISABLE_MS = 900;
import { Gift, LayoutDashboard, Trophy, UserCircle, DollarSign, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import SlideSection from '../components/common/SlideSection';
import { exportSlidesToPDF } from '../utils/pdfExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, RightsProductsData } from '../types';
import RightsProductsOverview from './rights-products/Overview';
import RightsProductsRanking from './rights-products/Ranking';
import RightsProductsProfile from './rights-products/Profile';
import RightsProductsRevenue from './rights-products/Revenue';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/rights-products/overview' },
  { icon: Trophy, label: '权益排行', path: '/rights-products/ranking' },
  { icon: UserCircle, label: '用户画像', path: '/rights-products/profile' },
  { icon: DollarSign, label: '收入分析', path: '/rights-products/revenue' },
];

const slidePaths = [
  '/rights-products/overview',
  '/rights-products/ranking',
  '/rights-products/profile',
  '/rights-products/revenue',
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

export default function RightsProducts() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<RightsProductsData>('rights-products', timeRange);

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
    await exportSlidesToPDF('#rights-products-slides', `权益产品报表_${dateStr}`);
  };

  return (
    <ModuleLayout
      title="权益产品"
      icon={<Gift className="w-6 h-6" />}
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
        <div id="rights-products-slides" className="flex flex-col">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-slide-index={0}
          >
            <SlideSection
              id="slide-0"
              title="总览"
              description="本页展示权益产品业务的核心运营指标与整体趋势。顶部KPI卡片实时反映权益订阅数、同比增长率、目标达成率及活跃用户占比等关键数据。中部折线图呈现近半年月度订阅走势，右侧饼图拆解权益类型构成，底部条形图展示权益活跃度TOP10排名，帮助管理者快速把握权益业务全局状况。"
              pageNumber={1}
              totalPages={4}
            >
              <RightsProductsOverview data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-slide-index={1}
          >
            <SlideSection
              id="slide-1"
              title="权益排行"
              description="本页聚焦权益产品的活跃度排行与明细数据。顶部条形图直观展示各权益的活跃用户数排名，底部表格详细列出排名、权益名称及活跃用户数据。通过分析高热度权益与低热度权益，辅助制定权益推广策略和产品优化方案。"
              pageNumber={2}
              totalPages={4}
            >
              <RightsProductsRanking data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-slide-index={2}
          >
            <SlideSection
              id="slide-2"
              title="用户画像"
              description="本页从用户维度分析权益产品的受众特征。左侧饼图展示各权益类型的用户偏好分布，右侧条形图展示用户年龄段的占比分布。通过洞察用户画像，辅助制定精准营销策略和权益产品设计方向。"
              pageNumber={3}
              totalPages={4}
            >
              <RightsProductsProfile data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>

          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-slide-index={3}
          >
            <SlideSection
              id="slide-3"
              title="收入分析"
              description="本页从收入维度分析权益产品的变现能力。左侧饼图展示各权益类型的收入贡献占比，右侧条形图对比各类权益的收入数据。通过分析收入结构，辅助制定权益定价策略和收入优化方案。"
              pageNumber={4}
              totalPages={4}
            >
              <RightsProductsRevenue data={data} isDark={isDark} onRefresh={refresh} />
            </SlideSection>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
