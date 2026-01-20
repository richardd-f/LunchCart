"use client";

import { CldUploadWidget, CldUploadWidgetProps } from 'next-cloudinary';

interface UploadButtonProps {
  options?: CldUploadWidgetProps['options'];
  onSuccess?: CldUploadWidgetProps['onSuccess'];
}

export default function UploadButton({ options, onSuccess }: UploadButtonProps) {
  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={onSuccess}
      options={{
        multiple: false,
        maxFiles: 5,
        ...options,
      }}
    >
      {({ open }) => {
        return (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => open()}
          >
            Upload Image
          </button>
        );
      }}
    </CldUploadWidget>
  );
}