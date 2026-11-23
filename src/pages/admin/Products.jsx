import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getPlants } from '../../services/productService';
import { createProduct, updateProduct, deleteProduct } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

const PLACEHOLDER_IMAGE = '/leaf.svg';
import Modal from '../../components/common/Modal';
import ProductForm from '../../components/product/ProductForm';
import { getButtonClasses } from '../../components/common/Button';

/**
 * Admin Products: the catalog from the API, with add / edit / delete saved
 * to MongoDB through the admin endpoints. Add and edit share a Modal with
 * ProductForm; the table updates from the server's response.
 */
export default function Products() {
  const [products, setProducts] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [activeProduct, setActiveProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPlants().then(setProducts).catch(() => { toast.error('Could not load products'); setProducts([]); });
  }, []);

  const openAdd = () => {
    setActiveProduct(null);
    setModalMode('add');
  };

  const openEdit = (product) => {
    setActiveProduct(product);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveProduct(null);
  };

  const handleSubmit = async ({ image, ...data }) => {
    if (saving) return;
    setSaving(true);
    try {
      if (modalMode === 'edit') {
        const payload = { ...data };
        if (image) payload.images = [image, ...(activeProduct.images || []).slice(1)];
        const updated = await updateProduct(activeProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Product updated');
      } else {
        const created = await createProduct({
          ...data,
          images: [image || PLACEHOLDER_IMAGE],
          care: { water: 'See description', sunlight: 'See description', fertilizer: 'See description' },
        });
        setProducts((prev) => [created, ...prev]);
        toast.success('Product added');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the product');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the product');
    }
    setDeleteTarget(null);
  };

  if (products === null) return <Loader label="Loading products…" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium">Products</h1>
          <p className="mt-1 text-sm text-ink/50">{products.length} plants in catalog</p>
        </div>
        <button onClick={openAdd} className={getButtonClasses('primary', 'md')}>
          <FiPlus size={16} /> Add product
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-paper shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="hidden px-5 py-4 font-medium sm:table-cell">Category</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="hidden px-5 py-4 font-medium sm:table-cell">Stock</th>
              <th className="px-5 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0 hover:bg-mist/40">
                <td className="flex items-center gap-3 px-5 py-3">
                  <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="hidden px-5 py-3 capitalize text-ink/60 sm:table-cell">{p.category}</td>
                <td className="px-5 py-3 font-mono">₹{p.price}</td>
                <td className="hidden px-5 py-3 sm:table-cell">
                  <span className={p.stock === 0 ? 'text-red-500' : 'text-ink/70'}>{p.stock}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="rounded-full p-2 text-ink/50 hover:bg-mist hover:text-fern"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      aria-label={`Delete ${p.name}`}
                      className="rounded-full p-2 text-ink/50 hover:bg-mist hover:text-red-500"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!modalMode} onClose={closeModal} title={modalMode === 'edit' ? 'Edit product' : 'Add product'}>
        <ProductForm initial={activeProduct} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete product">
        <p className="text-sm text-ink/70">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This can't be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={confirmDelete} className={getButtonClasses('primary', 'md', 'bg-red-600 hover:bg-red-700')}>
            Delete
          </button>
          <button onClick={() => setDeleteTarget(null)} className={getButtonClasses('ghost', 'md')}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
