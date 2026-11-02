'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Truck, 
  DollarSign,
  FileText,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  Star
} from 'lucide-react';

interface ClientOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
  barangayName: string;
  landmarkOrNotes?: string;
  items: {
    id: string;
    productName: string;
    waterType: string;
    containerType: string;
    isExchange: boolean;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  riderName: string | null;
  deliveryNotes: string | null;
}

interface ClientRecord {
  id?: string | null;
  phone: string;
  name: string;
  address?: string;
  deliveryAddress: string;
  barangayId?: string | null;
  barangayName: string;
  notes?: string;
  isSuki?: boolean;
  creditLimit?: number;
  totalOrdersCount: number;
  totalSpent: number;
  totalPaid: number;
  unpaidBalance: number;
  unpaidOrdersCount: number;
  lastOrderDate: string;
  orders: ClientOrder[];
}

interface ClientsClientProps {
  initialClients: ClientRecord[];
  barangays: { id: string; name: string; deliveryFee: number }[];
  isSuperAdmin: boolean;
}

export function ClientsClient({ initialClients, barangays, isSuperAdmin }: ClientsClientProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unpaid' | 'suki' | 'paid'>('all');
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Add / Edit Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBarangayId, setFormBarangayId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsSuki, setFormIsSuki] = useState(false);
  const [formCreditLimit, setFormCreditLimit] = useState('1000');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Statistics
  const stats = useMemo(() => {
    let totalUnpaidAmount = 0;
    let unpaidClientsCount = 0;
    let sukiClientsCount = 0;

    clients.forEach((c) => {
      if (c.unpaidBalance > 0) {
        totalUnpaidAmount += c.unpaidBalance;
        unpaidClientsCount += 1;
      }
      if (c.isSuki) {
        sukiClientsCount += 1;
      }
    });

    return {
      totalClients: clients.length,
      unpaidClientsCount,
      sukiClientsCount,
      paidClientsCount: clients.length - unpaidClientsCount,
      totalUnpaidAmount,
    };
  }, [clients]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (filterTab === 'unpaid' && c.unpaidBalance <= 0) return false;
      if (filterTab === 'paid' && c.unpaidBalance > 0) return false;
      if (filterTab === 'suki' && !c.isSuki) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchBarangay = c.barangayName?.toLowerCase().includes(q);
        const matchAddress = (c.address || c.deliveryAddress)?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchBarangay && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [clients, filterTab, search]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode('add');
    setSelectedClient(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormBarangayId(barangays[0]?.id || '');
    setFormNotes('');
    setFormIsSuki(false);
    setFormCreditLimit('1000');
    setFormError('');
  };

  // Open Edit Modal
  const openEditModal = (client: ClientRecord) => {
    setModalMode('edit');
    setSelectedClient(client);
    setFormName(client.name || '');
    setFormPhone(client.phone || '');
    setFormAddress(client.address || client.deliveryAddress || '');
    const foundBg = barangays.find((b) => b.name === client.barangayName);
    setFormBarangayId(client.barangayId || foundBg?.id || barangays[0]?.id || '');
    setFormNotes(client.notes || '');
    setFormIsSuki(Boolean(client.isSuki));
    setFormCreditLimit(String(client.creditLimit || 1000));
    setFormError('');
  };

  // Handle Save (Add or Edit)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const bgObj = barangays.find((b) => b.id === formBarangayId);
    const bgName = bgObj ? bgObj.name : 'Pangapisan North';

    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
            address: formAddress,
            barangayId: formBarangayId,
            barangayName: bgName,
            notes: formNotes,
            isSuki: formIsSuki,
            creditLimit: parseFloat(formCreditLimit) || 1000,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const newClient: ClientRecord = {
          id: data.customer.id,
          name: data.customer.name,
          phone: data.customer.phone,
          address: data.customer.address,
          deliveryAddress: data.customer.address,
          barangayId: data.customer.barangayId,
          barangayName: data.customer.barangayName,
          notes: data.customer.notes,
          isSuki: data.customer.isSuki,
          creditLimit: data.customer.creditLimit,
          totalOrdersCount: 0,
          totalSpent: 0,
          totalPaid: 0,
          unpaidBalance: 0,
          unpaidOrdersCount: 0,
          lastOrderDate: new Date().toISOString(),
          orders: [],
        };

        setClients((prev) => [newClient, ...prev]);
        setModalMode(null);
      } else if (modalMode === 'edit' && selectedClient) {
        // If client has no database ID yet (was historical only from orders), use POST to upsert
        if (!selectedClient.id) {
          const res = await fetch('/api/admin/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formName,
              phone: formPhone,
              address: formAddress,
              barangayId: formBarangayId,
              barangayName: bgName,
              notes: formNotes,
              isSuki: formIsSuki,
              creditLimit: parseFloat(formCreditLimit) || 1000,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setClients((prev) =>
            prev.map((c) =>
              c.phone === selectedClient.phone
                ? {
                    ...c,
                    id: data.customer.id,
                    name: formName,
                    phone: formPhone,
                    address: formAddress,
                    deliveryAddress: formAddress,
                    barangayName: bgName,
                    notes: formNotes,
                    isSuki: formIsSuki,
                    creditLimit: parseFloat(formCreditLimit) || 1000,
                  }
                : c
            )
          );
        } else {
          // Standard PATCH
          const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formName,
              phone: formPhone,
              address: formAddress,
              barangayId: formBarangayId,
              barangayName: bgName,
              notes: formNotes,
              isSuki: formIsSuki,
              creditLimit: parseFloat(formCreditLimit) || 1000,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setClients((prev) =>
            prev.map((c) =>
              c.id === selectedClient.id
                ? {
                    ...c,
                    name: formName,
                    phone: formPhone,
                    address: formAddress,
                    deliveryAddress: formAddress,
                    barangayName: bgName,
                    notes: formNotes,
                    isSuki: formIsSuki,
                    creditLimit: parseFloat(formCreditLimit) || 1000,
                  }
                : c
            )
          );
        }

        setModalMode(null);
      }
    } catch (err: any) {
      setFormError(err.message || 'May error sa pag-save.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete Client
  const handleDeleteClient = async (client: ClientRecord) => {
    if (!confirm(`Sigurado ka bang nais mong tanggalin ang kliyenteng si "${client.name}" (${client.phone})?`)) {
      return;
    }

    try {
      if (client.id) {
        const res = await fetch(`/api/admin/clients/${client.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete');
      }

      setClients((prev) => prev.filter((c) => c.phone !== client.phone));
    } catch (err: any) {
      alert('Hindi matanggal ang kliyente: ' + err.message);
    }
  };

  // Handle Mark Order as Paid
  const handleMarkAsPaid = async (clientPhone: string, orderId: string) => {
    if (!confirm('Sigurado ka bang nais mong markahang BAYAD NA ang order na ito?')) {
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID' }),
      });

      if (!res.ok) throw new Error('Failed to update');

      setClients((prevClients) =>
        prevClients.map((client) => {
          if (client.phone !== clientPhone) return client;

          let newUnpaidBalance = 0;
          let newUnpaidOrdersCount = 0;
          let newTotalPaid = 0;

          const updatedOrders = client.orders.map((order) => {
            if (order.id === orderId) {
              return { ...order, paymentStatus: 'PAID' };
            }
            return order;
          });

          updatedOrders.forEach((o) => {
            if (o.status !== 'CANCELLED') {
              if (o.paymentStatus === 'PAID') {
                newTotalPaid += o.totalAmount;
              } else {
                newUnpaidBalance += o.totalAmount;
                newUnpaidOrdersCount += 1;
              }
            }
          });

          return {
            ...client,
            orders: updatedOrders,
            unpaidBalance: newUnpaidBalance,
            unpaidOrdersCount: newUnpaidOrdersCount,
            totalPaid: newTotalPaid,
          };
        })
      );
    } catch (err: any) {
      alert('May aberya sa pag-update ng order.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Copy Statement / Proof of Balance
  const handleCopyProof = (client: ClientRecord) => {
    const today = new Date().toLocaleDateString('fil-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const unpaidOrders = client.orders.filter(
      (o) => o.paymentStatus !== 'PAID' && o.status !== 'CANCELLED'
    );

    let text = `======================================\n`;
    text += `AQUA B WATER STATION — KATIBAYAN NG UTANG\n`;
    text += `Pangapisan, Lingayen, Pangasinan\n`;
    text += `Petsa: ${today}\n`;
    text += `======================================\n`;
    text += `Kliyente : ${client.name}\n`;
    text += `Telepono : ${client.phone}\n`;
    text += `Barangay : ${client.barangayName}\n`;
    text += `Address  : ${client.address || client.deliveryAddress}\n`;
    if (client.isSuki) text += `Klasipikasyon: SUKI CLIENT\n`;
    text += `\n`;

    if (unpaidOrders.length === 0) {
      text += `STATUS: WALANG UTANG. Lahat ng order ay bayad na.\n`;
    } else {
      text += `MGA HINDI PA BAYAD NA ORDER (${unpaidOrders.length}):\n`;
      unpaidOrders.forEach((o, idx) => {
        const orderDate = new Date(o.createdAt).toLocaleDateString('fil-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        text += `\n[${idx + 1}] Order #${o.orderNumber} (${orderDate})\n`;
        text += `    Kabuuang Halaga: ₱${o.totalAmount.toFixed(2)} (HINDI PA BAYAD)\n`;
        text += `    Mga Kinuha:\n`;
        o.items.forEach((item) => {
          text += `    - ${item.quantity}x ${item.productName} (${item.isExchange ? 'Refill' : 'New Gallon'}) = ₱${item.subtotal.toFixed(2)}\n`;
        });
        if (o.deliveryFee > 0) {
          text += `    - Delivery Fee: ₱${o.deliveryFee.toFixed(2)}\n`;
        }
        if (o.riderName) {
          text += `    - Inihatid ni Rider: ${o.riderName}\n`;
        }
        if (o.deliveryNotes) {
          text += `    - Tala: "${o.deliveryNotes}"\n`;
        }
      });

      text += `\n--------------------------------------\n`;
      text += `KABUUANG HINDI PA BAYAD (UTANG): ₱${client.unpaidBalance.toFixed(2)}\n`;
      text += `--------------------------------------\n`;
      text += `Mangyaring i-settle ang nasabing halaga. Maraming salamat!\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedPhone(client.phone);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Client Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Client Accounts & Balances
            </h1>
            {isSuperAdmin && (
              <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                <span>Super Admin Full Access</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pamahalaan ang mga account ng kliyente, Suki tags, credit limits, at bayad ng mga order.
          </p>
        </div>

        {/* Add Client Button */}
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 flex items-center space-x-2 active:scale-95 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Magdagdag ng Kliyente</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Mga Kliyente
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.totalClients}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kabuuang Hindi Bayad
            </span>
            <span className="text-2xl font-black text-rose-600">
              ₱{stats.totalUnpaidAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              May Utang
            </span>
            <span className="text-2xl font-black text-amber-600">
              {stats.unpaidClientsCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Suki Clients
            </span>
            <span className="text-2xl font-black text-indigo-600">
              {stats.sukiClientsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lahat ({stats.totalClients})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('unpaid')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center space-x-1 ${
                filterTab === 'unpaid'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <span>May Utang ({stats.unpaidClientsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('suki')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center space-x-1 ${
                filterTab === 'suki'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <span>Suki ({stats.sukiClientsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('paid')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                filterTab === 'paid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Bayad Lahat ({stats.paidClientsCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Hanapin sa Pangalan, Telepono, o Barangay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => {
          const isExpanded = expandedPhone === client.phone;
          const hasUnpaid = client.unpaidBalance > 0;

          return (
            <div
              key={client.phone}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                hasUnpaid
                  ? 'border-rose-200 hover:border-rose-300 shadow-sm'
                  : 'border-slate-200 hover:border-sky-200 shadow-sm'
              }`}
            >
              {/* Client Summary Row */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left: Customer Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{client.name}</h3>

                    {client.isSuki && (
                      <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Star className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                        <span>SUKI</span>
                      </span>
                    )}

                    {hasUnpaid ? (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        May Utang (₱{client.unpaidBalance.toFixed(2)})
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Bayad Lahat
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-700">{client.phone}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.barangayName}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.totalOrdersCount} na Order</span>
                    </span>
                    {client.creditLimit && (
                      <>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400">
                          Limit: ₱{client.creditLimit}
                        </span>
                      </>
                    )}
                  </div>

                  {client.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">
                      Tala: &quot;{client.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Right: Balances, Edit, Delete & Actions */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kasalukuyang Balanse
                    </span>
                    <span
                      className={`text-lg font-black ${
                        hasUnpaid ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {hasUnpaid ? `₱${client.unpaidBalance.toFixed(2)}` : '₱0.00'}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(client)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                    title="I-edit ang detalye ng kliyente"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Tanggalin ang account ng kliyente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Expand History Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedPhone(isExpanded ? null : client.phone)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>{isExpanded ? 'Itago' : 'Mga Order & Katibayan'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Client Ledger & Proof of Orders */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4">
                  {/* Proof Toolbar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span>Kasaysayan ng Lahat ng In-order at Kinuha ni {client.name}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Address: {client.address || client.deliveryAddress || 'Walang nakalagay'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyProof(client)}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-95 shrink-0"
                    >
                      {copiedPhone === client.phone ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Nakopya na ang Katibayan!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopyahin ang Katibayan ng Utang</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* List of Orders for this client */}
                  {client.orders.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                      Wala pang naitalang order ang kliyenteng ito.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {client.orders.map((order) => {
                        const isPaid = order.paymentStatus === 'PAID';
                        const isCancelled = order.status === 'CANCELLED';

                        return (
                          <div
                            key={order.id}
                            className={`bg-white rounded-xl p-4 border transition-all ${
                              isPaid
                                ? 'border-emerald-100 shadow-sm'
                                : isCancelled
                                ? 'border-slate-200 opacity-60'
                                : 'border-rose-200 shadow-sm'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-black text-slate-900">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(order.createdAt).toLocaleString('fil-PH', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                {isPaid ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>BAYAD NA</span>
                                  </span>
                                ) : isCancelled ? (
                                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    CANCELLED
                                  </span>
                                ) : (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    <span>HINDI PA BAYAD (₱{order.totalAmount.toFixed(2)})</span>
                                  </span>
                                )}

                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            {/* Order Items list */}
                            <div className="space-y-1.5 py-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Mga Produktong Kinuha (Items Availed):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center"
                                  >
                                    <div>
                                      <strong className="text-slate-800 block text-xs">
                                        {item.quantity}x {item.productName}
                                      </strong>
                                      <span className="text-[10px] text-slate-500">
                                        {item.isExchange ? 'Gallon Refill' : 'Brand New Container'} • ₱{item.price.toFixed(2)} bawat isa
                                      </span>
                                    </div>
                                    <span className="font-black text-slate-900 text-xs">
                                      ₱{item.subtotal.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Footer details & Action */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 mt-2 border-t border-slate-100 text-xs">
                              <div className="space-y-0.5 text-slate-500 text-[11px]">
                                {order.riderName && (
                                  <p className="flex items-center space-x-1">
                                    <Truck className="w-3 h-3 text-slate-400" />
                                    <span>Inihatid ni Rider: <strong>{order.riderName}</strong></span>
                                  </p>
                                )}
                                {order.deliveryNotes && (
                                  <p className="italic text-slate-600">
                                    Tala sa Delivery: &quot;{order.deliveryNotes}&quot;
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-3 self-end sm:self-center">
                                <span className="text-xs font-bold text-slate-500">
                                  Total: <strong className="text-slate-900 text-sm">₱{order.totalAmount.toFixed(2)}</strong>
                                </span>

                                {!isPaid && !isCancelled && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsPaid(client.phone, order.id)}
                                    disabled={updatingOrderId === order.id}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center space-x-1 disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{updatingOrderId === order.id ? 'Updating...' : 'Mark as Paid'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500 text-xs">
            Walang kliyenteng tumugma sa iyong paghahanap.
          </div>
        )}
      </div>

      {/* ADD / EDIT CLIENT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                {modalMode === 'add' ? (
                  <>
                    <UserPlus className="w-4 h-4 text-sky-600" />
                    <span>Magdagdag ng Bagong Kliyente</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 text-sky-600" />
                    <span>I-edit ang Detalye ng Kliyente</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buong Pangalan</label>
                <input
                  type="text"
                  required
                  placeholder="Hal. Maria Dela Cruz"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telepono (Phone)</label>
                  <input
                    type="text"
                    required
                    placeholder="09171234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barangay</label>
                  <select
                    value={formBarangayId}
                    onChange={(e) => setFormBarangayId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                  >
                    {barangays.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (+₱{b.deliveryFee.toFixed(0)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="Sitio Centro, malapit sa kapilya..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center pt-1">
                {/* Suki Toggle */}
                <label className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSuki}
                    onChange={(e) => setFormIsSuki(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-black text-indigo-950 block text-[11px]">Suki Status</span>
                    <span className="text-[10px] text-indigo-700">Puwede mag-utang</span>
                  </div>
                </label>

                {/* Credit Limit */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credit Limit (₱)</label>
                  <input
                    type="number"
                    step="50"
                    placeholder="1000"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Karagdagang Tala (Notes)</label>
                <textarea
                  rows={2}
                  placeholder="Hal. Tawag bago mag-deliver, laging 2 galon..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/25 disabled:opacity-50"
                >
                  {formLoading ? 'Sina-save...' : modalMode === 'add' ? 'Idagdag ang Kliyente' : 'I-update ang Kliyente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
