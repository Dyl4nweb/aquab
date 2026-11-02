import React from 'react';
import { prisma } from '@/lib/prisma';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Truck, 
  Package, 
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminReportsPage() {
  const [orders, orderItems, products, riders] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        assignments: {
          include: { rider: true },
        },
      },
    }),
    prisma.orderItem.findMany(),
    prisma.product.findMany({
      include: { category: true },
    }),
    prisma.user.findMany({
      where: { role: 'RIDER' },
      include: {
        assignments: {
          where: { status: 'DELIVERED' },
        },
      },
    }),
  ]);

  // Aggregate Sales
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'FAILED_DELIVERY');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Time-based calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRevenue = validOrders
    .filter((o) => new Date(o.createdAt) >= todayStart)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const weekRevenue = validOrders
    .filter((o) => new Date(o.createdAt) >= weekStart)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const monthRevenue = validOrders
    .filter((o) => new Date(o.createdAt) >= monthStart)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Most ordered products aggregation
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const item of orderItems) {
    if (!productSalesMap[item.productName]) {
      productSalesMap[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
    }
    productSalesMap[item.productName].quantity += item.quantity;
    productSalesMap[item.productName].revenue += item.subtotal;
  }
  const topProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

  // Delivery performance
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'FAILED_DELIVERY').length;
  const deliverySuccessRate = orders.length > 0 ? ((deliveredCount / orders.length) * 100).toFixed(1) : '100';

  // Gallon exchange
  const totalRefills = orders.reduce((sum, o) => sum + o.exchangeGallonsCount, 0);
  const totalNewGallons = orders.reduce((sum, o) => sum + o.newGallonsCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Station Reports & Sales Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive business performance, product sales ranking, and delivery metrics
        </p>
      </div>

      {/* Revenue Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            ₱{todayRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Live station intake</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">7-Day Sales</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            ₱{weekRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Past 7 days volume</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Sales</span>
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            ₱{monthRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Current calendar month</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-900 block">
            ₱{totalRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">All-time revenue</span>
        </div>
      </div>

      {/* Two Column Grid: Top Selling Products & Delivery Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Most Ordered Products */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">Product Sales Ranking</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">By units sold</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Water Product</th>
                  <th className="p-3 text-right">Units Sold</th>
                  <th className="p-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-right font-black text-slate-800">
                      {p.quantity} units
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700">
                      ₱{p.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Performance & Rider Leaderboard */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Fulfillment Stats */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">Fulfillment Performance</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Delivered / Done
                </span>
                <span className="text-2xl font-black text-emerald-700 block mt-1">
                  {deliveredCount}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                  {deliverySuccessRate}% success rate
                </span>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Cancelled / Failed
                </span>
                <span className="text-2xl font-black text-rose-700 block mt-1">
                  {cancelledCount}
                </span>
                <span className="text-[10px] text-rose-500 font-bold mt-0.5 block">
                  {orders.length > 0 ? ((cancelledCount / orders.length) * 100).toFixed(1) : 0}% cancelled
                </span>
              </div>
            </div>

            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <span className="font-bold text-sky-900 block">Gallon Circularity Rate</span>
              <div className="flex justify-between text-slate-600">
                <span>Refills (Empty Collected):</span>
                <strong className="text-slate-900">{totalRefills} gallons</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>New Containers Sold:</span>
                <strong className="text-slate-900">{totalNewGallons} gallons</strong>
              </div>
            </div>
          </div>

          {/* Rider Activity Leaderboard */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rider Delivery Completed Leaderboard
            </h3>
            <div className="space-y-2">
              {riders.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs border border-slate-100"
                >
                  <div>
                    <strong className="text-slate-900 block">{r.name}</strong>
                    <span className="text-[10px] text-slate-400">{r.phone || 'Station Rider'}</span>
                  </div>
                  <span className="font-black text-sky-700 text-sm">
                    {r.assignments.length} delivered
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

