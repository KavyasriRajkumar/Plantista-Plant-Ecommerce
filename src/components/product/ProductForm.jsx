import { useEffect, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { getCategories } from '../../services/productService';

const EMPTY = { name: '', category: '', price: '', discount: '', stock: '', description: '', image: '' };

/**
 * ProductForm — shared by "Add product" and "Edit product" in the admin
 * Products page (rendered inside Modal). Takes an optional `initial`
 * product to pre-fill for editing; omit it for a blank add form.
 */
export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, category: initial.category, price: initial.price, discount: initial.discount, stock: initial.stock, description: initial.description, image: initial.images?.[0] || '' }
      : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then((list) => {
      setCategories(list);
      setForm((f) => (f.category ? f : { ...f, category: list[0]?.id || '' }));
    }).catch(() => {});
  }, []);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter a product name';
    if (!form.price || Number(form.price) <= 0) next.price = 'Enter a valid price';
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'Enter valid stock quantity';
    if (!form.category) next.category = 'Choose a category';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      stock: Number(form.stock),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        id="pf-name"
        label="Plant name"
        value={form.name}
        error={errors.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />

      <div>
        <label htmlFor="pf-category" className="mb-1.5 block text-sm font-medium text-ink/80">Category</label>
        <select
          id="pf-category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm focus:border-fern focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          id="pf-price"
          label="Price (₹)"
          type="number"
          min="0"
          value={form.price}
          error={errors.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
        <Input
          id="pf-discount"
          label="Discount %"
          type="number"
          min="0"
          max="100"
          value={form.discount}
          onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
        />
        <Input
          id="pf-stock"
          label="Stock"
          type="number"
          min="0"
          value={form.stock}
          error={errors.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
        />
      </div>

      <Input
        id="pf-image"
        label="Image URL or path (optional)"
        placeholder="/plants/my-plant.jpg"
        value={form.image}
        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
      />

      <div>
        <label htmlFor="pf-description" className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
        <textarea
          id="pf-description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm focus:border-fern focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">{initial ? 'Save changes' : 'Add product'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
