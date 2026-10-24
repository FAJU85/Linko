import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  MousePointer,
  Eye,
  DollarSign,
  Users,
  Percent,
  Download,
  FileText,
  Copy,
  Check,
  Calendar,
  Globe,
  Smartphone,
  ArrowUpRight,
  ShieldCheck,
  X,
  Printer,
  Activity,
  Heart,
  ShoppingBag,
  Mail,
} from 'lucide-react';
import { AnalyticsData, LinkItem, SubscriberRecord, TipTransaction, CreatorProfile, ProductOrder } from '../types.ts';
import {
  exportLinksCsv,
  exportSubscribersCsv,
  exportTipsCsv,
  exportCompleteBackupJson,
  generateMonthlyExecutiveReport,
  downloadFile,
} from '../utils/exportUtils.ts';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  links: LinkItem[];
  subscribers: SubscriberRecord[];
  tips: TipTransaction[];
  profile: CreatorProfile;
  orders?: ProductOrder[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  links,
  subscribers,
  tips,
  profile,
  orders = [],
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  // Time-filtered multiplier simulation for interactive feel
  const multiplier = timeRange === '7d' ? 0.35 : timeRange === '30d' ? 1.0 : timeRange === '90d' ? 2.8 : 9.5;

  const currentViews = Math.round(analytics.totalViews * multiplier);
  const currentClicks = Math.round(analytics.totalClicks * multiplier);
  const currentRevenue = Math.round(analytics.totalRevenue * multiplier);
  const currentSubscribers = Math.round(analytics.subscribersCount * multiplier);

  // Handle Monthly Report
  const executiveReportText = generateMonthlyExecutiveReport(
    profile,
    links,
    analytics,
    subscribers,
    tips,
    'October 2026'
  );

  const handleCopyReport = () => {
    navigator.clipboard.writeText(executiveReportText);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    downloadFile(
      `omnilink-executive-report-${profile.handle}-october-2026.md`,
      executiveReportText,
      'text/markdown;charset=utf-8;'
    );
  };

  // Unified, chronologically sorted Recent Activity feed
  const recentActivities = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'tip' | 'order' | 'subscriber';
      title: string;
      subtitle: string;
      amount?: number;
      date: string;
      formattedDate: string;
    }> = [];

    (tips || []).forEach((tip) => {
      items.push({
        id: `tip-${tip.id}`,
        type: 'tip',
        title: tip.supporterName ? `Tip from ${tip.supporterName}` : 'Anonymous Supporter Tip',
        subtitle: tip.message ? `"${tip.message}"` : 'Direct fan support',
        amount: tip.amount,
        date: tip.date,
        formattedDate: tip.date,
      });
    });

    (orders || []).forEach((ord) => {
      items.push({
        id: `order-${ord.id}`,
        type: 'order',
        title: ord.productTitle || 'Digital Store Purchase',
        subtitle: ord.customerEmail ? `Purchased by ${ord.customerEmail}` : 'Digital store order',
        amount: ord.amountPaid,
        date: ord.date,
        formattedDate: ord.date,
      });
    });

    (subscribers || []).forEach((sub) => {
      items.push({
        id: `sub-${sub.id}`,
        type: 'subscriber',
        title: 'New Audience Subscriber',
        subtitle: `${sub.email} (${sub.source || 'Newsletter'})`,
        date: sub.date,
        formattedDate: sub.date,
      });
    });

    return items
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, 8);
  }, [tips, orders, subscribers]);

  // SVG Chart Dimensions & Points
  const historyData = analytics.history;
  const maxViews = Math.max(...historyData.map((d) => d.views), 1);
  const chartHeight = 160;
  const chartWidth = 600;

  const pointsViews = historyData
    .map((d, i) => {
      const x = (i / (historyData.length - 1)) * chartWidth;
      const y = chartHeight - (d.views / maxViews) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  const pointsClicks = historyData
    .map((d, i) => {
      const x = (i / (historyData.length - 1)) * chartWidth;
      const y = chartHeight - (d.clicks / maxViews) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  const areaViews = `0,${chartHeight} ${pointsViews} ${chartWidth},${chartHeight}`;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Dashboard Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Real-Time Performance & Audience Growth
            </h2>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track click-through velocity, monetization conversion percentages, and global reach.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>Generate Monthly Report</span>
          </button>

          {/* Quick CSV Export */}
          <button
            type="button"
            onClick={() => exportLinksCsv(links, analytics.totalViews)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Total Views</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {currentViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Total Clicks</span>
            <MousePointer className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {currentClicks.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12.1% engagement</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Average CTR</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {analytics.ctr.toFixed(1)}%
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Top 5% creator benchmark
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Monetized Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            ${currentRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>Tips & Active Tiers</span>
          </div>
        </div>
      </div>

      {/* Interactive Engagement & Traffic Chart */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Traffic & Click Velocity Trends
            </h3>
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                Pageviews
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Link Clicks
              </span>
            </div>
          </div>

          {/* Time range selector buttons (Single line!) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeRange === range
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Sparkline Area Chart */}
        <div className="w-full overflow-x-auto pt-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Guide Lines */}
            <line x1="0" y1={chartHeight - 15} x2={chartWidth} y2={chartHeight - 15} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeDasharray="3 3" />

            {/* Area Fill */}
            <polygon points={areaViews} fill="url(#viewsGradient)" />

            {/* Line Views */}
            <polyline
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsViews}
            />

            {/* Line Clicks */}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsClicks}
            />

            {/* Data Dots */}
            {historyData.map((d, i) => {
              const x = (i / (historyData.length - 1)) * chartWidth;
              const yViews = chartHeight - (d.views / maxViews) * (chartHeight - 30) - 15;
              const yClicks = chartHeight - (d.clicks / maxViews) * (chartHeight - 30) - 15;
              return (
                <g key={i}>
                  <circle cx={x} cy={yViews} r="3.5" className="fill-sky-500 stroke-white dark:stroke-neutral-900 stroke-2" />
                  <circle cx={x} cy={yClicks} r="3.5" className="fill-emerald-500 stroke-white dark:stroke-neutral-900 stroke-2" />
                </g>
              );
            })}
          </svg>

          {/* Date Axis */}
          <div className="flex justify-between text-[11px] font-mono text-neutral-400 dark:text-neutral-500 pt-2 px-1">
            {historyData.map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Live Activity Feed Widget */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Recent Activity
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Live stream of tips, product orders & subscribers
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {recentActivities.length} Events
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 px-2.5 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    act.type === 'tip'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200/50 dark:border-rose-900/40'
                      : act.type === 'order'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200/50 dark:border-emerald-900/40'
                      : 'bg-sky-50 dark:bg-sky-950/40 text-sky-500 border border-sky-200/50 dark:border-sky-900/40'
                  }`}>
                    {act.type === 'tip' && <Heart className="w-3.5 h-3.5" />}
                    {act.type === 'order' && <ShoppingBag className="w-3.5 h-3.5" />}
                    {act.type === 'subscriber' && <Mail className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white truncate">
                        {act.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        act.type === 'tip'
                          ? 'bg-rose-100/60 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : act.type === 'order'
                          ? 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-sky-100/60 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {act.type === 'tip' ? 'Tip' : act.type === 'order' ? 'Product Order' : 'Subscriber'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {act.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {act.amount !== undefined && (
                    <div className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
                      +${act.amount.toFixed(2)}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {act.formattedDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Leaderboard Table */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Link CTR & Conversion Leaderboard
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {links.filter((l) => l.type !== 'header').length} Active Tracked Blocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 font-mono">
                <th className="py-2.5 pr-4 font-normal">Block Title</th>
                <th className="py-2.5 px-3 font-normal">Type</th>
                <th className="py-2.5 px-3 font-normal text-right">Clicks</th>
                <th className="py-2.5 px-3 font-normal text-right">Unique</th>
                <th className="py-2.5 pl-3 font-normal text-right">CTR (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {links
                .filter((l) => l.type !== 'header')
                .sort((a, b) => b.clicks - a.clicks)
                .map((link) => {
                  const ctr =
                    analytics.totalViews > 0
                      ? ((link.clicks / analytics.totalViews) * 100).toFixed(1)
                      : '0.0';

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-neutral-900 dark:text-white truncate max-w-[240px]">
                        {link.title}
                      </td>
                      <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                        {link.type}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                        {link.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                        {link.uniqueClicks.toLocaleString()}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono tabular-nums font-semibold text-sky-600 dark:text-sky-400">
                        {ctr}%
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referrers & Geographic Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Referral Channels */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Traffic Referral Channels
            </h3>
            <Globe className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {analytics.topReferrers.map((ref) => (
              <div key={ref.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-800 dark:text-neutral-200">{ref.name}</span>
                  <span className="font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                    {ref.count.toLocaleString()} ({ref.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${ref.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Geographic Reach */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Device Breakdown & Geo Reach
            </h3>
            <Smartphone className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Device bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>Mobile ({analytics.deviceBreakdown.mobile}%)</span>
              <span>Desktop ({analytics.deviceBreakdown.desktop}%)</span>
              <span>Tablet ({analytics.deviceBreakdown.tablet}%)</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-100 dark:bg-neutral-800">
              <div style={{ width: `${analytics.deviceBreakdown.mobile}%` }} className="bg-sky-500" />
              <div style={{ width: `${analytics.deviceBreakdown.desktop}%` }} className="bg-purple-500" />
              <div style={{ width: `${analytics.deviceBreakdown.tablet}%` }} className="bg-amber-500" />
            </div>
          </div>

          {/* Top Countries */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Top Geographic Markets
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {analytics.topCountries.slice(0, 4).map((c) => (
                <div key={c.code} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between">
                  <span className="text-neutral-700 dark:text-neutral-300">{c.country}</span>
                  <span className="font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                    {c.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* blstrco Global Edge Telemetry & Anti-Fraud Protection */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              blstrco Global Edge Telemetry & Bot Protection
            </h3>
          </div>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            99.4% Edge Cache Hit Ratio
          </span>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Edge routing metrics powered by Fastly/Cloudflare POPs with token-bucket rate limiting and anti-fraud bot score filtering (<span className="font-mono text-emerald-600 dark:text-emerald-400">X-Blstr-Bot-Score &lt; 0.05</span>).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
            <div className="text-[11px] text-neutral-400 font-mono">US-West POP</div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white mt-0.5">12.4ms P99</div>
            <div className="text-[10px] text-emerald-500 font-mono mt-0.5">● 100% SLA</div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
            <div className="text-[11px] text-neutral-400 font-mono">EU-Central POP</div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white mt-0.5">18.1ms P99</div>
            <div className="text-[10px] text-emerald-500 font-mono mt-0.5">● 100% SLA</div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
            <div className="text-[11px] text-neutral-400 font-mono">AP-East POP</div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white mt-0.5">24.6ms P99</div>
            <div className="text-[10px] text-emerald-500 font-mono mt-0.5">● 100% SLA</div>
          </div>

          <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
            <div className="text-[11px] text-neutral-400 font-mono">Bot Filtered</div>
            <div className="font-mono font-semibold text-sky-600 dark:text-sky-400 mt-0.5">1,420 Scrapes</div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Clean Traffic</div>
          </div>
        </div>
      </div>

      {/* Historical Data Export System */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Historical Data Export & Archival
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Export granular records for offline statistical modeling, tax compliance, or CRM ingestion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => exportLinksCsv(links, analytics.totalViews)}
            className="p-3 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Links Performance
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">CSV format</div>
          </button>

          <button
            type="button"
            onClick={() => exportSubscribersCsv(subscribers)}
            className="p-3 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Subscribers List
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">CSV format</div>
          </button>

          <button
            type="button"
            onClick={() => exportTipsCsv(tips)}
            className="p-3 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Tips & Receipts
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">CSV format</div>
          </button>

          <button
            type="button"
            onClick={() => exportCompleteBackupJson(profile, links, analytics, subscribers, tips)}
            className="p-3 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Full State Backup
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">JSON format</div>
          </button>
        </div>
      </div>

      {/* Automated Monthly Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Executive Performance Report (October 2026)
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-950 select-text">
              {executiveReportText}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print View</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  {reportCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{reportCopied ? 'Copied' : 'Copy Markdown'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
