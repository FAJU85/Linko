import React, { useState } from 'react';
import {
  Coffee,
  Crown,
  DollarSign,
  TrendingUp,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Users,
  Target,
} from 'lucide-react';
import { LinkItem, TipTransaction, SubscriptionTier } from '../types.ts';

interface MonetizationTabProps {
  links: LinkItem[];
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  tips: TipTransaction[];
}

export const MonetizationTab: React.FC<MonetizationTabProps> = ({
  links,
  setLinks,
  tips,
}) => {
  const tipLink = links.find((l) => l.type === 'tip_jar');
  const tiersLink = links.find((l) => l.type === 'subscription_tiers');

  // Tip jar settings
  const [goalCurrent, setGoalCurrent] = useState(tipLink?.tipGoal?.current || 780);
  const [goalTarget, setGoalTarget] = useState(tipLink?.tipGoal?.target || 1000);
  const [goalLabel, setGoalLabel] = useState(tipLink?.tipGoal?.label || 'Monthly Research & Server Fund');

  // Calculate MRR from subscription tiers
  const tiers = tiersLink?.subscriptionTiers || [];
  const totalTierSubscribers = tiers.reduce((sum, t) => sum + t.subscriberCount, 0);
  const mrr = tiers.reduce((sum, t) => sum + t.monthlyPrice * t.subscriberCount, 0);
  const totalTipsRevenue = tips.reduce((sum, t) => sum + t.amount, 0);

  const handleUpdateGoal = () => {
    if (!tipLink) return;
    setLinks((prev) =>
      prev.map((l) =>
        l.id === tipLink.id
          ? {
              ...l,
              tipGoal: {
                current: Number(goalCurrent),
                target: Number(goalTarget),
                label: goalLabel,
              },
            }
          : l
      )
    );
  };

  const handleAddTier = () => {
    if (!tiersLink) return;
    const newTier: SubscriptionTier = {
      id: `tier-${Date.now()}`,
      name: 'Advisory Circle',
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: 'Monthly 1-on-1 strategy call and direct architecture audit.',
      perks: ['Direct Slack connect', 'Monthly 45m 1-on-1 consultation', 'Full code reviews'],
      subscriberCount: 6,
    };

    setLinks((prev) =>
      prev.map((l) =>
        l.id === tiersLink.id
          ? {
              ...l,
              subscriptionTiers: [...(l.subscriptionTiers || []), newTier],
            }
          : l
      )
    );
  };

  const handleDeleteTier = (tierId: string) => {
    if (!tiersLink) return;
    setLinks((prev) =>
      prev.map((l) =>
        l.id === tiersLink.id
          ? {
              ...l,
              subscriptionTiers: (l.subscriptionTiers || []).filter((t) => t.id !== tierId),
            }
          : l
      )
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Creator Monetization Studio
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Empower your audience to back your work through one-off tips and recurring subscription tiers.
        </p>
      </div>

      {/* Revenue High-level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Monthly Recurring Revenue</span>
            <Crown className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            ${mrr.toLocaleString()}
            <span className="text-xs font-normal text-neutral-400 font-sans ml-1">/ month</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            {totalTierSubscribers} active recurring members
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Tips Collected</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            ${totalTipsRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            {tips.length} supporters tipped
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Project Goal Progress</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {Math.round((goalCurrent / goalTarget) * 100)}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            ${goalCurrent} of ${goalTarget} target
          </div>
        </div>
      </div>

      {/* Tip Jar Settings & Goal Tracker */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Tip Jar & Supporter Goal
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
            {tipLink?.isActive ? 'Active on Profile' : 'Hidden'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Goal Title / Purpose
            </label>
            <input
              type="text"
              value={goalLabel}
              onChange={(e) => setGoalLabel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Target Amount ($)
            </label>
            <input
              type="number"
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Current Raised ($)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUpdateGoal}
                className="px-3 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-sky-600 rounded-lg hover:bg-neutral-800 cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Tip Transactions Ledger */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
            Recent Supporter Tips Ledger
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-mono">
                  <th className="py-2 pr-3 font-normal">Supporter</th>
                  <th className="py-2 px-3 font-normal">Message</th>
                  <th className="py-2 px-3 font-normal text-right">Amount</th>
                  <th className="py-2 pl-3 font-normal text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {tips.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 pr-3 font-medium text-neutral-900 dark:text-white">
                      {t.supporterName}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 max-w-[280px] truncate">
                      "{t.message}"
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                      +${t.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono text-neutral-400 text-[11px]">
                      {t.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Tiers Manager */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Recurring Membership Tiers
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddTier}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                tier.highlighted
                  ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/10'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {tier.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {tier.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded-md cursor-pointer"
                    title="Remove Tier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                    ${tier.monthlyPrice}
                  </span>
                  <span className="text-xs text-neutral-400">/ mo</span>
                  <span className="text-xs text-neutral-400 ml-2">
                    (${tier.yearlyPrice} / yr)
                  </span>
                </div>

                {/* Perks Checklist */}
                <ul className="mt-3 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {tier.perks.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {tier.subscriberCount} active members
                </span>
                <span className="font-mono tabular-nums font-semibold text-purple-600 dark:text-purple-400">
                  ${tier.monthlyPrice * tier.subscriberCount} / mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
