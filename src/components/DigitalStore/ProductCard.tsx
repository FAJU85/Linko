import React, { useState } from 'react';
import {
  Star,
  Download,
  Sparkles,
  ShoppingBag,
  FileCode,
  FileText,
  Figma,
  Headphones,
  FolderArchive,
  Calendar,
} from 'lucide-react';
import { DigitalProduct, CreatorProfile, ProductOrder } from '../../types.ts';
import { GumroadCheckoutModal } from './GumroadCheckoutModal.tsx';

interface ProductCardProps {
  product: DigitalProduct;
  profile: CreatorProfile;
  onOrderCompleted?: (order: ProductOrder) => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  profile,
  onOrderCompleted,
  compact = false,
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Helper for file type icon
  const renderFileIcon = () => {
    switch (product.fileType) {
      case 'figma':
        return <Figma className="w-3.5 h-3.5 text-purple-500" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-rose-500" />;
      case 'code':
        return <FileCode className="w-3.5 h-3.5 text-emerald-500" />;
      case 'audio':
        return <Headphones className="w-3.5 h-3.5 text-amber-500" />;
      case 'notion':
        return <Calendar className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <FolderArchive className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const formattedPrice = product.payWhatYouWant
    ? product.minPrice === 0
      ? '$0+ (Pay what you want)'
      : `$${product.minPrice}+ (Pay what you want)`
    : `$${product.price}`;

  return (
    <>
      <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col text-left">
        {/* Product Cover Artwork */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={product.coverImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Category Chip */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white">
            {renderFileIcon()}
            <span>{product.category}</span>
          </div>

          {/* Pay-what-you-want badge */}
          {product.payWhatYouWant && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              PWYW
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Rating & Sales header */}
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating}</span>
                <span className="text-neutral-400 font-normal">({product.reviewsCount})</span>
              </div>
              <span>{product.salesCount} sold</span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug line-clamp-1">
              {product.title}
            </h3>

            {/* Tagline / Description */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
              {product.tagline || product.description}
            </p>

            {/* Highlights preview */}
            {!compact && product.previewHighlights && product.previewHighlights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                {product.previewHighlights.slice(0, 2).map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                    <span className="text-pink-500 font-bold">•</span>
                    <span className="truncate">{highlight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price & Action Row */}
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-medium">Price</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                {formattedPrice}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{product.payWhatYouWant && product.minPrice === 0 ? 'Get Free' : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gumroad Checkout Modal */}
      <GumroadCheckoutModal
        product={product}
        profile={profile}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={(order) => {
          if (onOrderCompleted) onOrderCompleted(order);
        }}
      />
    </>
  );
};
