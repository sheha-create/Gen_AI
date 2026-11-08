import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type TaxCategory, INITIAL_PRODUCTS } from '../db/database';
import { formatRupees, toPaise } from '../utils/money';
import {
  Plus,
  Search,
  Edit2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  Package,
  AlertCircle,
} from 'lucide-react';

const TAX_OPTIONS: { label: string; value: TaxCategory }[] = [
  { label: 'Exempt / 0%', value: 'NONE' },
  { label: 'GST 5%', value: 'GST5' },
  { label: 'GST 12%', value: 'GST12' },
  { label: 'GST 18%', value: 'GST18' },
  { label: 'GST 28%', value: 'GST28' },
];

const COMMON_UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'packet', 'box', 'dozen', 'meter'];
const SUGGESTED_CATEGORIES = ['Grains', 'Oils', 'Pulses', 'Dairy', 'Beverages', 'Snacks', 'Cleaning', 'Personal Care', 'Vegetables', 'Essentials'];

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitPriceRupees: string;
  taxCategory: TaxCategory;
}

const defaultForm: ProductFormData = {
  name: '',
  sku: '',
  category: 'Essentials',
  unit: 'pcs',
  unitPriceRupees: '',
  taxCategory: 'NONE',
};

export default function Catalogue() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [error, setError] = useState('');

  const products = useLiveQuery(() => db.products.orderBy('name').toArray());

  const categories = useMemo(() => {
    if (!products) return ['All'];
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  const startAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category || 'Essentials',
      unit: p.unit,
      unitPriceRupees: (p.unitPricePaise / 100).toFixed(2),
      taxCategory: p.taxCategory,
    });
    setEditingId(p.id!);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    const price = parseFloat(form.unitPriceRupees);
    if (isNaN(price) || price < 0) {
      setError('Enter a valid non-negative price');
      return;
    }
    if (!form.unit.trim()) {
      setError('Unit of measure is required (e.g. kg, pcs, litre)');
      return;
    }

    if (form.sku.trim()) {
      const existing = await db.products.where('sku').equals(form.sku.trim().toUpperCase()).first();
      if (existing && existing.id !== editingId) {
        setError(`SKU "${form.sku.trim().toUpperCase()}" is already used by "${existing.name}"`);
        return;
      }
    }

    const data = {
      name: form.name.trim(),
      sku: form.sku.trim() ? form.sku.trim().toUpperCase() : undefined,
      category: form.category.trim() || 'Essentials',
      unit: form.unit.trim(),
      unitPricePaise: toPaise(price),
      taxCategory: form.taxCategory,
      active: true,
      createdAt: Date.now(),
    };

    if (editingId !== null) {
      await db.products.update(editingId, data);
    } else {
      await db.products.add(data);
    }
    setShowForm(false);
  };

  const toggleActive = async (p: Product) => {
    await db.products.update(p.id!, { active: !p.active });
  };

  const handleSeedDefaults = async () => {
    for (const item of INITIAL_PRODUCTS) {
      const exists = await db.products.where('name').equals(item.name).first();
      if (!exists) {
        await db.products.add(item);
      }
    }
  };

  const taxLabel = (tc: TaxCategory) => {
    if (tc === 'NONE') return '0%';
    return tc.replace('GST', '') + '%';
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[var(--ink)] tracking-tight font-ui">Products</h1>
          <p className="text-xs text-[var(--ink-3)] font-medium mt-0.5">
            {products?.length ?? 0} items in catalogue
          </p>
        </div>
        <button
          onClick={startAdd}
          className="bg-[var(--ballpoint)] hover:opacity-90 active:scale-95 text-white px-3.5 py-2.5 rounded-[10px] font-bold flex items-center gap-1.5 text-xs transition"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Add item</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
        <input
          type="text"
          placeholder="Search by name, SKU or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-[52px] pl-9 pr-8 bg-[var(--well)] border border-[var(--line)] rounded-[10px] text-xs font-semibold text-[var(--ink)] placeholder-[var(--ink-3)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-9 px-3 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[var(--ballpoint)] text-white'
                  : 'bg-[var(--paper)] text-[var(--ink-2)] border border-[var(--line)] hover:border-[var(--ballpoint)]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--paper)] rounded-[10px] p-8 text-center border border-[var(--line)] space-y-3">
          <Package size={40} className="mx-auto opacity-30 text-[var(--ballpoint)]" />
          <div>
            <p className="font-bold text-[var(--ink)] text-sm">
              {search ? `No products match "${search}"` : 'No products yet'}
            </p>
            <p className="text-xs text-[var(--ink-3)] mt-0.5">
              {search ? 'Try a different name or SKU.' : 'Add your first product or load sample goods.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
            <button
              onClick={startAdd}
              className="bg-[var(--ballpoint)] hover:opacity-90 text-white text-xs font-bold py-2.5 px-4 rounded-[10px]"
            >
              Add first product
            </button>
            {!search && (
              <button
                onClick={handleSeedDefaults}
                className="bg-[var(--well)] hover:bg-[var(--line)] text-[var(--ink-2)] text-xs font-bold py-2 px-4 rounded-[10px] border border-[var(--line)]"
              >
                Load sample kirana goods
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`bg-[var(--paper)] rounded-[10px] px-4 py-3 border transition-all flex items-center justify-between ${
                !p.active
                  ? 'border-[var(--line)] opacity-50'
                  : 'border-[var(--line)] hover:border-[var(--ballpoint)]/50'
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-extrabold text-[var(--ink)] text-xs">{p.name}</p>
                  {!p.active && (
                    <span className="text-[9px] bg-[var(--well)] text-[var(--ink-3)] px-1.5 py-0.5 rounded-full font-bold">
                      Inactive
                    </span>
                  )}
                  {p.category && (
                    <span className="text-[9px] bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] px-1.5 py-0.5 rounded font-medium">
                      {p.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[var(--ink-3)] mt-0.5 font-tape">
                  {p.sku && <span>SKU: {p.sku}</span>}
                  {p.sku && <span>·</span>}
                  <span>{p.unit}</span>
                  {p.taxCategory !== 'NONE' && (
                    <span className="bg-[var(--ledger-wash)] text-[var(--ledger)] px-1.5 py-0.5 rounded font-semibold text-[9px] border border-[var(--ledger)]/30">
                      GST {taxLabel(p.taxCategory)}
                    </span>
                  )}
                </div>

                <p className="text-sm font-black text-[var(--ballpoint)] mt-1 font-tape">
                  {formatRupees(p.unitPricePaise)}{' '}
                  <span className="text-xs font-normal text-[var(--ink-3)]">/ {p.unit}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startEdit(p)}
                  className="p-2 text-[var(--ink-3)] hover:text-[var(--ballpoint)] rounded-[10px] hover:bg-[var(--well)] transition"
                  aria-label="Edit product"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  className={`p-1.5 rounded-[10px] transition ${
                    p.active ? 'text-[var(--ledger)] hover:text-[var(--ledger)]' : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]'
                  }`}
                  aria-label={p.active ? 'Deactivate product' : 'Activate product'}
                  title={p.active ? 'Click to deactivate' : 'Click to activate'}
                >
                  {p.active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Bottom Sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 z-50 flex flex-col justify-end">
          <div className="bg-[var(--paper)] rounded-t-[20px] p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] rounded-lg">
                  <Package size={18} />
                </div>
                <h2 className="font-extrabold text-[var(--ink)] text-base font-ui">
                  {editingId ? 'Edit product' : 'Add product'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 text-[var(--ink-3)] hover:text-[var(--ink)] rounded-[10px] bg-[var(--well)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-[var(--stamp-wash)] border border-[var(--stamp)]/30 text-[var(--stamp)] text-xs p-3 rounded-[10px] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink-2)] block mb-1">Product name *</label>
                <input
                  type="text"
                  placeholder="e.g. Basmati Rice (1kg)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink-2)] block mb-1">Category</label>
                  <input
                    type="text"
                    list="categories-list"
                    placeholder="e.g. Grains"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
                  />
                  <datalist id="categories-list">
                    {SUGGESTED_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="font-bold text-[var(--ink-2)] block mb-1">SKU / Code (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. RICE-01"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                    className="w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-mono uppercase font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink-2)] block mb-1">Unit *</label>
                  <input
                    type="text"
                    list="units-list"
                    placeholder="e.g. kg / pcs / litre"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
                  />
                  <datalist id="units-list">
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="font-bold text-[var(--ink-2)] block mb-1">Unit price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-3)] font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.unitPriceRupees}
                      onChange={(e) => setForm({ ...form, unitPriceRupees: e.target.value })}
                      className="w-full pl-7 pr-3 py-2.5 text-xs font-bold border border-[var(--line)] bg-[var(--well)] rounded-[10px] text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink-2)] block mb-1">Tax category (GST)</label>
                <div className="flex flex-wrap gap-2">
                  {TAX_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, taxCategory: t.value })}
                      className={`h-9 px-3 rounded-full text-xs font-semibold transition ${
                        form.taxCategory === t.value
                          ? 'bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] border-2 border-[var(--ballpoint)]'
                          : 'bg-[var(--well)] text-[var(--ink-2)] border border-[var(--line)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-[var(--ballpoint)] hover:opacity-90 active:scale-95 text-white font-bold py-3.5 rounded-[10px] flex items-center justify-center gap-2 transition"
            >
              <Check size={18} />
              <span>{editingId ? 'Update product' : 'Save product'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
