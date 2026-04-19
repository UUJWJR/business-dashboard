# 业务数据看板 (Business Dashboard)

一个基于 React 18 + TypeScript + Vite 构建的多模块业务数据可视化看板，面向中文用户，采用纯前端模拟数据实现零后端依赖的演示与开发环境。

---

## 功能特性

- **6大业务模块**：销售收入、客户新增、宽带新增、智家产品、权益产品、家庭组网
- **模块内子页面**：每个模块包含总览及 3 个深度分析子页面
- **KPI 指标卡**：实时模拟数据更新（每 8 秒），支持环比/同比展示
- **多维图表**：折线图、柱状图、饼图、雷达图、组合图等（基于 ECharts）
- **时间范围切换**：支持 7天/30天/90天/全年维度，状态同步到 URL
- **深色模式**：一键切换明暗主题，偏好持久化到 localStorage
- **Excel 导出**：每个模块支持一键导出多 Sheet 报表（基于 SheetJS）
- **响应式布局**：适配桌面端主流分辨率
- **路由权限**：登录状态守卫，未登录自动跳转登录页
- **用户退出**：顶部导航栏头像下拉菜单，支持安全退出

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS 3（dark mode: `class` 策略）|
| 图表 | ECharts 5 + `echarts-for-react` |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 路由 | React Router DOM 7 |
| Excel | SheetJS (`xlsx`) |
| 路径别名 | `@/*` → `src/*` |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/UUJWJR/business-dashboard.git
cd business-dashboard

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

默认在 http://localhost:5173 打开，支持热更新。

### 构建

```bash
# 类型检查 + 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

---

## 项目结构

```
src/
├── pages/                    # 顶层路由页面
│   ├── Login.tsx             # 登录页
│   ├── Home.tsx              # 首页（模块卡片入口）
│   ├── SalesRevenue.tsx      # 销售收入模块
│   ├── CustomerAcquisition.tsx
│   ├── Broadband.tsx
│   ├── SmartHome.tsx
│   ├── RightsProducts.tsx
│   ├── HomeNetworking.tsx
│   └── */                    # 各模块子页面组件
├── components/
│   ├── layout/               # 布局组件（Navbar、Sidebar、ModuleLayout）
│   ├── common/               # 通用组件（SubIconNav、TimeRangeSelector、ExportButton、ProtectedRoute）
│   ├── charts/               # 图表封装与具体图表
│   └── kpi/                  # KPI 指标卡片
├── hooks/                    # 自定义 Hooks（useAuth、useTheme、useModuleData）
├── contexts/                 # React Context（AuthContext）
├── types/                    # 全局 TypeScript 类型定义
├── utils/                    # 工具函数（数据生成器、Excel 导出、数字动画）
└── App.tsx                   # 路由与认证守卫配置
```

---

## 模块说明

| 模块 | 路由 | 子页面 |
|------|------|--------|
| 销售收入 | `/sales-revenue/*` | 总览、分地区、分产品、分渠道 |
| 客户新增 | `/customer-acquisition/*` | 总览、客户画像、渠道分析、流失预警 |
| 宽带新增 | `/broadband/*` | 总览、速率分析、区域覆盖、竞品对比 |
| 智家产品 | `/smart-home/*` | 总览、产品排行、绑定分析、用户反馈 |
| 权益产品 | `/rights-products/*` | 总览、权益排行、用户画像、收入分析 |
| 家庭组网 | `/home-networking/*` | 总览、方案分析、覆盖地图、工单管理 |

---

## 开发说明

### 模拟数据

所有数据均为客户端模拟生成，无真实 API 调用：

- `src/utils/dataGenerator.ts` — 按模块和时间范围生成对应数据
- `src/hooks/useModuleData.ts` — 统一封装数据获取与加载状态

### 主题切换

- `useTheme` hook 管理 `dark` class 和 localStorage 持久化（key: `dashboard-theme`）
- 图表组件通过 `isDark` prop 手动计算 ECharts 配色

### Excel 导出

- `src/utils/excelExport.ts` 提供各数据类型的转换函数
- 每个模块页面在 `handleExport` 中组织数据并调用 `exportToExcel`
- 导出文件包含自动列宽的多 Sheet `.xlsx`

### 认证流程

- 登录后写入 `localStorage.setItem('dashboard-auth', '...')`
- `AuthContext` 提供全局认证状态
- `ProtectedRoute` 拦截未认证访问并跳转 `/login`
- `Navbar` 头像下拉菜单支持退出（清除 token 并跳转）

---

## 许可证

[MIT](LICENSE)
