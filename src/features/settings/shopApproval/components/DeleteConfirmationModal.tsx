"use client"

import React, { useState } from 'react'
import { createPortal } from 'react-dom'

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    shopName: string
    title?: string
    message?: string
}

export function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    shopName,
    title = "Delete Shop Permanently",
    message = "This action cannot be undone. To confirm, please type the following:"
}: DeleteConfirmationModalProps) {
    const [inputValue, setInputValue] = useState("")
    const confirmationPhrase = `delete ${shopName} permanently`
    const isMatched = inputValue === confirmationPhrase

    if (!isOpen) return null

    // Portal to document.body to ensure it sits on top of everything
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <div className="bg-red-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">
                        {message}
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 select-all">
                        <code className="text-sm font-mono text-gray-800 font-bold block text-center">
                            {confirmationPhrase}
                        </code>
                    </div>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type confirmation phrase here"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6 text-sm"
                        autoFocus
                    />

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (isMatched) {
                                    onConfirm()
                                    setInputValue("") // Reset on success
                                }
                            }}
                            disabled={!isMatched}
                            className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all
                                ${isMatched 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/30' 
                                    : 'bg-gray-300 cursor-not-allowed text-gray-400'
                                }`}
                        >
                            Delete Shop
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
