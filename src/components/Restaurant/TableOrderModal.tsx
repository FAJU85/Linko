import React, { useState, useMemo } from 'react';
import {
  X,
  Utensils,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Flame,
  Clock,
  Sparkles,
  CreditCard,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  MenuItem,
  TableOrder,
  TableOrderItem,
  DietaryTag,
  MenuCategory,
} from '../../types.ts';

interface TableOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  initialTable?: string;
  onPlaceOrder: (order: TableOrder) => void;
  restaurantName?: string;
}

export const TableOrderModal: React.FC<TableOrderModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  initialTable = 'Table 4',
  onPlaceOrder,
  restaurantName = 'Lumière Dining & Lounge',
}) => {
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);
  const [cart, setCart] = useState<Record<string, { item: MenuItem; quantity: number; notes: string }>>({});
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [paymentMethod, setPaymentMethod] = useState<'Dine-In Pay Later' | 'Card at Table'>('Dine-In Pay Later');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');

  // Categories
  const categories: string[] = ['All', 'Starters', 'Mains', 'Beverages', 'Desserts'];

  // Filtered menu
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.available) return false;
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (selectedDietary.length > 0) {
        const matchesAll = selectedDietary.every((tag) => item.dietary.includes(tag));
        if (!matchesAll) return false;
      }
      return true;
    });
  }, [menuItems, activeCategory, selectedDietary]);

  // Cart operations
  const updateQuantity = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const newQty = (existing?.quantity || 0) + delta;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: newQty,
          notes: existing?.notes || '',
        },
      };
    });
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCart((prev) => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: { ...prev[itemId], notes },
      };
    });
  };

  // Totals
  const subtotal = useMemo(() => {
    return Object.values(cart).reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  }, [cart]);

  const tipAmount = useMemo(() => {
    return Number(((subtotal * tipPercent) / 100).toFixed(2));
  }, [subtotal, tipPercent]);

  const totalAmount = useMemo(() => {
    return Number((subtotal + tipAmount).toFixed(2));
  }, [subtotal, tipAmount]);

  const totalItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0);
  }, [cart]);

  const toggleDietaryFilter = (tag: DietaryTag) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Submit Order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItemCount === 0) return;

    const items: TableOrderItem[] = Object.values(cart).map((entry) => ({
      menuItemId: entry.item.id,
      name: entry.item.name,
      price: entry.item.price,
      quantity: entry.quantity,
      notes: entry.notes || undefined,
    }));

    const newOrder: TableOrder = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      tableNumber: selectedTable,
      items,
      subtotal,
      tipAmount,
      totalAmount,
      status: 'Received',
      customerName: customerName || 'Dine-In Guest',
      specialInstructions: specialInstructions || undefined,
      paymentStatus: paymentMethod === 'Card at Table' ? 'settled' : 'pending',
      paymentMethod,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onPlaceOrder(newOrder);
    setSubmittedOrderId(newOrder.id);
    setOrderSubmitted(true);
  };

  const handleReset = () => {
    setCart({});
    setOrderSubmitted(false);
    setCustomerName('');
    setSpecialInstructions('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{restaurantName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {selectedTable}
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Contactless Table-Side Ordering & Kitchen Ticket System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation Screen */}
        {orderSubmitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                Order Dispatched To Kitchen!
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Ticket <strong className="text-neutral-800 dark:text-neutral-200">#{submittedOrderId}</strong> has been received at the kitchen line for <strong className="text-amber-500">{selectedTable}</strong>.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 max-w-sm mx-auto text-xs text-left space-y-1.5">
              <div className="flex justify-between text-neutral-500">
                <span>Items Ordered:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{totalItemCount} dishes</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Total Amount:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Payment:</span>
                <span className="font-semibold text-amber-500">{paymentMethod}</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Menu & Cart */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Table Selection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Dining Table:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  {Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                    <option key={tbl} value={tbl}>
                      {tbl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary quick toggles */}
              <div className="flex items-center gap-1.5">
                {(['Vegan', 'Gluten-Free', 'Halal'] as DietaryTag[]).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietaryFilter(tag)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                      selectedDietary.includes(tag)
                        ? 'bg-amber-500 text-white border-amber-500 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-750'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dishes list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((dish) => {
                const qty = cart[dish.id]?.quantity || 0;
                return (
                  <div
                    key={dish.id}
                    className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">
                          {dish.name}
                        </h4>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>

                      {dish.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dish.dietary.map((d) => (
                            <span
                              key={d}
                              className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dish.prepTimeMinutes || 10}m
                      </span>

                      {qty > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(dish, -1)}
                            className="w-6 h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-neutral-900 dark:text-white w-5 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(dish, 1)}
                            className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateQuantity(dish, 1)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Items / Cart Tray */}
            {totalItemCount > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                    Table Order Summary ({totalItemCount} items)
                  </h4>
                  <span className="text-xs font-semibold text-neutral-500">
                    Subtotal: ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {Object.values(cart).map(({ item, quantity, notes }) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 mr-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {quantity}x {item.name}
                          </span>
                          <span className="font-mono text-neutral-700 dark:text-neutral-300">
                            ${(item.price * quantity).toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                          placeholder="Dish notes (e.g. no dressing, allergy warning)..."
                          className="mt-1 w-full text-[10px] px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, -1)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, 1)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gratuity / Tip selection */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Hospitality & Kitchen Staff Gratuity
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[0, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercent(pct)}
                        className={`py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          tipPercent === pct
                            ? 'border-amber-500 bg-amber-500 text-white font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {pct === 0 ? 'No Tip' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest name & payment method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Guest Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Marcus / Table 4"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Settlement Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Dine-In Pay Later">Dine-In Pay Later (Server Cash/Card)</option>
                      <option value="Card at Table">Card Authorized at Table</option>
                    </select>
                  </div>
                </div>

                {/* Final Total Bar & Submit Button */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400">Total Due (with tip)</div>
                    <div className="text-base font-extrabold text-neutral-900 dark:text-white">
                      ${totalAmount.toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Order to Kitchen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
