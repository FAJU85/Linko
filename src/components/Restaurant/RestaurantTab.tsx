import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  DollarSign,
  ChefHat,
  Filter,
  Eye,
  Check,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  MenuItem,
  TableOrder,
  TableOrderStatus,
  DietaryTag,
  MenuCategory,
} from '../../types.ts';
import { TableOrderModal } from './TableOrderModal.tsx';

interface RestaurantTabProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  tableOrders: TableOrder[];
  setTableOrders: React.Dispatch<React.SetStateAction<TableOrder[]>>;
  onOpenQRStudioWithTable?: (tableName: string) => void;
  restaurantName?: string;
}

export const RestaurantTab: React.FC<RestaurantTabProps> = ({
  menuItems,
  setMenuItems,
  tableOrders,
  setTableOrders,
  onOpenQRStudioWithTable,
  restaurantName = 'Lumière Dining & Lounge',
}) => {
  const [activeSection, setActiveSection] = useState<'kot' | 'menu' | 'tables'>('kot');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showOrderSimulator, setShowOrderSimulator] = useState(false);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState('Table 4');

  // New Dish Modal / State
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(18.0);
  const [dishCategory, setDishCategory] = useState<MenuCategory>('Mains');
  const [dishPrepTime, setDishPrepTime] = useState<number>(12);
  const [dishDietary, setDishDietary] = useState<DietaryTag[]>([]);

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, nextStatus: TableOrderStatus) => {
    setTableOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              paymentStatus: nextStatus === 'Paid' ? 'settled' : o.paymentStatus,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : o
      )
    );
  };

  // Toggle dish availability (86'd)
  const toggleDishAvailability = (dishId: string) => {
    setMenuItems((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, available: !d.available } : d))
    );
  };

  // Delete dish
  const handleDeleteDish = (dishId: string) => {
    setMenuItems((prev) => prev.filter((d) => d.id !== dishId));
  };

  // Add new dish
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const newDish: MenuItem = {
      id: `dish-${Date.now().toString().slice(-4)}`,
      name: dishName.trim(),
      description: dishDesc.trim(),
      price: Number(dishPrice) || 15.0,
      category: dishCategory,
      dietary: dishDietary,
      available: true,
      prepTimeMinutes: Number(dishPrepTime) || 10,
      orderCount: 0,
    };

    setMenuItems((prev) => [newDish, ...prev]);
    setDishName('');
    setDishDesc('');
    setDishPrice(18.0);
    setDishDietary([]);
    setShowAddDish(false);
  };

  // Stats calculation
  const totalRevenue = tableOrders
    .filter((o) => o.status === 'Paid' || o.paymentStatus === 'settled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = tableOrders.filter((o) => o.status === 'Received' || o.status === 'Preparing');

  const filteredOrders = tableOrders.filter((o) => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
              <ChefHat className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Restaurant Kitchen & Table System</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage live dine-in table tickets, digital menu catalog, and table QR code dispatches.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowOrderSimulator(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Simulate Table Order</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Active Kitchen Tickets</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">{activeOrders.length}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Orders in queue</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Total Table Orders</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{tableOrders.length}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Dine-in recorded</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Total Dine-In Revenue</div>
          <div className="text-2xl font-bold text-emerald-500 mt-1">${totalRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Settled table tickets</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Menu Catalog Size</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{menuItems.length}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Dishes and drinks</div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('kot')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === 'kot'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Kitchen Ticket Board (KOT)</span>
          {activeOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('menu')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === 'menu'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Menu Catalog ({menuItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('tables')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === 'tables'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Table QR Tent Cards</span>
        </button>
      </div>

      {/* SECTION 1: Kitchen Order Ticket Board */}
      {activeSection === 'kot' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-neutral-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {['All', 'Received', 'Preparing', 'Served', 'Paid'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowOrderSimulator(true)}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Customer Order</span>
            </button>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <ChefHat className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  No orders match this status
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Place a simulated table order to see live tickets update in the kitchen line.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isUrgent = order.status === 'Received';
                return (
                  <div
                    key={order.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isUrgent
                        ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/50'
                        : order.status === 'Paid'
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850/40 opacity-80'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Ticket Header */}
                      <div className="flex items-start justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                              {order.tableNumber}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              #{order.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {order.customerName} • {order.createdAt}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'Received'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : order.status === 'Preparing'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : order.status === 'Served'
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Line Items */}
                      <div className="py-3 space-y-2 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-white">
                                {item.quantity}x {item.name}
                              </div>
                              {item.notes && (
                                <div className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                                  "{item.notes}"
                                </div>
                              )}
                            </div>
                            <span className="font-mono text-neutral-600 dark:text-neutral-300">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.specialInstructions && (
                        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300">
                          <strong>Note:</strong> {order.specialInstructions}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Total with tip:</span>
                        <span className="font-extrabold text-neutral-900 dark:text-white">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {order.status === 'Received' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                            className="col-span-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer text-center"
                          >
                            Mark Preparing ➔
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Served')}
                            className="col-span-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors cursor-pointer text-center"
                          >
                            Mark Served ➔
                          </button>
                        )}
                        {order.status === 'Served' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Paid')}
                            className="col-span-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer text-center"
                          >
                            Settle & Mark Paid ✓
                          </button>
                        )}
                        {order.status === 'Paid' && (
                          <div className="col-span-3 py-1 text-center text-[10px] text-emerald-500 font-semibold flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" />
                            Completed & Settled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: Menu Catalog Management */}
      {activeSection === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Restaurant Menu Items & Availability
            </h3>
            <button
              type="button"
              onClick={() => setShowAddDish(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dish / Beverage</span>
            </button>
          </div>

          {/* Add Dish Form Modal / Inset */}
          {showAddDish && (
            <form
              onSubmit={handleCreateDish}
              className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">New Menu Item</h4>
                <button
                  type="button"
                  onClick={() => setShowAddDish(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g. A5 Wagyu Tenderloin"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder="Ingredients, culinary technique, provenance..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white cursor-pointer"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={dishPrepTime}
                    onChange={(e) => setDishPrepTime(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save to Menu
                </button>
              </div>
            </form>
          )}

          {/* Dishes Table */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {menuItems.map((dish) => (
                <div key={dish.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">{dish.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {dish.category}
                      </span>
                      {!dish.available && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500">
                          86'd (Sold Out)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {dish.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                      ${dish.price.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleDishAvailability(dish.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        dish.available
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                      }`}
                    >
                      {dish.available ? 'In Stock' : '86’d'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDish(dish.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Table QR Tent Cards */}
      {activeSection === 'tables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Dine-In Table QR Tent Cards
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Each table code encodes a direct table parameter. When scanned, patrons are seated directly at that table.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const tblName = `Table ${num}`;
              const activeCount = tableOrders.filter((o) => o.tableNumber === tblName && o.status !== 'Paid').length;
              return (
                <div
                  key={num}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{tblName}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">?table={num}</p>
                    </div>
                    {activeCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500">
                        {activeCount} active order
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="my-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 flex items-center justify-center">
                    <img
                      src={`/api/qr?url=${encodeURIComponent(`https://omnilink.me/lumiere?table=${num}`)}&format=svg&width=160&frame=scan-me-bottom&frameText=${encodeURIComponent(`TABLE #${num}`)}`}
                      alt={tblName}
                      className="w-32 h-auto drop-shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTableForOrder(tblName);
                        setShowOrderSimulator(true);
                      }}
                      className="py-1.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium text-center cursor-pointer"
                    >
                      Test Order
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQRStudioWithTable?.(tblName)}
                      className="py-1.5 px-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-center cursor-pointer hover:opacity-90"
                    >
                      Open in Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      <TableOrderModal
        isOpen={showOrderSimulator}
        onClose={() => setShowOrderSimulator(false)}
        menuItems={menuItems}
        initialTable={selectedTableForOrder}
        restaurantName={restaurantName}
        onPlaceOrder={(order) => {
          setTableOrders((prev) => [order, ...prev]);
        }}
      />
    </div>
  );
};
