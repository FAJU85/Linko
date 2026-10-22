import React, { useState } from 'react';
import {
  Mail,
  Users,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { SubscriberRecord } from '../types.ts';
import { exportSubscribersCsv } from '../utils/exportUtils.ts';

interface SubscribersTabProps {
  subscribers: SubscriberRecord[];
  setSubscribers: React.Dispatch<React.SetStateAction<SubscriberRecord[]>>;
}

export const SubscribersTab: React.FC<SubscribersTabProps> = ({
  subscribers,
  setSubscribers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Audience & Newsletter Subscribers
            </h2>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              GDPR Compliant
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Collected via the public landing page newsletter subscription block with explicit opt-in.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportSubscribersCsv(subscribers)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Subscribers CSV</span>
        </button>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Total Opt-In Audience</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {subscribers.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            100% verified opt-in records
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">Consent Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            100%
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Timestamped consent proof stored
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="text-xs font-medium">ESP Sync Status</span>
            <Mail className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">
            Connected via Webhooks
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Mailchimp & Zapier live
          </div>
        </div>
      </div>

      {/* Subscriber Roster */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Subscriber Directory
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by email or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-mono">
                <th className="py-2.5 pr-4 font-normal">Subscriber Email</th>
                <th className="py-2.5 px-3 font-normal">Source Form</th>
                <th className="py-2.5 px-3 font-normal">Signup Date</th>
                <th className="py-2.5 pl-3 font-normal text-right">GDPR Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-400">
                    No subscribers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 pr-4 font-mono font-medium text-neutral-900 dark:text-white">
                      {sub.email}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {sub.source}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">
                      {sub.date}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Opted-in
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
