'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Check, X, MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface BarangaysClientProps {
  initialBarangays: any[];
  municipality: string;
}

export function BarangaysClient({
  initialBarangays,
  municipality,
}: BarangaysClientProps) {
  const [barangays, setBarangays] = useState(initialBarangays);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState<any>(null);
  const [name, setName] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('20');
  const [estMinutes, setEstMinutes] = useState('45');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = () => {
    setEditingBarangay(null);
    setName('');
    setDeliveryFee('25');
    setEstMinutes('45');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBarangay(b);
    setName(b.name);
    setDeliveryFee(b.deliveryFee.toString());
    setEstMinutes(b.estimatedDeliveryMinutes.toString());
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name,
        municipality,
        deliveryFee: parseFloat(deliveryFee),
        estimatedDeliveryMinutes: parseInt(estMinutes),
      };

      if (editingBarangay) {
        const res = await fetch(`/api/admin/barangays/${editingBarangay.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setBarangays((prev) =>
          prev.map((b) => (b.id === editingBarangay.id ? { ...b, ...data.barangay } : b))
        );
      } else {
        const res = await fetch('/api/admin/barangays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setBarangays((prev) => [...prev, data.barangay]);
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving barangay');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (b: any) => {
    try {
      const res = await fetch(`/api/admin/barangays/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBarangays((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, ...data.barangay } : item))
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Button */}
      <div className="bg-sky-50/70 p-6 rounded-3xl border border-sky-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Municipality: {municipality}
            </h2>
            <p className="text-xs text-slate-500">
              {barangays.filter((b) => b.isActive).length} active delivery barangays configured
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Barangay</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Barangay Name</th>
                <th className="p-4">Municipality</th>
                <th className="p-4">Delivery Fee</th>
                <th className="p-4">Est. Delivery Time</th>
                <th className="p-4">Historical Orders</th>
                <th className="p-4">Coverage Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {barangays.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-bold text-slate-900">{b.name}</td>
                  <td className="p-4 text-slate-500">{b.municipality}</td>
                  <td className="p-4 font-black text-sky-700 text-sm">
                    ₱{b.deliveryFee.toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    ~{b.estimatedDeliveryMinutes} mins
                  </td>
                  <td className="p-4 text-slate-500">
                    {b._count?.orders || 0} orders
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {b.isActive ? 'Supported' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                      title="Edit fee / time"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleActive(b)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        b.isActive
                          ? 'bg-slate-100 text-slate-600 hover:text-rose-600'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                      title={b.isActive ? 'Disable delivery' : 'Enable delivery'}
                    >
                      {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingBarangay ? 'Edit Barangay Delivery' : 'Add Eligible Barangay'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Barangay Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tungkong Mangga"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Fee (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="25.00"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Estimated Delivery Minutes
                </label>
                <input
                  type="number"
                  required
                  placeholder="45"
                  value={estMinutes}
                  onChange={(e) => setEstMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Barangay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

