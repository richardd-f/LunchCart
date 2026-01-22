'use client';

import React, { useState } from 'react';
import { addShopStaff, toggleStaffNotification, removeShopStaff } from '../action';
import { UserShopRole, User } from '@prisma/client';
import { showConfirmationToast } from '@/components/ConfirmationToast';
import toast from 'react-hot-toast';

type StaffWithUser = UserShopRole & {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'image'>;
};

interface ShopStaffPageProps {
  initialStaff: StaffWithUser[];
  currentUserId: string;
}

export default function ShopStaffPage({ initialStaff, currentUserId }: ShopStaffPageProps) {
  const [staffList, setStaffList] = useState<StaffWithUser[]>(initialStaff);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail) return;

    setIsAdding(true);
    setMessage(null);

    const result = await addShopStaff(newStaffEmail);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Staff added successfully' });
      setNewStaffEmail('');
      window.location.reload(); 
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to add staff' });
    }
    setIsAdding(false);
  };

  const handleToggleNotification = async (roleId: string, currentStatus: boolean) => {
    // Optimistic update
    setStaffList(prev => prev.map(staff => 
        staff.id === roleId ? { ...staff, getNotification: !currentStatus } : staff
    ));

    const result = await toggleStaffNotification(roleId, !currentStatus);
    if (!result.success) {
        // Revert
        setStaffList(prev => prev.map(staff => 
            staff.id === roleId ? { ...staff, getNotification: currentStatus } : staff
        ));
        alert('Failed to update notification setting');
    }
  };

  const handleRemoveStaff = async (roleId: string) => {
    showConfirmationToast(
        'Are you sure you want to remove this staff member?',
        async () => {
            const result = await removeShopStaff(roleId);
            if (result.success) {
                setStaffList(prev => prev.filter(staff => staff.id !== roleId));
                toast.success('Staff removed successfully');
            } else {
                toast.error(result.error || 'Failed to remove staff');
            }
        }
    )
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Staff</h3>
          <div className="mt-2 text-sm text-gray-500">
            <p>Enter the email address of the user you want to add as staff.</p>
          </div>
          <form onSubmit={handleAddStaff} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 border shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-[#F97352] px-4 py-2 font-medium text-white shadow-sm hover:bg-[#e06646] focus:outline-none focus:ring-2 focus:ring-[#F97352] focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Staff'}
            </button>
          </form>
          {message && (
            <div className={`mt-4 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
           <h3 className="text-lg font-medium leading-6 text-gray-900">Staff List</h3>
        </div>
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notifications</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {staffList.map((person) => (
                      <tr key={person.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {person.user.name} 
                            {person.role === 'OWNER' && <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Owner</span>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.user.phone || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                                type="button"
                                onClick={() => handleToggleNotification(person.id, person.getNotification)}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#F97352] focus:ring-offset-2
                                    ${person.getNotification ? 'bg-[#F97352]' : 'bg-gray-200'}
                                `}
                                role="switch"
                                aria-checked={person.getNotification}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`
                                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                        ${person.getNotification ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {person.userId !== currentUserId && (
                                <button
                                    onClick={() => handleRemoveStaff(person.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Remove Staff"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </td>
                      </tr>
                    ))}
                    {staffList.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-4 text-center text-sm text-gray-500">No staff found.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
