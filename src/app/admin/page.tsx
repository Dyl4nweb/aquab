import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Package, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Warehouse
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Parallel data fetching for fast load
  const [
    totalOrdersCount,
    todayOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
    cancelledOrdersCount,
    allOrders,
    products,
    activeRidersCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.order.count({
      where: { status: 'PENDING' },
    }),
    prisma.order.count({
      where: { status: { in: ['DELIVERED', 'COMPLETED'] } },
    }),
    prisma.order.count({
      where: { status: { in: ['CANCELLED', 'FAILED_DELIVERY'] } },
    }),
    prisma.order.findMany({
      select: { totalAmount: true, createdAt: true, status: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, stock: true, minStockAlert: true, containerType: true },
    }),
    prisma.user.count({
      where: { role: 'RIDER', isActive: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        items: true,
        assignments: {
          include: { rider: true },
        },
      },
    }),
  ]);

  // Calculate Sales
  const validOrders = allOrders.filter(
    (o) => o.status !== 'CANCELLED' && o.status !== 'FAILED_DELIVERY'
  );
  const totalSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const todayOrders = validOrders.filter((o) => new Date(o.createdAt) >= todayStart);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);

  const kpis = [
    {
      label: "Total Sales",
      value: `₱${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: `Today: ₱${todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      label: "Total Orders",
      value: totalOrdersCount,
      subtext: `${todayOrdersCount} placed today`,
      icon: ShoppingBag,
      color: "bg-sky-50 text-sky-600 border-sky-200",
    },
    {
      label: "Pending Orders",
      value: pendingOrdersCount,
      subtext: "Needs confirmation",
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      label: "Completed Orders",
      value: completedOrdersCount,
      subtext: `${cancelledOrdersCount} cancelled`,
      icon: CheckCircle2,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      label: "Active Products",
      value: products.length,
      subtext: `${lowStockProducts.length} low in stock`,
      icon: Package,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      label: "Station Riders",
      value: activeRidersCount,
      subtext: "Available for delivery",
      icon: Truck,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Station Overview & Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time orders, revenue, inventory alerts, and rider status
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/orders"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Warehouse className="w-3.5 h-3.5 text-slate-500" />
            <span>Inventory</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${kpi.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {kpi.label}
                </span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">
                  {kpi.value}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {kpi.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Incoming Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest orders placed on storefront</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Barangay</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => {
                  const itemsCount = o.items.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-sky-700">
                        {o.orderNumber}
                      </td>
                      <td className="p-4">
                        <strong className="text-slate-900 block">{o.customerName}</strong>
                        <span className="text-[10px] text-slate-400">{o.customerPhone}</span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {o.barangayName || o.deliveryMethod}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {itemsCount} container{itemsCount === 1 ? '' : 's'}
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        ₱{o.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'DELIVERED' || o.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : o.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders?ref=${o.orderNumber}`}
                          className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Container Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Inventory Alerts</h3>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All products have sufficient stock levels!</span>
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 block">{p.name}</strong>
                      <span className="text-[10px] text-slate-500">{p.containerType}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-700 text-sm block">
                        {p.stock} left
                      </span>
                      <span className="text-[10px] text-slate-400">Min: {p.minStockAlert}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/admin/inventory"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold text-center block hover:bg-slate-50 transition-colors"
            >
              Manage Stock Levels & Intake →
            </Link>
          </div>

          {/* Quick Gallon Exchange Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-sky-600">
              <RefreshCw className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Gallon Refill Summary</h3>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Real-time balance of filled gallons dispatched versus empty containers retrieved by riders.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Filled Dispatched
                </span>
                <span className="text-lg font-black text-sky-900 mt-0.5 block">
                  {recentOrders.reduce((sum, o) => sum + o.exchangeGallonsCount, 0)} units
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  New Sold
                </span>
                <span className="text-lg font-black text-emerald-900 mt-0.5 block">
                  {recentOrders.reduce((sum, o) => sum + o.newGallonsCount, 0)} units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

