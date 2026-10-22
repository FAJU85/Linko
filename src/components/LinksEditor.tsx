import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Pin,
  Lock,
  Mail,
  Coffee,
  Crown,
  Music,
  Globe,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { LinkItem, LinkType } from '../types.ts';

interface LinksEditorProps {
  links: LinkItem[];
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  totalViews: number;
}

export const LinksEditor: React.FC<LinksEditorProps> = ({ links, setLinks, totalViews }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  // New Link Template State
  const [newType, setNewType] = useState<LinkType>('standard');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordHint, setNewPasswordHint] = useState('');

  // Reorder links (Move up / down)
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const updated = [...links];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Reassign orders
    const reordered = updated.map((item, idx) => ({ ...item, order: idx }));
    setLinks(reordered);
  };

  // Toggle link active status
  const handleToggleActive = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isPinned: !l.isPinned } : l))
    );
  };

  // Delete link
  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // Add Link
  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: LinkItem = {
      id: `link-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      url: newUrl.trim() || undefined,
      description: newDescription.trim() || undefined,
      isActive: true,
      isPinned: false,
      order: links.length,
      clicks: 0,
      uniqueClicks: 0,
      createdAt: new Date().toISOString(),
      ...(newType === 'password'
        ? {
            password: newPassword.trim() || 'creator2026',
            passwordHint: newPasswordHint.trim() || undefined,
          }
        : {}),
      ...(newType === 'tip_jar'
        ? {
            tipPresets: [3, 5, 10, 25],
            tipGoal: { current: 120, target: 500, label: 'Community Project Fund' },
          }
        : {}),
      ...(newType === 'subscription_tiers'
        ? {
            subscriptionTiers: [
              {
                id: `tier-${Date.now()}-1`,
                name: 'Basic Supporter',
                monthlyPrice: 5,
                yearlyPrice: 50,
                description: 'Support independent creative work.',
                perks: ['Private discord access', 'Monthly digest'],
                subscriberCount: 14,
              },
              {
                id: `tier-${Date.now()}-2`,
                name: 'VIP Collective',
                monthlyPrice: 15,
                yearlyPrice: 150,
                description: 'Exclusive templates, code bases and monthly office hours.',
                perks: ['All basic perks', 'Direct messaging', 'Private code repository'],
                subscriberCount: 8,
                highlighted: true,
              },
            ],
          }
        : {}),
    };

    setLinks((prev) => [...prev, created]);
    // Reset state & close
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setNewPassword('');
    setNewPasswordHint('');
    setNewType('standard');
    setShowAddModal(false);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setLinks((prev) =>
      prev.map((l) => (l.id === editingLink.id ? editingLink : l))
    );
    setEditingLink(null);
  };

  // Helper icon for link type
  const getTypeIcon = (type: LinkType) => {
    switch (type) {
      case 'header':
        return <span className="font-mono text-xs font-bold text-neutral-400">#</span>;
      case 'password':
        return <Lock className="w-4 h-4 text-amber-500" />;
      case 'newsletter':
        return <Mail className="w-4 h-4 text-emerald-500" />;
      case 'tip_jar':
        return <Coffee className="w-4 h-4 text-orange-500" />;
      case 'subscription_tiers':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'spotify':
        return <Music className="w-4 h-4 text-emerald-600" />;
      case 'youtube':
        return <Globe className="w-4 h-4 text-rose-500" />;
      default:
        return <Globe className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Link & Content Blocks
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize, secure, and monetize your links. Drag to reorder, protect with passwords, or embed tip jars.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Block</span>
        </button>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <Globe className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No links yet
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Add your first link, password-protected asset, or monetization block to start sharing.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-sky-600 rounded-lg"
            >
              Add First Block
            </button>
          </div>
        ) : (
          links.map((link, index) => {
            const isHeader = link.type === 'header';
            const ctrValue = totalViews > 0 ? ((link.clicks / totalViews) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={link.id}
                className={`group relative p-4 rounded-xl border transition-all ${
                  link.isActive
                    ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700'
                    : 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle & Reorder arrows */}
                  <div className="flex flex-col items-center gap-0.5 text-neutral-400 shrink-0 mt-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <GripVertical className="w-3.5 h-3.5 opacity-60" />
                    <button
                      type="button"
                      disabled={index === links.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon & Core Info */}
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 mt-0.5">
                    {getTypeIcon(link.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-md">
                        {link.title}
                      </span>

                      {link.isPinned && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}

                      {link.type === 'password' && (
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                          Passcode Protected
                        </span>
                      )}

                      {link.animation && link.animation !== 'none' && (
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> {link.animation}
                        </span>
                      )}
                    </div>

                    {link.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {link.description}
                      </p>
                    )}

                    {link.url && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{link.url}</span>
                      </div>
                    )}

                    {/* Metadata line (No Pills!) */}
                    {!isHeader && (
                      <div className="flex items-center gap-2 mt-2 text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                        <span>{link.clicks.toLocaleString()} clicks</span>
                        <span aria-hidden="true">·</span>
                        <span>{link.uniqueClicks.toLocaleString()} unique</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-sky-600 dark:text-sky-400">{ctrValue}% CTR</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Pin button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePin(link.id)}
                      title={link.isPinned ? 'Unpin' : 'Pin to Top'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        link.isPinned
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Active Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(link.id)}
                      title={link.isActive ? 'Hide Link' : 'Show Link'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        link.isActive
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {link.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingLink(link)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit Link"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Add New Content Block
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="mt-5 space-y-4">
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  Block Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'standard', label: 'Standard Link', icon: Globe },
                    { id: 'password', label: 'Passcode Lock', icon: Lock },
                    { id: 'newsletter', label: 'Newsletter Box', icon: Mail },
                    { id: 'tip_jar', label: 'Tip Jar ☕', icon: Coffee },
                    { id: 'subscription_tiers', label: 'Tiers 👑', icon: Crown },
                    { id: 'header', label: 'Section Header', icon: Plus },
                    { id: 'spotify', label: 'Spotify Track', icon: Music },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewType(t.id as LinkType)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          newType === t.id
                            ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Title or Heading
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Read my latest research essay"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* URL (for standard, password, spotify) */}
              {newType !== 'header' && newType !== 'newsletter' && newType !== 'tip_jar' && newType !== 'subscription_tiers' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/asset"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Description / Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief note or teaser about this link..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Password Specific Settings */}
              {newType === 'password' && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Passcode Protection Settings</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Access Password
                      </label>
                      <input
                        type="text"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g. vip2026"
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Hint for Followers
                      </label>
                      <input
                        type="text"
                        value={newPasswordHint}
                        onChange={(e) => setNewPasswordHint(e.target.value)}
                        placeholder="e.g. Sent in Sunday's email"
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
                >
                  Create Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Edit Block Details
              </h3>
              <button
                onClick={() => setEditingLink(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              {editingLink.type !== 'header' && editingLink.type !== 'newsletter' && editingLink.type !== 'tip_jar' && editingLink.type !== 'subscription_tiers' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={editingLink.url || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              {editingLink.type === 'password' && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Access Passcode
                    </label>
                    <input
                      type="text"
                      value={editingLink.password || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, password: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Hint
                    </label>
                    <input
                      type="text"
                      value={editingLink.passwordHint || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, passwordHint: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Animation effect selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Spotlight Animation Effect
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'pulse', label: 'Pulse' },
                    { id: 'glow', label: 'Subtle Glow' },
                    { id: 'bounce', label: 'Gentle Float' },
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      type="button"
                      onClick={() => setEditingLink({ ...editingLink, animation: anim.id as any })}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md border transition-colors cursor-pointer text-center ${
                        (editingLink.animation || 'none') === anim.id
                          ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-sky-600 hover:bg-neutral-800 dark:hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
