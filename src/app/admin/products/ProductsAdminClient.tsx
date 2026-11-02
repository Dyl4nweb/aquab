'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Package, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface ProductsAdminClientProps {
  initialProducts: any[];
  categories: any[];
}

export function ProductsAdminClient({
  initialProducts,
  categories,
}: ProductsAdminClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [waterType, setWaterType] = useState('Purified Water');
  const [containerType, setContainerType] = useState('Round Gallon');
  const [capacity, setCapacity] = useState('18.9L (5 Gallons)');
  const [price, setPrice] = useState('35');
  const [supportsExchange, setSupportsExchange] = useState(true);
  const [newContainerFee, setNewContainerFee] = useState('180');
  const [stock, setStock] = useState('50');
  const [minStockAlert, setMinStockAlert] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/products/round-gallon.png');
  const [isFeatured, setIsFeatured] = useState(false);

  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setWaterType('Purified Water');
    setContainerType('Round Gallon');
    setCapacity('18.9L (5 Gallons)');
    setPrice('35');
    setSupportsExchange(true);
    setNewContainerFee('180');
    setStock('50');
    setMinStockAlert('10');
    setDescription('');
    setImageUrl('/images/products/round-gallon.png');
    setIsFeatured(false);
    setErrorMsg('');
    setProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setWaterType(p.waterType);
    setContainerType(p.containerType);
    setCapacity(p.capacity);
    setPrice(p.price.toString());
    setSupportsExchange(p.supportsExchange);
    setNewContainerFee(p.newContainerFee.toString());
    setStock(p.stock.toString());
    setMinStockAlert(p.minStockAlert.toString());
    setDescription(p.description || '');
    setImageUrl(p.imageUrl);
    setIsFeatured(p.isFeatured);
    setErrorMsg('');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name,
        categoryId,
        waterType,
        containerType,
        capacity,
        price: parseFloat(price),
        supportsExchange,
        newContainerFee: parseFloat(newContainerFee || '0'),
        stock: parseInt(stock || '0'),
        minStockAlert: parseInt(minStockAlert || '10'),
        description,
        imageUrl,
        isFeatured,
      };

      if (editingProduct) {
        // Update
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? data.product : item))
        );
      } else {
        // Create
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setProducts((prev) => [data.product, ...prev]);
      }

      setProductModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductActive = async (p: any) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? data.product : item))
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      categories.push(data.category);
      setCategoryModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mWater = p.waterType.toLowerCase().includes(q);
        const mCont = p.containerType.toLowerCase().includes(q);
        if (!mName && !mWater && !mCont) return false;
      }
      return true;
    });
  }, [products, selectedCat, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={openAddModal}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <span>+ New Category</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            selectedCat === 'all'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                selectedCat === c.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Type & Capacity</th>
                <th className="p-4">Refill Price</th>
                <th className="p-4">Gallon Exchange</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl bg-sky-50 shrink-0 border border-sky-100 overflow-hidden flex items-center justify-center">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">{p.name}</strong>
                      {p.isFeatured && (
                        <span className="text-[10px] text-amber-600 font-bold flex items-center space-x-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured on Home</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{p.category?.name || 'N/A'}</td>
                  <td className="p-4">
                    <span className="block font-medium text-slate-800">{p.waterType}</span>
                    <span className="text-[10px] text-slate-400">{p.capacity}</span>
                  </td>
                  <td className="p-4 font-black text-slate-900 text-sm">
                    ₱{p.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    {p.supportsExchange ? (
                      <div>
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Yes (Refillable)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          New container: +₱{p.newContainerFee.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Standard Purchase
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`font-black ${
                      p.stock <= p.minStockAlert ? 'text-amber-600' : 'text-slate-800'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleProductActive(p)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.isActive
                          ? 'bg-slate-100 text-slate-600 hover:text-rose-600'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                      title={p.isActive ? 'Disable product' : 'Enable product'}
                    >
                      {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingProduct ? 'Edit Water Product' : 'Add New Water Product'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Purified Water — Round Gallon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Water Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Purified Water, Mineral, Alkaline"
                    value={waterType}
                    onChange={(e) => setWaterType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Container Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Round Gallon, Square Gallon, 5L Jug"
                    value={containerType}
                    onChange={(e) => setContainerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capacity / Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 18.9L (5 Gal), 10L, 5L, 500ml x 24"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Water Price (₱) {supportsExchange ? '(Refill Price)' : ''}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Gallon Exchange Toggle Box */}
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900">Reusable Gallon Exchange System</strong>
                    <span className="text-[11px] text-slate-500">
                      Does this product accept empty gallon returns for refills?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={supportsExchange}
                    onChange={(e) => setSupportsExchange(e.target.checked)}
                    className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                  />
                </div>

                {supportsExchange && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      New Container Fee / Deposit (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 180"
                      value={newContainerFee}
                      onChange={(e) => setNewContainerFee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none font-bold text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Charged when a customer buys without returning an empty container.
                    </span>
                  </div>
                )}
              </div>

              {/* Stock and Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!editingProduct && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <label htmlFor="featured" className="font-bold text-slate-700">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  placeholder="Water filtration details and container features..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add New Category</h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 Liter Containers"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Brief category summary"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newCatName.trim()}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

