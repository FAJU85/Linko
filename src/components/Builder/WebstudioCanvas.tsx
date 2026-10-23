import React, { useState } from 'react';
import {
  Layers,
  Plus,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Trash2,
  Sliders,
  Utensils,
  ShoppingBag,
  QrCode,
  Link2,
  Mail,
  Heart,
  Heading,
  Sparkles,
  ExternalLink,
  Crown,
  Music,
  Video,
} from 'lucide-react';
import {
  CanvasBlock,
  CanvasBlockType,
  CanvasBlockStyling,
  MenuItem,
  DigitalProduct,
} from '../../types.ts';

interface WebstudioCanvasProps {
  blocks: CanvasBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CanvasBlock[]>>;
  menuItems: MenuItem[];
  products: DigitalProduct[];
  onOpenStoreModal?: (product: DigitalProduct) => void;
  onOpenTableOrderModal?: () => void;
}

const BLOCK_ICONS: Record<CanvasBlockType, React.ElementType> = {
  link: Link2,
  header: Heading,
  menu_category: Utensils,
  menu_item: Utensils,
  product: ShoppingBag,
  qr_card: QrCode,
  newsletter: Mail,
  tip_jar: Heart,
  subscription_tiers: Crown,
  spotify: Music,
  video: Video,
  socials: Sparkles,
  divider: Layers,
};

export const WebstudioCanvas: React.FC<WebstudioCanvasProps> = ({
  blocks,
  setBlocks,
  menuItems,
  products,
  onOpenStoreModal,
  onOpenTableOrderModal,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id || null);
  const [showAddBlock, setShowAddBlock] = useState(false);

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    setBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  // Toggle visibility
  const handleToggleVisible = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b))
    );
  };

  // Delete block
  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  // Add block
  const handleAddBlock = (type: CanvasBlockType) => {
    const defaultTitles: Record<CanvasBlockType, string> = {
      link: 'New Custom Link',
      header: 'Section Header',
      menu_category: 'Chef Tasting Menu',
      menu_item: 'Featured Signature Dish',
      product: 'Digital Product Download',
      qr_card: 'Table-Side QR Code',
      newsletter: 'VIP Newsletter Club',
      tip_jar: 'Staff Gratuity Fund',
      subscription_tiers: 'VIP Membership Tiers',
      spotify: 'Podcast & Music Embed',
      video: 'Featured Video Stream',
      socials: 'Social Network Channels',
      divider: 'Separator Line',
    };

    const newBlock: CanvasBlock = {
      id: `blk-${Date.now().toString().slice(-4)}`,
      type,
      title: defaultTitles[type] || 'New Block',
      visible: true,
      order: blocks.length + 1,
      data: type === 'qr_card' ? { tableNumber: 'Table 4', frameText: 'SCAN TO ORDER' } : {},
      styling: {
        cardStyle: 'solid',
        cardRadius: 'xl',
        padding: 'normal',
      },
    };

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setShowAddBlock(false);
  };

  // Update selected block styling
  const updateBlockStyling = (patch: Partial<CanvasBlockStyling>) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlockId
          ? {
              ...b,
              styling: { ...(b.styling || {}), ...patch },
            }
          : b
      )
    );
  };

  // Update selected block title/subtitle
  const updateBlockContent = (title: string, subtitle?: string) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlockId ? { ...b, title, subtitle } : b
      )
    );
  };

  // Update selected block custom data payload
  const updateBlockData = (patch: Record<string, any>) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlockId
          ? {
              ...b,
              data: { ...(b.data || {}), ...patch },
            }
          : b
      )
    );
  };

  // Update selected block callout badge (Linktree Pro parity)
  const updateBlockBadge = (badge: string) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlockId ? { ...b, badge: badge.trim() || undefined } : b
      )
    );
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Visual Canvas & Node Tree</h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400 max-w-xl">
            Fine-grained component canvas inspired by Webstudio. Compose and inspect hierarchical blocks: links, table QR cards, restaurant dishes, and Gumroad storefront items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddBlock(!showAddBlock)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Block to Canvas</span>
        </button>
      </div>

      {/* Add Block Palette */}
      {showAddBlock && (
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md space-y-3">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Select Block Primitive
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { type: 'link', label: 'Custom Link', desc: 'Outbound URL / portfolio link' },
              { type: 'qr_card', label: 'Table QR Code', desc: 'Scan to order vector card' },
              { type: 'menu_category', label: 'Restaurant Menu', desc: 'Dine-in menu category' },
              { type: 'menu_item', label: 'Featured Dish', desc: 'Individual dish order card' },
              { type: 'product', label: 'Gumroad Product', desc: 'Digital store download card' },
              { type: 'newsletter', label: 'Newsletter', desc: 'Subscriber email capture' },
              { type: 'tip_jar', label: 'Tip Jar / Gratuity', desc: 'Staff fund contribution' },
              { type: 'subscription_tiers', label: 'Membership Tiers', desc: 'Monthly / yearly patron club' },
              { type: 'spotify', label: 'Audio / Spotify', desc: 'Podcast & episode player' },
              { type: 'video', label: 'Video Embed', desc: 'YouTube or Vimeo media player' },
              { type: 'socials', label: 'Social Icons', desc: 'Social profile badges' },
              { type: 'header', label: 'Text / Heading', desc: 'Title banner and intro' },
              { type: 'divider', label: 'Divider Line', desc: 'Visual section breaker' },
            ].map((item) => {
              const Icon = BLOCK_ICONS[item.type as CanvasBlockType] || Layers;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleAddBlock(item.type as CanvasBlockType)}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-left transition-all cursor-pointer group"
                >
                  <Icon className="w-4 h-4 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">{item.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Component Tree & Canvas Blocks (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-1">
            <span>Canvas Blocks ({blocks.length})</span>
            <span>Drag / Reorder Sequence</span>
          </div>

          <div className="space-y-2.5">
            {blocks.map((block, idx) => {
              const Icon = BLOCK_ICONS[block.type] || Layers;
              const isSelected = selectedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/60 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  } ${!block.visible ? 'opacity-50' : ''}`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-amber-500 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {block.title}
                        </span>
                        {block.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 shrink-0">
                            {block.badge}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase">
                          {block.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                        {block.subtitle && (
                          <p className="truncate max-w-[140px]">
                            {block.subtitle}
                          </p>
                        )}
                        <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                          {block.clicks || 0} clicks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(block.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                    >
                      {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Block Style & Property Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          {selectedBlock ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  Inspector: {selectedBlock.type}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">#{selectedBlock.id}</span>
              </div>

              {/* Block Click Analytics (Linktree Pro Parity) */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">Live Block Performance</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Total Clicks</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {selectedBlock.clicks || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Unique Visitors</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {selectedBlock.uniqueClicks || Math.round((selectedBlock.clicks || 0) * 0.82)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title, Subtitle & Badge Callout */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Block Title</label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => updateBlockContent(e.target.value, selectedBlock.subtitle)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Subtitle / Note</label>
                  <input
                    type="text"
                    value={selectedBlock.subtitle || ''}
                    onChange={(e) => updateBlockContent(selectedBlock.title, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Callout Badge (e.g. "HOT 🔥", "NEW", "VIP")</label>
                  <input
                    type="text"
                    value={selectedBlock.badge || ''}
                    onChange={(e) => updateBlockBadge(e.target.value)}
                    placeholder="e.g. HOT 🔥"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* CSS Styling Primitives (Webstudio Style) */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  CSS Card Style
                </h4>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Card Variant</label>
                  <div className="grid grid-cols-5 gap-1.5 text-xs">
                    {(['solid', 'glass', 'outline', 'shadow', 'glow'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateBlockStyling({ cardStyle: style })}
                        className={`py-1.5 rounded-lg border capitalize text-center text-[10px] transition-colors cursor-pointer ${
                          selectedBlock.styling?.cardStyle === style
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Border Radius</label>
                  <div className="grid grid-cols-5 gap-1.5 text-xs">
                    {(['none', 'sm', 'md', 'xl', 'full'] as const).map((rad) => (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => updateBlockStyling({ cardRadius: rad })}
                        className={`py-1 rounded-lg border uppercase text-center text-[10px] transition-colors cursor-pointer ${
                          selectedBlock.styling?.cardRadius === rad
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {rad}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Internal Padding</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['compact', 'normal', 'relaxed'] as const).map((pad) => (
                      <button
                        key={pad}
                        type="button"
                        onClick={() => updateBlockStyling({ padding: pad })}
                        className={`py-1 rounded-lg border capitalize text-center text-[10px] transition-colors cursor-pointer ${
                          selectedBlock.styling?.padding === pad
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Custom Background (Carrd-style)</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: 'Default', val: undefined },
                      { label: 'Dark', val: '#121214' },
                      { label: 'Amber', val: '#291b00' },
                      { label: 'Slate', val: '#0f172a' },
                      { label: 'Crimson', val: '#2a0808' },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateBlockStyling({ bgOverride: p.val })}
                        className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
                          selectedBlock.styling?.bgOverride === p.val
                            ? 'border-amber-500 font-bold text-amber-500 bg-amber-500/10'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={selectedBlock.styling?.bgOverride || '#1a1a24'}
                      onChange={(e) => updateBlockStyling({ bgOverride: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                      title="Custom Hex Color"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Motion & Animation</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['none', 'pulse', 'bounce'] as const).map((anim) => (
                      <button
                        key={anim}
                        type="button"
                        onClick={() => updateBlockStyling({ animation: anim })}
                        className={`py-1 rounded-lg border capitalize text-center text-[10px] transition-colors cursor-pointer ${
                          (selectedBlock.styling?.animation || 'none') === anim
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Block-Specific Data Parameters */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Block Parameters
                </h4>

                {selectedBlock.type === 'qr_card' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Assigned Table</label>
                      <input
                        type="text"
                        value={selectedBlock.data?.tableNumber || 'Table 4'}
                        onChange={(e) => updateBlockData({ tableNumber: e.target.value })}
                        placeholder="e.g. Table 4"
                        className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Frame Call-to-Action</label>
                      <input
                        type="text"
                        value={selectedBlock.data?.frameText || 'SCAN TO ORDER'}
                        onChange={(e) => updateBlockData({ frameText: e.target.value })}
                        placeholder="e.g. SCAN TO ORDER"
                        className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {selectedBlock.type === 'menu_category' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Target Menu Category</label>
                    <select
                      value={selectedBlock.data?.category || 'Mains'}
                      onChange={(e) => updateBlockData({ category: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      <option value="All">All Categories</option>
                      <option value="Starters">Starters</option>
                      <option value="Mains">Mains</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                )}

                {selectedBlock.type === 'menu_item' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Select Featured Dish</label>
                    <select
                      value={selectedBlock.data?.menuItemId || menuItems[0]?.id}
                      onChange={(e) => updateBlockData({ menuItemId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      {menuItems.map((dish) => (
                        <option key={dish.id} value={dish.id}>
                          {dish.name} (${dish.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedBlock.type === 'product' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Select Gumroad Product</label>
                    <select
                      value={selectedBlock.data?.productId || products[0]?.id}
                      onChange={(e) => updateBlockData({ productId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.title} (${prod.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedBlock.type === 'link' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Destination URL</label>
                    <input
                      type="url"
                      value={selectedBlock.data?.url || ''}
                      onChange={(e) => updateBlockData({ url: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                )}

                {selectedBlock.type === 'tip_jar' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Fundraising Target Goal ($)</label>
                    <input
                      type="number"
                      value={selectedBlock.data?.target || 500}
                      onChange={(e) => updateBlockData({ target: Number(e.target.value) })}
                      placeholder="500"
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                )}

                {selectedBlock.type === 'spotify' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Spotify URL</label>
                    <input
                      type="url"
                      value={selectedBlock.data?.url || ''}
                      onChange={(e) => updateBlockData({ url: e.target.value })}
                      placeholder="https://open.spotify.com/episode/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                )}

                {selectedBlock.type === 'video' && (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] text-neutral-400 mb-1">Video Stream URL (YouTube / Vimeo / MP4)</label>
                    <input
                      type="url"
                      value={selectedBlock.data?.url || ''}
                      onChange={(e) => updateBlockData({ url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Quick Actions based on type */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {selectedBlock.type === 'qr_card' && (
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs space-y-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">Live QR Vector Primitive</span>
                    <p className="text-[11px] text-neutral-400">
                      Renders live vector QR code directly into public profile with table parameter.
                    </p>
                  </div>
                )}
                {selectedBlock.type === 'menu_category' && (
                  <button
                    type="button"
                    onClick={onOpenTableOrderModal}
                    className="w-full py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Test Table Menu Order</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <Layers className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">Select a block on the left to inspect and style.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
