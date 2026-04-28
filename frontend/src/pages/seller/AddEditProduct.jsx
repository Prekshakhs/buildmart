import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { productService, categoryService } from "../../api/services";
import { PageLoader } from "../../components/Loaders";
import { getErrMsg } from "../../utils/helpers";
import toast from "react-hot-toast";

const UNITS = ["piece", "kg", "bag", "litre", "metre", "set", "pair", "box", "roll"];

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "", description: "", category: "", retailPrice: "",
    stock: "", unit: "piece", brand: "", tags: "",
  });
  const [tiers, setTiers] = useState([{ minQty: "", price: "", label: "" }]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // File objects for new upload
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data.data || []));
    if (isEdit) {
      productService.getById(id).then((r) => {
        const p = r.data.data;
        setForm({ name: p.name, description: p.description, category: p.category?._id || "", retailPrice: p.retailPrice, stock: p.stock, unit: p.unit || "piece", brand: p.brand || "", tags: (p.tags || []).join(", ") });
        setTiers(p.wholesaleTiers?.length ? p.wholesaleTiers.map((t) => ({ ...t })) : [{ minQty: "", price: "", label: "" }]);
        setExistingImages(p.images || []);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setTier = (i, k, v) => setTiers((t) => t.map((tier, idx) => idx === i ? { ...tier, [k]: v } : tier));
  const addTier = () => setTiers((t) => [...t, { minQty: "", price: "", label: "" }]);
  const removeTier = (i) => setTiers((t) => t.filter((_, idx) => idx !== i));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const validTiers = tiers.filter((t) => t.minQty && t.price);
      fd.append("wholesaleTiers", JSON.stringify(validTiers));
      images.forEach((img) => fd.append("images", img));

      if (isEdit) {
        await productService.update(id, fd);
        toast.success("Product updated!");
      } else {
        await productService.create(fd);
        toast.success("Product created!");
      }
      navigate("/seller/products");
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container max-w-3xl">
      <h1 className="section-title mb-8">{isEdit ? "Edit Product" : "Add New Product"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-steel-400">Product Information</h2>
          <div>
            <label className="label">Product Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="e.g. OPC 53 Grade Cement - 50kg Bag" required />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
              className="input resize-none" placeholder="Describe the product in detail…" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input" required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className="input">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Brand</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className="input" placeholder="e.g. Ultratech" />
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className="input" placeholder="cement, opc, building" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-5">
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-steel-400">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Retail Price (₹) *</label>
              <input type="number" value={form.retailPrice} onChange={(e) => set("retailPrice", e.target.value)}
                className="input" placeholder="420" min={0} required />
            </div>
            <div>
              <label className="label">Stock Quantity *</label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)}
                className="input" placeholder="100" min={0} required />
            </div>
          </div>

          {/* Wholesale Tiers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Wholesale Tiers (optional)</label>
              <button type="button" onClick={addTier} className="btn-ghost text-xs flex items-center gap-1 text-amber-400 hover:text-amber-300">
                <Plus size={12} /> Add Tier
              </button>
            </div>
            <div className="space-y-3">
              {tiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-center">
                  <div>
                    <input type="number" value={tier.minQty} onChange={(e) => setTier(i, "minQty", e.target.value)}
                      className="input text-xs" placeholder="Min qty (e.g. 10)" min={1} />
                  </div>
                  <div>
                    <input type="number" value={tier.price} onChange={(e) => setTier(i, "price", e.target.value)}
                      className="input text-xs" placeholder="Price at this qty" min={0} />
                  </div>
                  <div className="flex gap-2">
                    <input value={tier.label} onChange={(e) => setTier(i, "label", e.target.value)}
                      className="input text-xs flex-1" placeholder="Label (e.g. 10+ units)" />
                    {tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(i)} className="text-steel-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-steel-600 font-mono mt-2">Retail: ₹{form.retailPrice || "—"} → Bulk tiers apply on top</p>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-steel-400">Product Images</h2>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.publicId} className="relative w-20 h-20 rounded overflow-hidden border border-steel-700 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-steel-700 rounded-lg cursor-pointer hover:border-amber-400/50 transition-colors">
            <Upload size={24} className="text-steel-500" />
            <div className="text-center">
              <p className="font-display font-700 text-sm uppercase tracking-wide text-steel-300">Upload Images</p>
              <p className="text-xs text-steel-600 font-body mt-1">JPG, PNG, WebP · Max 5MB each · Up to 5 images</p>
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((file, i) => (
                <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-amber-400/30">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-steel-950/80 rounded-full flex items-center justify-center text-red-400">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
            {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/seller/products")} className="btn-outline py-3 px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
