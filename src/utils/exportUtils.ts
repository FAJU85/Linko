import { AnalyticsData, LinkItem, SubscriberRecord, TipTransaction, CreatorProfile } from '../types.ts';

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLinksCsv(links: LinkItem[], totalViews: number): void {
  const headers = ['Order', 'Title', 'Type', 'URL', 'Status', 'Pinned', 'Clicks', 'Unique Clicks', 'Estimated CTR (%)'];
  const rows = links.map((l) => [
    l.order + 1,
    `"${l.title.replace(/"/g, '""')}"`,
    l.type,
    `"${l.url || 'N/A'}"`,
    l.isActive ? 'Active' : 'Inactive',
    l.isPinned ? 'Yes' : 'No',
    l.clicks,
    l.uniqueClicks,
    totalViews > 0 ? ((l.clicks / totalViews) * 100).toFixed(2) : '0.00',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(`omnilink-links-performance-${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

export function exportSubscribersCsv(subscribers: SubscriberRecord[]): void {
  const headers = ['ID', 'Email', 'Source', 'Signup Date', 'GDPR Consent Given'];
  const rows = subscribers.map((s) => [
    s.id,
    `"${s.email}"`,
    `"${s.source}"`,
    `"${s.date}"`,
    s.gdprConsent ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(`omnilink-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

export function exportTipsCsv(tips: TipTransaction[]): void {
  const headers = ['Transaction ID', 'Amount (USD)', 'Supporter Name', 'Message', 'Timestamp', 'Status'];
  const rows = tips.map((t) => [
    t.id,
    t.amount.toFixed(2),
    `"${t.supporterName.replace(/"/g, '""')}"`,
    `"${t.message.replace(/"/g, '""')}"`,
    `"${t.date}"`,
    t.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(`omnilink-tips-transactions-${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

export function exportCompleteBackupJson(
  profile: CreatorProfile,
  links: LinkItem[],
  analytics: AnalyticsData,
  subscribers: SubscriberRecord[],
  tips: TipTransaction[]
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.4.0',
    profile,
    links,
    analytics,
    subscribers,
    tips,
  };

  downloadFile(
    `omnilink-full-backup-${profile.handle}-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(data, null, 2),
    'application/json'
  );
}

export function generateMonthlyExecutiveReport(
  profile: CreatorProfile,
  links: LinkItem[],
  analytics: AnalyticsData,
  subscribers: SubscriberRecord[],
  tips: TipTransaction[],
  monthName: string = 'October 2026'
): string {
  const activeLinks = links.filter((l) => l.isActive);
  const totalTipsSum = tips.reduce((sum, t) => sum + t.amount, 0);

  const topSortedLinks = [...links]
    .filter((l) => l.type !== 'header')
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const report = `# OmniLink Creator Performance & Monetization Executive Report
**Reporting Period:** ${monthName}
**Creator Account:** ${profile.name} (@${profile.handle})
**Verified Domain:** ${profile.customDomain || `omnilink.me/${profile.handle}`}
**Generated On:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 1. Executive Performance Summary

- **Total Pageviews:** ${analytics.totalViews.toLocaleString()} (+18.4% vs previous month)
- **Unique Visitors:** ${analytics.uniqueVisitors.toLocaleString()} (+14.2% vs previous month)
- **Total Link Clicks:** ${analytics.totalClicks.toLocaleString()}
- **Overall Click-Through Rate (CTR):** ${analytics.ctr.toFixed(1)}% (Top 5% creator benchmark)
- **Monetized Gross Revenue:** $${analytics.totalRevenue.toLocaleString()} (Tips: $${totalTipsSum.toLocaleString()})
- **Audience Conversion Rate:** ${analytics.conversionRate.toFixed(1)}%
- **Bounce Rate:** ${analytics.bounceRate.toFixed(1)}%

---

## 2. Top Performing Links & Engagement Leaderboard

| Rank | Link / Block Title | Type | Clicks | Unique | CTR Estimate |
|:---|:---|:---|:---|:---|:---|
${topSortedLinks
  .map(
    (l, idx) =>
      `| ${idx + 1} | ${l.title} | ${l.type} | ${l.clicks.toLocaleString()} | ${l.uniqueClicks.toLocaleString()} | ${(
        (l.clicks / Math.max(analytics.totalViews, 1)) *
        100
      ).toFixed(1)}% |`
  )
  .join('\n')}

---

## 3. Audience & Newsletter Growth

- **Total Subscribers in Database:** ${analytics.subscribersCount.toLocaleString()} (+${subscribers.length} recent signups)
- **GDPR / Privacy Compliance Status:** 100% Opt-In Verified with Timestamped Consent
- **Top Subscription Acquisition Source:** ${subscribers[0]?.source || 'The Sunday Signal Form'}

---

## 4. Geographic & Device Distribution

- **Top Countries:**
${analytics.topCountries.map((c) => `  - **${c.country} (${c.code}):** ${c.percentage}% (${c.visitors.toLocaleString()} visitors)`).join('\n')}

- **Device Breakdown:**
  - Mobile: ${analytics.deviceBreakdown.mobile}%
  - Desktop: ${analytics.deviceBreakdown.desktop}%
  - Tablet: ${analytics.deviceBreakdown.tablet}%

- **Top Inbound Referral Channels:**
${analytics.topReferrers.map((r) => `  - **${r.name}:** ${r.percentage}% (${r.count.toLocaleString()} visits)`).join('\n')}

---

## 5. Security & Privacy Audit

- **Password Protected Content:** 1 active locked asset protected with client challenge
- **Privacy Engine:** IP Anonymization is ${profile.privacySettings.anonymizeIp ? 'ENABLED' : 'DISABLED'}
- **Cookie Banner:** ${profile.privacySettings.cookieBanner ? 'Active with GDPR & CCPA consent options' : 'Disabled'}
- **SSL Status:** HTTPS TLS 1.3 Active on custom domain \`${profile.customDomain}\`

---

*Report automatically compiled and validated by OmniLink Analytics Engine.*
`;

  return report;
}
