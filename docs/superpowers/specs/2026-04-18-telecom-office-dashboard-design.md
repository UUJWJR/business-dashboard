# 通信企业办公桌面看板设计方案

## 项目背景

将现有的通用经营数据看板改造为面向通信企业内部使用的办公桌面系统，覆盖 7 个核心业务模块：首页、销售收入、客户新增、宽带新增、智家产品、权益产品、家庭组网。

---

## 页面结构与路由设计

### 路由总览

| 路由 | 页面 | 说明 |
|---|---|---|
| `/home` | 首页 | 模块图标墙 + 全局时间筛选 |
| `/sales-revenue` | 销售收入 | 默认重定向到 `/sales-revenue/overview` |
| `/sales-revenue/:subPage` | 销售收入子页 | overview / by-region / by-product / by-channel |
| `/customer-acquisition` | 客户新增 | 默认重定向到 `/customer-acquisition/overview` |
| `/customer-acquisition/:subPage` | 客户新增子页 | overview / profile / channel / churn |
| `/broadband` | 宽带新增 | 默认重定向到 `/broadband/overview` |
| `/broadband/:subPage` | 宽带新增子页 | overview / speed / coverage / competitor |
| `/smart-home` | 智家产品 | 默认重定向到 `/smart-home/overview` |
| `/smart-home/:subPage` | 智家产品子页 | overview / ranking / binding / feedback |
| `/rights-products` | 权益产品 | 默认重定向到 `/rights-products/overview` |
| `/rights-products/:subPage` | 权益产品子页 | overview / ranking / profile / revenue |
| `/home-networking` | 家庭组网 | 默认重定向到 `/home-networking/overview` |
| `/home-networking/:subPage` | 家庭组网子页 | overview / solution / coverage / workorder |

### 首页（/home）布局

- 顶部：全局时间筛选器（近7天 / 近30天 / 近90天 / 本年）+ 用户信息 + 主题切换
- 主体：7 个模块图标卡片，2 列（平板）/ 3 列（桌面）响应式网格
- 每个卡片包含：模块图标、模块名称、2 个核心 KPI 速览、趋势箭头

### 模块页面通用布局

- 顶部：模块标题 + 子图标导航栏（SubIconNav）+ 独立时间筛选器
- 主体：4 个 KPI 卡片行 + 2-3 个图表区域
- 图表使用现有 ChartCard 包装组件，支持刷新和 PNG 导出

### 侧边栏导航

Sidebar 改为固定模块导航菜单，包含：
- 首页
- 销售收入
- 客户新增
- 宽带新增
- 智家产品
- 权益产品
- 家庭组网

当前所在模块高亮显示。

---

## 各模块数据展示设计

### 模块 1：销售收入（Sales Revenue）

**KPI 卡片（4个）**：
1. 本月收入：50-150 亿元（同比、环比）
2. 累计收入：年度完成率进度
3. 单客 ARPU：X 元
4. 收入增长率：X%

**图表**：
1. 月度收入趋势折线图（收入 vs 净利润，12个月）
2. 收入构成饼图（语音 / 流量 / 宽带 / 增值 / 其他）
3. 分地区收入柱状图（华东 / 华南 / 华北 / 西部）

**子图标入口**：总览、分地区、分产品、分渠道

**Mock 数据真实化**：
- 语音收入占比逐年微降（25% -> 20%）
- 流量收入为主力（40-45%）
- 增值业务收入稳步上升（15% -> 20%）
- 月度收入在年初较低、年底冲刺较高

---

### 模块 2：客户新增（Customer Acquisition）

**KPI 卡片（4个）**：
1. 本月新增客户：X 万户
2. 累计客户数：X 亿户
3. 净增客户：X 万户（新增 - 流失）
4. 客户留存率：X%

**图表**：
1. 新增客户趋势图（日新增折线 / 月度累计）
2. 客户类型占比饼图（个人 / 家庭 / 政企）
3. 新增渠道分布柱状图（营业厅 / 线上 / 代理 / 直销）

**子图标入口**：总览、客户画像、渠道分析、流失预警

**Mock 数据真实化**：
- 个人客户占 80%，家庭 15%，政企 5%
- 新增渠道：线上占比逐年提升（30% -> 45%）
- 流失率控制在 2-4%
- 节假日和开学季有新客高峰

---

### 模块 3：宽带新增（Broadband）

**KPI 卡片（4个）**：
1. 本月新增宽带：X 万户
2. 宽带总用户：X 亿户
3. 千兆宽带占比：X%
4. 宽带渗透率：X%

**图表**：
1. 宽带新增趋势图（月度）
2. 带宽速率分布饼图（100M / 300M / 500M / 1000M）
3. 区域新增柱状图（各省份/大区）

**子图标入口**：总览、速率分析、区域覆盖、竞品对比

**Mock 数据真实化**：
- 100M 用户逐年减少，300M/500M 为主力
- 1000M 千兆宽带快速增长（占比 10% -> 30%）
- 城市渗透率高于农村
- 绑定手机套餐的宽带占比 70%+

---

### 模块 4：智家产品（Smart Home）

**KPI 卡片（4个）**：
1. 智家产品销量：X 万件
2. 智家用户渗透率：X%
3. 户均产品数：X 个
4. 智家收入：X 万元

**图表**：
1. 产品销量趋势图（月度）
2. 产品品类占比饼图（摄像头 / 门锁 / 音箱 / 传感器 / 其他）
3. 智家套餐绑定率趋势

**子图标入口**：总览、产品排行、绑定分析、用户反馈

**Mock 数据真实化**：
- 摄像头销量最高（40%），门锁次之（25%）
- 双11、618 等促销节点有明显峰值
- 绑定宽带/手机套餐的用户渗透率更高
- 户均产品数 2-3 个

---

### 模块 5：权益产品（Rights Products）

**KPI 卡片（4个）**：
1. 权益订阅数：X 万份
2. 权益收入：X 万元
3. 权益使用率：X%
4. 权益客单价：X 元

**图表**：
1. 权益订阅趋势图
2. 权益类型分布饼图（视频 / 音乐 / 餐饮 / 出行 / 生活）
3. 权益活跃度 TOP10 横向柱状图

**子图标入口**：总览、权益排行、用户画像、收入分析

**Mock 数据真实化**：
- 视频类权益订阅最多（35%），音乐次之（20%）
- 使用率 60-80%，生活类权益使用率偏低
- 权益客单价 15-30 元/月
- 与会员套餐绑定销售的占比高

---

### 模块 6：家庭组网（Home Networking）

**KPI 卡片（4个）**：
1. 组网订单数：X 万单
2. 组网覆盖率：X%
3. 户均组网设备：X 台
4. 组网满意度：X 分

**图表**：
1. 组网订单趋势图
2. 组网方案分布饼图（全屋 WiFi / Mesh / PLC / AP）
3. 区域组网覆盖柱状图

**子图标入口**：总览、方案分析、覆盖地图、工单管理

**Mock 数据真实化**：
- 全屋 WiFi 方案占 60%，Mesh 占 25%
- 新装宽带用户组网渗透率 40-50%
- 满意度 4.5-4.8 分（5分制）
- 工单处理时长 24-48 小时

---

## 数据模型设计

### 通用类型

```typescript
type TimeRange = '7d' | '30d' | '90d' | 'year';

interface KPIMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: number;        // 环比 %
  yoyTrend?: number;    // 同比 %
  icon: string;
  color: string;
}

interface TrendChartData {
  labels: string[];
  datasets: {
    name: string;
    values: number[];
    color?: string;
  }[];
}

interface DistributionData {
  name: string;
  value: number;
  percent?: number;
}

interface RegionData {
  name: string;
  value: number;
  target: number;
}
```

### 模块专用类型

```typescript
// 销售收入
interface SalesRevenueData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  composition: DistributionData[];
  byRegion: RegionData[];
  byProduct: DistributionData[];
  byChannel: DistributionData[];
}

// 客户新增
interface CustomerAcquisitionData {
  kpis: KPIMetric[];
  dailyTrend: TrendChartData;
  monthlyTrend: TrendChartData;
  typeDistribution: DistributionData[];
  channelDistribution: DistributionData[];
  churnRisk: { level: string; count: number }[];
}

// 宽带新增
interface BroadbandData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  speedDistribution: DistributionData[];
  byRegion: RegionData[];
  competitorShare: DistributionData[];
}

// 智家产品
interface SmartHomeData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  productDistribution: DistributionData[];
  bindingRate: TrendChartData;
  topProducts: { name: string; sales: number }[];
}

// 权益产品
interface RightsProductsData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  typeDistribution: DistributionData[];
  topRights: { name: string; activeUsers: number }[];
  revenueByType: DistributionData[];
}

// 家庭组网
interface HomeNetworkingData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  solutionDistribution: DistributionData[];
  byRegion: RegionData[];
  workorderStats: { status: string; count: number }[];
}

// 首页预览
interface HomePreviewData {
  modules: {
    id: string;
    name: string;
    icon: string;
    color: string;
    path: string;
    kpis: { title: string; value: number; unit: string; trend: number }[];
  }[];
}
```

---

## Mock 数据生成策略

所有数据由 `src/utils/dataGenerator.ts` 统一生成，按模块拆分函数：

```typescript
// 原函数扩展
export function generateSalesRevenueData(timeRange: TimeRange): SalesRevenueData;
export function generateCustomerAcquisitionData(timeRange: TimeRange): CustomerAcquisitionData;
export function generateBroadbandData(timeRange: TimeRange): BroadbandData;
export function generateSmartHomeData(timeRange: TimeRange): SmartHomeData;
export function generateRightsProductsData(timeRange: TimeRange): RightsProductsData;
export function generateHomeNetworkingData(timeRange: TimeRange): HomeNetworkingData;

// 首页快速预览数据
export function generateHomePreviewData(): HomePreviewData;
```

### 数据真实化规则

1. **时间维度**：月度数据有季节性（年初低、年中稳、年底高），日度数据有周内波动（工作日高、周末低）
2. **业务关联**：客户新增与宽带新增正相关，智家销量与宽带新增正相关
3. **趋势合理性**：千兆宽带占比、线上渠道占比等结构性指标只增不减（或缓慢变化）
4. **数值范围**：所有数值落在通信企业合理业务区间内

---

## 组件架构

### 新增组件

| 组件 | 路径 | 用途 |
|---|---|---|
| `ModuleIconGrid` | `components/common/ModuleIconGrid.tsx` | 首页模块图标网格 |
| `ModuleIconCard` | `components/common/ModuleIconCard.tsx` | 单个模块图标卡片 |
| `SubIconNav` | `components/common/SubIconNav.tsx` | 模块内子图标导航 |
| `ModuleLayout` | `components/layout/ModuleLayout.tsx` | 模块页面通用布局 |
| `ModuleKPIGrid` | `components/kpi/ModuleKPIGrid.tsx` | 模块页 4 个 KPI 卡片 |

### 复用现有组件

| 组件 | 来源 | 修改 |
|---|---|---|
| `ChartCard` | `components/charts/ChartCard.tsx` | 无修改，直接复用 |
| `KPICard` | `components/kpi/KPICard.tsx` | 扩展支持同比趋势显示 |
| `TimeRangeSelector` | `components/common/TimeRangeSelector.tsx` | 无修改，直接复用 |
| `Navbar` | `components/layout/Navbar.tsx` | 右上角加用户名显示 |
| `Sidebar` | `components/layout/Sidebar.tsx` | 菜单改为模块导航 |

### 页面组件

| 页面 | 路径 | 说明 |
|---|---|---|
| `Home` | `pages/Home.tsx` | 首页模块图标墙 |
| `SalesRevenue` | `pages/SalesRevenue.tsx` | 销售收入模块壳（含子路由） |
| `SalesRevenueOverview` | `pages/sales-revenue/Overview.tsx` | 销售收入总览 |
| `SalesRevenueByRegion` | `pages/sales-revenue/ByRegion.tsx` | 分地区 |
| ... | ... | 其他子页 |

（其他 5 个模块页面结构类似）

---

## 状态管理

### 时间范围状态

每个模块页有自己的 `timeRange` 状态，通过 URL query 参数同步（如 `?range=30d`），刷新页面后保持选择。

首页有独立的全局 `timeRange` 状态，不影响模块页。

### 数据获取

每个模块使用独立的 `useModuleData` hook（由 `useDashboardData` 拆分）：

```typescript
function useModuleData<T>(
  module: ModuleKey,
  timeRange: TimeRange
): { data: T | null; loading: boolean; refresh: () => void }
```

数据在组件 mount 时生成，支持手动刷新。

---

## 交互设计

### 首页
- 点击模块卡片 → 跳转到对应模块总览页
- 时间筛选切换 → 所有卡片 KPI 数据刷新
- 卡片 hover 效果 → 轻微上浮 + 阴影加深

### 模块页
- 子图标导航点击 → 切换子页面内容（无整页刷新）
- 时间筛选切换 → 当前模块所有图表和 KPI 刷新
- 图表刷新按钮 → 仅刷新该图表数据
- 图表导出按钮 → PNG 下载（现有功能）

### 侧边栏
- 点击模块 → 跳转到模块总览页
- 当前模块高亮 → 视觉上明确位置

---

## 响应式设计

### 断点
- 移动端（< 768px）：单列布局，侧边栏折叠为汉堡菜单
- 平板（768px - 1024px）：首页 2 列，模块页 KPI 2x2
- 桌面（> 1024px）：首页 3 列，模块页 KPI 4 列一行

### 移动端适配
- 侧边栏变为抽屉式菜单
- 图表支持横向滚动
- KPI 卡片改为 2 列
- 子图标导航支持横向滑动

---

## 样式规范

延续现有 Tailwind 设计系统：
- 卡片：`bg-white dark:bg-gray-800 rounded-card shadow-card dark:shadow-card-dark`
- 边框：`border-gray-100 dark:border-gray-700`
- 文字：`text-gray-900 dark:text-white`
- 主色：`primary-600`（靛蓝色系）
- 成功/警告/危险：`success-600` / `warning-600` / `danger-600`

模块图标使用 Lucide React 图标库，每个模块分配固定图标和主色调。

---

## 实施优先级

### 第一阶段：基础架构（必须）
1. 重写路由配置（App.tsx）
2. 改造 Sidebar 为模块导航
3. 创建 ModuleLayout 通用布局
4. 扩展类型定义
5. 扩展 Mock 数据生成器

### 第二阶段：首页 + 1 个模块（MVP）
1. 首页 ModuleIconGrid
2. 销售收入模块（完整实现，含 4 个子页）
3. 验证数据流和交互

### 第三阶段：剩余模块
1. 客户新增
2. 宽带新增
3. 智家产品
4. 权益产品
5. 家庭组网

### 第四阶段：优化
1. 响应式移动端适配
2. 数据真实化调优
3. 性能优化（图表懒加载等）
