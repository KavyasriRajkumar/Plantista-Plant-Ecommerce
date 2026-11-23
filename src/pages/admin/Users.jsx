import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getUsers, setUserStatus } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

/**
 * Admin Users — lists registered customers with order counts and a
 * block/unblock toggle, saved through PATCH /api/users/:id/status.
 */
export default function Users() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => { toast.error('Could not load users'); setUsers([]); });
  }, []);

  const toggleStatus = async (user) => {
    const status = user.status === 'Active' ? 'Blocked' : 'Active';
    try {
      await setUserStatus(user.id, status);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status } : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the user');
    }
  };

  if (users === null) return <Loader label="Loading users…" />;

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Users</h1>
      <p className="mt-1 text-sm text-ink/50">{users.length} registered customers</p>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-paper shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-4 font-medium">Name</th>
              <th className="hidden px-5 py-4 font-medium sm:table-cell">Email</th>
              <th className="hidden px-5 py-4 font-medium md:table-cell">Joined</th>
              <th className="px-5 py-4 font-medium">Orders</th>
              <th className="px-5 py-4 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/5 last:border-0 hover:bg-mist/40">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="hidden px-5 py-3 text-ink/60 sm:table-cell">{u.email}</td>
                <td className="hidden px-5 py-3 text-ink/60 md:table-cell">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="px-5 py-3">{u.orders}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(u)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      u.status === 'Active' ? 'bg-fern/10 text-fern hover:bg-red-100 hover:text-red-600' : 'bg-red-100 text-red-600 hover:bg-fern/10 hover:text-fern'
                    }`}
                  >
                    {u.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
