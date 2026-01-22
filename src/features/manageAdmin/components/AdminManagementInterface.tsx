'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@prisma/client';
import { AdminUserListResult, updateUserRole } from '../actions';


interface AdminManagementInterfaceProps {
  data: AdminUserListResult;
  initialQuery: string;
}

export default function AdminManagementInterface({ data, initialQuery }: AdminManagementInterfaceProps) {
  const { users, totalPages, currentPage } = data;
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/manageAdmin?query=${encodeURIComponent(query)}&page=1`);
  };

  const handlePageChange = (page: number) => {
    router.push(`/manageAdmin?query=${encodeURIComponent(query)}&page=${page}`);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleCloseEdit = () => {
    setSelectedUser(null);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    
    startTransition(async () => {
      const res = await updateUserRole(selectedUser.id, newRole);
      if (res.success) {
        handleCloseEdit();
        // Optional: Show success toast
      } else {
        alert(res.error || "Failed to update role");
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Management</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 p-2 border border-gray-300 rounded focus:border-[#F97352] focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#F97352] text-white px-4 py-2 rounded hover:bg-[#e06646] transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-600">Name</th>
              <th className="px-6 py-3 font-medium text-gray-600">Email</th>
              <th className="px-6 py-3 font-medium text-gray-600">Role</th>
              <th className="px-6 py-3 font-medium text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-[#F97352] hover:text-[#e06646] font-medium border border-[#F97352] hover:bg-[#FFF0EB] px-3 py-1 rounded transition-colors"
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-bold text-gray-800">Edit User Role</h3>
              <button onClick={handleCloseEdit} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Change role for <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="bg-[#F97352] text-white px-4 py-2 rounded hover:bg-[#e06646] disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
