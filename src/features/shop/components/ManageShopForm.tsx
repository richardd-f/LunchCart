"use client";

import { useState, useTransition } from "react";
import { updateShop } from "../actions";
import UploadButton from "@/components/UploadButton";
import Image from "next/image";
import type { Shop } from "@prisma/client";

// Define ShopStatus locally for client-side usage to avoid importing Prisma runtime
const ShopStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED"
} as const;

type ShopStatus = typeof ShopStatus[keyof typeof ShopStatus];

interface ManageShopFormProps {
  shop: Shop;
}

export default function ManageShopForm({ shop }: ManageShopFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(shop.name);
  const [address, setAddress] = useState(shop.address);
  const [phone, setPhone] = useState(shop.phone);
  const [description, setDescription] = useState(shop.description);
  const [status, setStatus] = useState<ShopStatus>(shop.status as ShopStatus);
  const [profileImage, setProfileImage] = useState<string | null>(shop.profileImage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updateShop({
        name,
        address,
        phone,
        description,
        status,
        profileImage: profileImage || undefined,
      });

      if (result.success) {
        setSuccess("Shop information updated successfully!");
      } else {
        setError((result as any).error || "Failed to update shop.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Image Upload */}
        <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center group">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Shop Profile"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm font-medium">No Image</span>
            )}
            
            {/* Overlay for hover effect */}
             <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="w-full">
            <UploadButton
              onConfirmed={(results) => {
                const url = results[0]?.secure_url as string;
                if (url) setProfileImage(url);
              }}
              options={{
                maxFiles: 1,
                multiple: false,
                resourceType: "image",
              }}
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              Recommended: Square image, max 2MB
            </p>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Shop Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] outline-none transition-all"
                  placeholder="Enter shop name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] outline-none transition-all"
                  placeholder="0812..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] outline-none transition-all"
                placeholder="Shop location details"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] outline-none transition-all resize-none"
                placeholder="Describe your shop..."
                required
              />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-gray-700">Shop Status</label>
               <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value={ShopStatus.OPEN}
                      checked={status === ShopStatus.OPEN}
                      onChange={() => setStatus(ShopStatus.OPEN)}
                      className="w-4 h-4 text-[#F97352] focus:ring-[#F97352]"
                    />
                    <span className="text-gray-700">Open</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value={ShopStatus.CLOSED}
                      checked={status === ShopStatus.CLOSED}
                      onChange={() => setStatus(ShopStatus.CLOSED)}
                      className="w-4 h-4 text-[#F97352] focus:ring-[#F97352]"
                    />
                    <span className="text-gray-700">Closed</span>
                  </label>
               </div>
               <p className="text-xs text-gray-400">
                  Set to "Closed" to temporarily stop receiving orders.
               </p>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                {success}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto px-8 py-3 bg-[#F97352] hover:bg-[#e06341] text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-100 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
