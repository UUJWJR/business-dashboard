import type {
  SalesRevenueData,
  CustomerAcquisitionData,
  BroadbandData,
  SmartHomeData,
  RightsProductsData,
  HomeNetworkingData,
  WeekReviewData,
} from '../types';

// ─── Helpers ───

function fmt(n: number, digits = 1): string {
  return n.toFixed(digits).replace(/\.0$/, '');
}

function trendDir(values: number[]): string {
  if (values.length < 2) return '持平';
  const first = values[0];
  const last = values[values.length - 1];
  const diff = last - first;
  if (Math.abs(diff) / Math.max(Math.abs(first), 1) < 0.02) return '基本持平';
  return diff > 0 ? '上升' : '下降';
}

function maxBy<T>(items: T[], fn: (item: T) => number): T {
  return items.reduce((a, b) => (fn(a) >= fn(b) ? a : b));
}

function minBy<T>(items: T[], fn: (item: T) => number): T {
  return items.reduce((a, b) => (fn(a) <= fn(b) ? a : b));
}

function rateStr(actual: number, target: number): string {
  const r = (actual / target) * 100;
  return r >= 100 ? '已达标' : `未达标（${fmt(r, 1)}%）`;
}

function latestTrendDir(datasets: { values: number[] }[]): string {
  const lastValues = datasets.map((ds) => ds.values[ds.values.length - 1] ?? 0);
  const firstValues = datasets.map((ds) => ds.values[0] ?? 0);
  const lastTopIdx = lastValues.indexOf(Math.max(...lastValues));
  const firstTopIdx = firstValues.indexOf(Math.max(...firstValues));
  if (lastTopIdx === firstTopIdx) return '格局稳定';
  return `格局变化，${lastTopIdx > firstTopIdx ? '后期' : '前期'}领先`;
}

// ─── Sales Revenue ───

export function salesRevenueOverviewSummary(d: SalesRevenueData): string {
  const rev = d.kpis.find((k) => k.id === 'month-revenue');
  const growth = d.kpis.find((k) => k.id === 'growth-rate');
  const revValues = d.monthlyTrend.datasets[0]?.values ?? [];
  const dir = trendDir(revValues);
  const topComp = maxBy(d.composition, (c) => c.value);
  return `本月收入${rev ? fmt(rev.value) : '--'}亿元，${growth ? `同比增长${fmt(growth.value)}%，` : ''}年度收入趋势总体呈${dir}态势。收入构成中${topComp.name}占比最高（${fmt(topComp.value)}%）。`;
}

export function salesRevenueByRegionSummary(d: SalesRevenueData): string {
  const top = maxBy(d.byRegion, (r) => r.value);
  const bottom = minBy(d.byRegion, (r) => r.value);
  const allMet = d.byRegion.every((r) => r.value >= r.target);
  return `华东区域收入领跑（${top.value}亿），西部最低（${bottom.value}亿）。${allMet ? '所有区域均已达标' : `部分区域未达标，其中${bottom.name}${rateStr(bottom.value, bottom.target)}`}。`;
}

export function salesRevenueByProductSummary(d: SalesRevenueData): string {
  const top = maxBy(d.byProduct, (p) => p.value);
  const bottom = minBy(d.byProduct, (p) => p.value);
  const dir = d.byProductTrend.datasets.length > 0 ? trendDir(d.byProductTrend.datasets[0].values) : '持平';
  return `个人套餐贡献最大收入份额（${fmt(top.value)}%），${bottom.name}占比最小（${fmt(bottom.value)}%）。产品趋势${dir}，建议关注弱势产品线的增长动力。`;
}

export function salesRevenueByChannelSummary(d: SalesRevenueData): string {
  const top = maxBy(d.byChannel, (c) => c.value);
  const bottom = minBy(d.byChannel, (c) => c.value);
  const dir = d.byChannelTrend.datasets.length > 0 ? trendDir(d.byChannelTrend.datasets[0].values) : '持平';
  return `线上渠道收入占比最高（${fmt(top.value)}%），${bottom.name}渠道占比最低（${fmt(bottom.value)}%）。渠道趋势${dir}，线上化趋势明显，建议持续加强数字化运营投入。`;
}

// ─── Customer Acquisition ───

export function customerAcquisitionOverviewSummary(d: CustomerAcquisitionData): string {
  const newCust = d.kpis.find((k) => k.id === 'month-new');
  const retention = d.kpis.find((k) => k.id === 'retention');
  const netValues = d.monthlyTrend.datasets.find((ds) => ds.name === '净增客户')?.values ?? [];
  const dir = trendDir(netValues);
  const topType = maxBy(d.typeDistribution, (t) => t.value);
  return `本月新增客户${newCust ? fmt(newCust.value) : '--'}万户，客户留存率${retention ? fmt(retention.value) : '--'}%。净增客户趋势总体${dir}，${topType.name}客户占比最高（${fmt(topType.value)}%）。`;
}

export function customerAcquisitionProfileSummary(d: CustomerAcquisitionData): string {
  const top = maxBy(d.typeDistribution, (t) => t.value);
  const bottom = minBy(d.typeDistribution, (t) => t.value);
  const dir = d.typeTrend.datasets.length > 0 ? trendDir(d.typeTrend.datasets[0].values) : '持平';
  return `个人客户是绝对主体（${fmt(top.value)}%），政企客户占比最小（${fmt(bottom.value)}%）。客户类型趋势${dir}，家庭客户是未来精准营销的重要增长空间。`;
}

export function customerAcquisitionChannelSummary(d: CustomerAcquisitionData): string {
  const top = maxBy(d.channelDistribution, (c) => c.value);
  const bottom = minBy(d.channelDistribution, (c) => c.value);
  const dir = d.channelTrend.datasets.length > 0 ? trendDir(d.channelTrend.datasets[0].values) : '持平';
  return `线上渠道获客占比最高（${fmt(top.value)}%），${bottom.name}渠道最低（${fmt(bottom.value)}%）。渠道趋势${dir}，建议优化低效渠道资源配置，向线上和代理渠道倾斜。`;
}

export function customerAcquisitionChurnSummary(d: CustomerAcquisitionData): string {
  const high = d.churnRisk.find((c) => c.level === '高风险');
  const mid = d.churnRisk.find((c) => c.level === '中风险');
  const low = d.churnRisk.find((c) => c.level === '低风险');
  const total = d.churnRisk.reduce((s, c) => s + c.count, 0);
  const highTrend = d.churnRiskTrend.datasets.find((ds) => ds.name === '高风险')?.values ?? [];
  const highDir = trendDir(highTrend);
  return `当前识别高风险客户${high ? high.count : '--'}人、中风险${mid ? mid.count : '--'}人，合计占比${total > 0 && high && mid ? fmt((high.count + mid.count) / total * 100) : '--'}%。高风险客户趋势${highDir}，需优先对高风险客群实施挽留策略。`;
}

// ─── Broadband ───

export function broadbandOverviewSummary(d: BroadbandData): string {
  const newB = d.kpis.find((k) => k.id === 'month-broadband');
  const gigabit = d.kpis.find((k) => k.id === 'gigabit-ratio');
  const pen = d.kpis.find((k) => k.id === 'penetration');
  const trendValues = d.monthlyTrend.datasets[0]?.values ?? [];
  const dir = trendDir(trendValues);
  const topSpeed = maxBy(d.speedDistribution, (s) => s.value);
  return `本月新增宽带${newB ? fmt(newB.value) : '--'}万户，千兆宽带占比${gigabit ? fmt(gigabit.value) : '--'}%，渗透率${pen ? fmt(pen.value) : '--'}%。新增趋势总体${dir}，${topSpeed.name}为当前主流速率（${fmt(topSpeed.value)}%）。`;
}

export function broadbandSpeedSummary(d: BroadbandData): string {
  const top = maxBy(d.speedDistribution, (s) => s.value);
  const bottom = minBy(d.speedDistribution, (s) => s.value);
  const dir = d.speedTrend.datasets.length > 0 ? trendDir(d.speedTrend.datasets[0].values) : '持平';
  return `${top.name}宽带用户占比最高（${fmt(top.value)}%），${bottom.name}占比最低（${fmt(bottom.value)}%）。速率趋势${dir}，高带宽升级空间仍存，建议推进千兆提速策略。`;
}

export function broadbandCoverageSummary(d: BroadbandData): string {
  const top = maxBy(d.byRegion, (r) => r.value);
  const bottom = minBy(d.byRegion, (r) => r.value);
  const allMet = d.byRegion.every((r) => r.value >= r.target);
  return `华东宽带用户数领先（${top.value}万户），西部最低（${bottom.value}万户）。${allMet ? '所有区域均已达标' : `${bottom.name}区域${rateStr(bottom.value, bottom.target)}，需重点关注`}。`;
}

export function broadbandCompetitorSummary(d: BroadbandData): string {
  const us = d.competitorShare.find((c) => c.name === '本公司');
  const tel = d.competitorShare.find((c) => c.name === '电信');
  const lead = maxBy(d.competitorShare, (c) => c.value);
  return `本公司市场份额${us ? fmt(us.value) : '--'}%，${lead.name === '本公司' ? '处于领先地位' : `落后${lead.name}（${fmt(lead.value)}%）`}。主要竞争对手为电信（${tel ? fmt(tel.value) : '--'}%），需加强差异化竞争。`;
}

// ─── Smart Home ───

export function smartHomeOverviewSummary(d: SmartHomeData): string {
  const sales = d.kpis.find((k) => k.id === 'smart-sales');
  const pen = d.kpis.find((k) => k.id === 'smart-penetration');
  const avg = d.kpis.find((k) => k.id === 'avg-products');
  const trendValues = d.monthlyTrend.datasets[0]?.values ?? [];
  const dir = trendDir(trendValues);
  const topProd = maxBy(d.productDistribution, (p) => p.value);
  const bindValues = d.bindingRate.datasets[0]?.values ?? [];
  const bindRate = bindValues.length > 0 ? bindValues[bindValues.length - 1] : 0;
  return `本月智家销量${sales ? fmt(sales.value) : '--'}万件，渗透率${pen ? fmt(pen.value) : '--'}%，户均${avg ? fmt(avg.value) : '--'}个产品。销量趋势${dir}，${topProd.name}最受欢迎（${fmt(topProd.value)}%），套餐绑定率${fmt(bindRate)}%。`;
}

export function smartHomeRankingSummary(d: SmartHomeData): string {
  const top = d.topProducts[0];
  const totalSales = d.topProducts.reduce((s, p) => s + p.sales, 0);
  return `智能摄像头Pro销量领跑（${top ? fmt(top.sales, 0) : '--'}台），TOP5产品合计销量${fmt(totalSales, 0)}台。门锁和音箱紧随其后，构成智家产品三大支柱。`;
}

export function smartHomeBindingSummary(d: SmartHomeData): string {
  const bindValues = d.bindingRate.datasets[0]?.values ?? [];
  const first = bindValues.length > 0 ? bindValues[0] : 0;
  const last = bindValues.length > 0 ? bindValues[bindValues.length - 1] : 0;
  const diff = last - first;
  return `套餐绑定率从${fmt(first)}%提升至${fmt(last)}%，${diff > 0 ? `上升${fmt(diff)}个百分点` : diff < 0 ? `下降${fmt(Math.abs(diff))}个百分点` : '基本持平'}。融合套餐对智家用户粘性的拉动作用显著。`;
}

export function smartHomeFeedbackSummary(d: SmartHomeData): string {
  const satValues = d.satisfactionTrend.datasets[0]?.values ?? [];
  const firstSat = satValues.length > 0 ? satValues[0] : 0;
  const lastSat = satValues.length > 0 ? satValues[satValues.length - 1] : 0;
  const topFeedback = maxBy(d.feedbackDistribution, (f) => f.value);
  return `用户满意度从${fmt(firstSat)}分${lastSat > firstSat ? '提升' : lastSat < firstSat ? '降至' : '维持在'}${fmt(lastSat)}分。${topFeedback.name}是用户反馈最多的问题（${fmt(topFeedback.value, 0)}条），需重点优化。`;
}

// ─── Rights Products ───

export function rightsProductsOverviewSummary(d: RightsProductsData): string {
  const subs = d.kpis.find((k) => k.id === 'rights-subs');
  const usage = d.kpis.find((k) => k.id === 'usage-rate');
  const avgPrice = d.kpis.find((k) => k.id === 'avg-price');
  const trendValues = d.monthlyTrend.datasets[0]?.values ?? [];
  const dir = trendDir(trendValues);
  const topType = maxBy(d.typeDistribution, (t) => t.value);
  return `本月权益订阅${subs ? fmt(subs.value) : '--'}万份，使用率${usage ? fmt(usage.value) : '--'}%，客单价${avgPrice ? fmt(avgPrice.value) : '--'}元。订阅趋势总体${dir}，${topType.name}类权益最受青睐（${fmt(topType.value)}%）。`;
}

export function rightsProductsRankingSummary(d: RightsProductsData): string {
  const top = d.topRights[0];
  const total = d.topRights.reduce((s, r) => s + r.activeUsers, 0);
  return `腾讯视频VIP活跃用户最多（${top ? fmt(top.activeUsers, 0) : '--'}人），TOP10权益合计活跃用户${fmt(total, 0)}人。视频和音乐类权益占据主导地位。`;
}

export function rightsProductsProfileSummary(d: RightsProductsData): string {
  const top = maxBy(d.typeDistribution, (t) => t.value);
  const bottom = minBy(d.typeDistribution, (t) => t.value);
  const topAge = maxBy(d.ageDistribution, (a) => a.value);
  return `视频类权益用户偏好最高（${fmt(top.value)}%），餐饮类最低（${fmt(bottom.value)}%）。${topAge.name}为权益主力消费群体（${fmt(topAge.value)}%），具备精细化运营潜力。`;
}

export function rightsProductsRevenueSummary(d: RightsProductsData): string {
  const top = maxBy(d.revenueByType, (t) => t.value);
  const bottom = minBy(d.revenueByType, (t) => t.value);
  return `视频类权益收入贡献最大（${fmt(top.value)}%），餐饮类最低（${fmt(bottom.value)}%）。收入结构与用户偏好高度一致，建议通过交叉销售提升低频权益渗透。`;
}

// ─── Home Networking ───

export function homeNetworkingOverviewSummary(d: HomeNetworkingData): string {
  const orders = d.kpis.find((k) => k.id === 'network-orders');
  const cov = d.kpis.find((k) => k.id === 'coverage');
  const sat = d.kpis.find((k) => k.id === 'satisfaction');
  const trendValues = d.monthlyTrend.datasets[0]?.values ?? [];
  const dir = trendDir(trendValues);
  const topSol = maxBy(d.solutionDistribution, (s) => s.value);
  return `本月组网订单${orders ? fmt(orders.value) : '--'}万单，覆盖率${cov ? fmt(cov.value) : '--'}%，用户满意度${sat ? fmt(sat.value) : '--'}分。订单趋势${dir}，${topSol.name}为主流方案（${fmt(topSol.value)}%）。`;
}

export function homeNetworkingSolutionSummary(d: HomeNetworkingData): string {
  const top = maxBy(d.solutionDistribution, (s) => s.value);
  const bottom = minBy(d.solutionDistribution, (s) => s.value);
  const dir = d.solutionTrend.datasets.length > 0 ? trendDir(d.solutionTrend.datasets[0].values) : '持平';
  return `全屋WiFi方案占据主导地位（${fmt(top.value)}%），${bottom.name}占比最小（${fmt(bottom.value)}%）。方案趋势${dir}，Mesh组网为第二大方案，高端用户对全屋覆盖的需求持续上升。`;
}

export function homeNetworkingCoverageSummary(d: HomeNetworkingData): string {
  const top = maxBy(d.byRegion, (r) => r.value);
  const bottom = minBy(d.byRegion, (r) => r.value);
  const allMet = d.byRegion.every((r) => r.value >= r.target);
  return `华东组网覆盖领先（${top.value}%），西部最低（${bottom.value}%）。${allMet ? '所有区域均已达标' : `${bottom.name}区域${rateStr(bottom.value, bottom.target)}，需加速网络建设`}。`;
}

export function homeNetworkingWorkorderSummary(d: HomeNetworkingData): string {
  const pending = d.workorderStats.find((w) => w.status === '待处理');
  const processing = d.workorderStats.find((w) => w.status === '处理中');
  const done = d.workorderStats.find((w) => w.status === '已完成');
  const timeout = d.workorderStats.find((w) => w.status === '已超时');
  const total = d.workorderStats.reduce((s, w) => s + w.count, 0);
  return `当前待处理工单${pending ? pending.count : '--'}件、处理中${processing ? processing.count : '--'}件，已完成${done ? done.count : '--'}件。超时工单${timeout ? timeout.count : '--'}件，占比${total > 0 && timeout ? fmt(timeout.count / total * 100) : '--'}%，需关注服务时效。`;
}

// ─── Week Review ───

export function weekReviewOverviewSummary(d: WeekReviewData): string {
  const rev = d.kpis.find((k) => k.id === 'week-revenue');
  const sub = d.kpis.find((k) => k.id === 'new-subscribers');
  const bb = d.kpis.find((k) => k.id === 'broadband-net');
  const retain = d.kpis.find((k) => k.id === 'retention');
  const revDir = d.revenueTrend.datasets[0]?.values ? trendDir(d.revenueTrend.datasets[0].values) : '持平';
  const weakRows = d.summaryWeekly.filter((r) => (r.weakCount as number) >= 3);
  return `本周收入完成率${rev ? fmt(rev.value) : '--'}%（趋势${revDir}），新增放号完成率${sub ? fmt(sub.value) : '--'}%，宽带净增${bb ? fmt(bb.value) : '--'}户，客户保拓比${retain ? fmt(retain.value) : '--'}。${weakRows.length > 0 ? `需重点关注${weakRows.map((r) => r.district).join('、')}等区县短板指标改善。` : '整体指标运行平稳。'}`;
}

export function weekReviewRevenueSummary(d: WeekReviewData): string {
  const top = maxBy(d.revenueSummary, (r) => r.complete as number);
  const bottom = minBy(d.revenueSummary, (r) => r.rate as number);
  const pathTop = maxBy(d.path2plus8Completion, (r) => r.newRevenue as number);
  const pathBottom = minBy(d.path2plus8Completion, (r) => r.fttr as number);
  const trendDirStr = d.revenueTrend.datasets[0]?.values ? trendDir(d.revenueTrend.datasets[0].values) : '持平';
  return `销售收入${trendDirStr}，${top.district}完成额最高（${fmt(top.complete as number)}万元），${bottom.district}完成率最低（${fmt(bottom.rate as number)}%）。2+8路径中，${pathTop.district}新增客户创收完成率领先（${fmt(pathTop.newRevenue as number)}%），${pathBottom.district}FTTR完成率最低（${fmt(pathBottom.fttr as number)}%），需加强FTTR推广。`;
}

export function weekReviewScaleSummary(d: WeekReviewData): string {
  const topSub = maxBy(d.scaleSubscribers, (r) => r.daily as number);
  const bottomSub = minBy(d.scaleSubscribers, (r) => (r.rate as number));
  const topBb = maxBy(d.scaleBroadband, (r) => (r.netAdd as number));
  const bottomBb = minBy(d.scaleBroadband, (r) => (r.netAdd as number));
  const scaleDir = d.scaleTrend.datasets[0]?.values ? trendDir(d.scaleTrend.datasets[0].values) : '持平';
  return `新增放号${scaleDir}，${topSub.district}日均放号量最高（${fmt(topSub.daily as number)}户），${bottomSub.district}完成率最低（${fmt(bottomSub.rate as number)}%）。宽带净增方面，${topBb.district}净增最多（${fmt(topBb.netAdd as number)}户），${bottomBb.district}净增最少（${fmt(bottomBb.netAdd as number)}户），需关注离网控制。`;
}

export function weekReviewExistingSummary(d: WeekReviewData): string {
  const topWin = maxBy(d.existingWinback, (r) => (r.winbackRate as number));
  const bottomRet = minBy(d.existingRetention, (r) => (r.groupRate as number));
  const topDown = maxBy(d.existingDowngrade, (r) => (r.count as number));
  const topRisk = maxBy(d.existingRisk, (r) => (r.touchContractRate as number));
  const bottomRisk = minBy(d.existingRisk, (r) => (r.autoChargeRate as number));
  const topTakeover = maxBy(d.existingTakeover, (r) => (r.terminalRate as number));
  return `存量运营方面，${topWin.district}异网主卡赢回率最高（${fmt(topWin.winbackRate as number)}%），${bottomRet.district}组网率最低（${fmt(bottomRet.groupRate as number)}%）。中高端风险修复中，${topRisk.district}触点合约率最高（${fmt(topRisk.touchContractRate as number)}%），${bottomRisk.district}自动充值率最低（${fmt(bottomRisk.autoChargeRate as number)}%）。接盘运营方面，${topTakeover.district}终端接盘率领先。降档方面，${topDown.district}降档规模最大（${fmt(topDown.count as number)}户），需重点压控。`;
}

export function weekReviewOtherSummary(d: WeekReviewData): string {
  const topClean = maxBy(d.otherHomeCleaning, (r) => (r.rate as number));
  const bottomClean = minBy(d.otherHomeCleaning, (r) => (r.rate as number));
  const topDef = maxBy(d.otherDefusal, (r) => (r.rate as number));
  const bottomDef = minBy(d.otherDefusal, (r) => (r.rate as number));
  const topChannel = maxBy(d.otherHomeCleaningChannels, (r) => (r.breakRate as number));
  return `爱家清洗方面，${topClean.district}收入完成率最高（${fmt(topClean.rate as number)}%），${bottomClean.district}完成率最低（${fmt(bottomClean.rate as number)}%），${topChannel.district}渠道破零率最高（${fmt(topChannel.breakRate as number)}%）。拆弹行动方面，${topDef.district}攻坚完成率领先（${fmt(topDef.rate as number)}%），${bottomDef.district}完成率最低（${fmt(bottomDef.rate as number)}%），需加快攻坚进度。`;
}

export function weekReviewSummarySummary(d: WeekReviewData): string {
  const weakRows = d.summaryWeekly.filter((r) => (r.weakCount as number) >= 3).sort((a, b) => (b.weakCount as number) - (a.weakCount as number));
  const topWeak = weakRows[0];
  const topRevenue = maxBy(d.summaryWeekly, (r) => (r.revenueRate as number));
  const bottomRevenue = minBy(d.summaryWeekly, (r) => (r.revenueRate as number));
  return `本周${topRevenue.district}收入完成率最高（${fmt(topRevenue.revenueRate as number)}%），${bottomRevenue.district}收入完成率最低（${fmt(bottomRevenue.revenueRate as number)}%）。${topWeak ? `${topWeak.district}短板指标数最多（${fmt(topWeak.weakCount as number)}个）` : '各区县短板分布较为均衡'}，需加快改善进度。请各条线重点关注落后区县指标提升，确保2+8路径和存量运营双线并进。`;
}
