import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  DollarSign,
  TrendingUp,
  Package,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Download,
  Share2,
  Copy,
  Tag,
  Eye,
  EyeOff,
  Star,
  FileCode,
  FileText,
  Figma,
} from 'lucide-react';
import { DigitalProduct, ProductOrder, CreatorProfile } from '../../types.ts';

interface DigitalStoreTabProps {
  products: DigitalProduct[];
  setProducts: React.Dispatch<React.SetStateAction<DigitalProduct[]>>;
  orders: ProductOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ProductOrder[]>>;
  profile: CreatorProfile;
}

export const DigitalStoreTab: React.FC<DigitalStoreTabProps> = ({
  products,
  setProducts,
  orders,
  setOrders,
  profile,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'products' | 'orders'>('products');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
  );
  const [newPrice, setNewPrice] = useState(29);
  const [newPayWhatYouWant, setNewPayWhatYouWant] = useState(true);
  const [newMinPrice, setNewMinPrice] = useState(0);
  const [newFileType, setNewFileType] = useState<'pdf' | 'zip' | 'code' | 'figma' | 'notion'>('pdf');
  const [newFileSize, setNewFileSize] = useState('15 MB');
  const [newDeliverableName, setNewDeliverableName] = useState('digital_asset.pdf');
  const [newDeliverableContent, setNewDeliverableContent] = useState('Thank you for purchasing! Access your files below.');
  const [newCategory, setNewCategory] = useState('Templates & Resources');

  // Revenue metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.amountPaid, 0);
  const totalSalesCount = orders.length;
  const avgOrderValue = totalSalesCount > 0 ? (totalRevenue / totalSalesCount).toFixed(2) : '0.00';

  // Toggle publish state
  const handleTogglePublish = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isPublished: !p.isPublished } : p))
    );
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to remove this digital product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Add new product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProd: DigitalProduct = {
      id: `prod-${Date.now()}`,
      title: newTitle.trim(),
      tagline: newTagline.trim() || newTitle.trim(),
      description: newDescription.trim() || newTagline.trim(),
      coverImage: newCoverImage.trim(),
      price: Number(newPrice) || 0,
      suggestedPrice: Number(newPrice) || 0,
      minPrice: newPayWhatYouWant ? Number(newMinPrice) || 0 : Number(newPrice) || 0,
      payWhatYouWant: newPayWhatYouWant,
      currency: 'USD',
      fileType: newFileType,
      fileSize: newFileSize.trim() || '10 MB',
      deliverableName: newDeliverableName.trim() || 'product_files.zip',
      deliverableContent: newDeliverableContent.trim(),
      downloadUrl: 'https://cdn.omnilink.me/sample-download.pdf',
      licenseKeyRequired: true,
      salesCount: 0,
      rating: 5.0,
      reviewsCount: 1,
      isPublished: true,
      category: newCategory,
      tags: ['New Release', 'Digital Goods'],
      previewHighlights: ['Instant digital download', 'Lifetime product access', 'Free updates'],
    };

    setProducts((prev) => [newProd, ...prev]);
    setShowAddModal(false);

    // Reset form
    setNewTitle('');
    setNewTagline('');
    setNewDescription('');
  };

  // Copy product link
  const handleCopyProductLink = (productId: string) => {
    const url = `https://${profile.customDomain || 'omnilink.me'}/#store-${productId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(productId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Export orders to CSV
  const handleExportCsv = () => {
    const headers = ['Order ID', 'Product Title', 'Customer Email', 'Amount Paid', 'Discount Code', 'License Key', 'Date'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.productTitle.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.amountPaid.toFixed(2),
      o.discountCode || '',
      o.licenseKey || '',
      o.date,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnilink-${profile.handle}-store-orders.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Header with Gumroad style tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
              Gumroad Creator Commerce
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1.5">
            Digital Products & Store
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Sell eBooks, Figma kits, code boilerplates, and templates with pay-what-you-want pricing and instant delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-md shadow-pink-500/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Store Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last week
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Completed Orders</span>
            <ShoppingBag className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {totalSalesCount}
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block">
            Instant digital fulfillment
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            ${avgOrderValue}
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block">
            Boosted by pay-what-you-want
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Active Products</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {products.filter((p) => p.isPublished).length}
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block">
            {products.length} total in catalog
          </span>
        </div>
      </div>

      {/* Sub-view switcher: Products vs Orders */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('products')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubView === 'products'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubView === 'orders'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Orders & Customers ({orders.length})
          </button>
        </div>

        {activeSubView === 'orders' && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Products Subview */}
      {activeSubView === 'products' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Artwork */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                    {product.fileType}
                  </div>
                  {product.payWhatYouWant && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-pink-500/90 backdrop-blur-md text-[10px] font-bold text-white uppercase flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      PWYW
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span className="truncate">{product.category}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {product.payWhatYouWant ? `$${product.minPrice}+` : `$${product.price}`}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {product.tagline}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {product.rating}
                    </span>
                    <span>•</span>
                    <span>{product.salesCount} sold</span>
                    <span>•</span>
                    <span>{product.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(product.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    product.isPublished
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {product.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{product.isPublished ? 'Live' : 'Draft'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopyProductLink(product.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Copy direct product link"
                  >
                    {copiedLink === product.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Orders Subview */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Customer Email</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Promo</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">License Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900 dark:text-white">
                      {ord.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white max-w-[200px] truncate">
                      {ord.productTitle}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      {ord.customerEmail}
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">
                      ${ord.amountPaid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {ord.discountCode ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-[10px]">
                          {ord.discountCode}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                      {ord.date}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-500">
                      {ord.licenseKey ? ord.licenseKey.slice(0, 16) + '...' : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Create New Digital Product
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The 2026 Systems Architecture Playbook"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tagline / Short Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. 120+ pages on edge workers, event architecture & caching"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    File Type
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e: any) => setNewFileType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="pdf">eBook / PDF</option>
                    <option value="figma">Figma File (.fig)</option>
                    <option value="zip">Source Code (.zip)</option>
                    <option value="notion">Notion / Consulting Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    File Size Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18.4 MB"
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Pricing & Pay What You Want */}
              <div className="p-3.5 rounded-xl border border-pink-200 dark:border-pink-900/50 bg-pink-50/40 dark:bg-pink-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      Pay What You Want (Gumroad Style)
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Let buyers pay any fair price at or above a minimum floor.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newPayWhatYouWant}
                    onChange={(e) => setNewPayWhatYouWant(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      {newPayWhatYouWant ? 'Suggested Price ($)' : 'Fixed Price ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    />
                  </div>

                  {newPayWhatYouWant && (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Minimum Floor ($0 for free)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newMinPrice}
                        onChange={(e) => setNewMinPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Cover Image Artwork URL
                </label>
                <input
                  type="url"
                  value={newCoverImage}
                  onChange={(e) => setNewCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              {/* Deliverable info */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Deliverable Filename
                </label>
                <input
                  type="text"
                  value={newDeliverableName}
                  onChange={(e) => setNewDeliverableName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Customer Receipt & Instructions
                </label>
                <textarea
                  rows={2}
                  value={newDeliverableContent}
                  onChange={(e) => setNewDeliverableContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white rounded-lg bg-pink-600 hover:bg-pink-500 cursor-pointer shadow-sm"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
