"use client"

import React from 'react'
import { toast } from 'react-toastify'

interface ConfirmationToastProps {
    message: string
    onConfirm: () => void
    onCancel?: () => void
    closeToast?: () => void // injected by react-toastify
}

export default function ConfirmationToast({ message, onConfirm, onCancel, closeToast }: ConfirmationToastProps) {
    const handleConfirm = () => {
        if (closeToast) closeToast()
        onConfirm()
    }

    const handleCancel = () => {
        if (closeToast) closeToast()
        if (onCancel) onCancel()
    }

    return (
        <div className="flex flex-col gap-4 min-w-[300px]">
            <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                    <svg className="w-6 h-6 text-[#F97352]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Confirmation</h3>
                    <p className="text-sm text-gray-500 mt-1">{message}</p>
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
                <button 
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleConfirm}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-[#F97352] hover:bg-[#E06040] rounded-lg shadow-sm active:scale-95 transition-all"
                >
                    Confirm
                </button>
            </div>
        </div>
    )
}

export const showConfirmationToast = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    toast(
        ({ closeToast }) => (
            <ConfirmationToast 
                closeToast={closeToast} 
                message={message} 
                onConfirm={onConfirm} 
                onCancel={onCancel} 
            />
        ), 
        {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false, // We control closing via buttons
            className: "p-0"
        }
    )
}
