"use client";

import { CldUploadWidget, CloudinaryUploadWidgetResults, CloudinaryUploadWidgetInfo, CldUploadWidgetProps } from 'next-cloudinary';
import { useRef } from 'react';

interface UploadButtonProps {
  options?: CldUploadWidgetProps['options'];
  onConfirmed?: (results: CloudinaryUploadWidgetInfo[]) => void;
}

export default function UploadButton({ options, onConfirmed }: UploadButtonProps) {
  const uploadResultsRef = useRef<CloudinaryUploadWidgetInfo[]>([]);

  const handleSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info === 'object' && result.info !== null) {
      uploadResultsRef.current.push(result.info);
    }
  };

  const handleClose = () => {
    if (uploadResultsRef.current.length > 0 && onConfirmed) {
      onConfirmed(uploadResultsRef.current);
      uploadResultsRef.current = [];
    }
  };

  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={handleSuccess}
      onClose={handleClose}
      options={{
        singleUploadAutoClose: false,
        multiple: true,
        maxFiles: 5,
        ...options,
      }}
    >
      {({ open }) => {
        return (
          <button 
            type="button" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => open()}
          >
            Upload Images
          </button>
        );
      }}
    </CldUploadWidget>
  );
}