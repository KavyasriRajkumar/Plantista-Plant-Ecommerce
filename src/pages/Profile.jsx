import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiPackage, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

/**
 * Profile — reads the logged-in user from AuthContext. If nobody is
 * logged in (fresh page load with in-memory auth), it points to Login
 * rather than rendering a broken form.
 */
export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    pincode: user?.address?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiUser size={40} className="text-ink/20" />
        <h1 className="mt-6 font-display text-2xl font-medium">You're not logged in</h1>
        <p className="mt-2 text-sm text-ink/60">Log in to view and manage your profile.</p>
        <Link to="/login" className="mt-6 inline-block">
          <Button>Log in</Button>
        </Link>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: { street: form.address, city: form.city, pincode: form.pincode },
      });
      toast.success('Profile saved');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Could not save your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium">My profile</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-mist"
        >
          <FiLogOut size={14} /> Logout
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick links */}
        <div className="space-y-3">
          <Link to="/orders" className="flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-card hover:shadow-lift">
            <FiPackage className="text-fern" size={20} />
            <div>
              <p className="text-sm font-medium">My Orders</p>
              <p className="text-xs text-ink/50">Track and review past orders</p>
            </div>
          </Link>
          <Link to="/wishlist" className="flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-card hover:shadow-lift">
            <FiUser className="text-fern" size={20} />
            <div>
              <p className="text-sm font-medium">My Wishlist</p>
              <p className="text-xs text-ink/50">Plants you've saved</p>
            </div>
          </Link>
        </div>

        {/* Details / Address form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-paper p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-medium">
                <FiUser size={18} /> Account details
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-fern hover:underline"
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  id="profile-name"
                  label="Full name"
                  value={form.name}
                  disabled={!editing}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <Input
                  id="profile-email"
                  label="Email"
                  type="email"
                  value={form.email}
                  disabled
                  readOnly
                />
                <Input
                  id="profile-phone"
                  label="Phone number"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  disabled={!editing}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <Input
                  id="profile-pincode"
                  label="Pincode"
                  placeholder="600001"
                  value={form.pincode}
                  disabled={!editing}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                />
              </div>

              <h3 className="flex items-center gap-2 pt-2 font-display text-base font-medium">
                <FiMapPin size={16} /> Address
              </h3>
              <Input
                id="profile-address"
                label="Street address"
                placeholder="12 Garden Lane"
                value={form.address}
                disabled={!editing}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
              <Input
                id="profile-city"
                label="City"
                placeholder="Chennai"
                value={form.city}
                disabled={!editing}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />

              {editing && (
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
