"use client"

import React, { useState, useEffect, useRef } from 'react'
import QRScanner from './QRScanner'
import { verifyPickupOrder } from '../../action'
import { IDetectedBarcode } from '@yudiel/react-qr-scanner'
import toast from 'react-hot-toast'

interface PickupScannerModalProps {
    isOpen: boolean
    onClose: () => void
}

type Stage = 'CUSTOMER_SCAN' | 'ITEM_SCAN'

interface ValidatedOrder {
    id: string
    customerName: string
    itemCount: number
    pickupDate: Date | null
    items: {
        name: string;
        quantity: number;
        options: string[];
    }[]
}

export default function PickupScannerModal({ isOpen, onClose }: PickupScannerModalProps) {
    const [stage, setStage] = useState<Stage>('CUSTOMER_SCAN')
    const [scannedOrder, setScannedOrder] = useState<ValidatedOrder | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [matchedItem, setMatchedItem] = useState<boolean>(false)
    const lastScannedRef = useRef<string | null>(null)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStage('CUSTOMER_SCAN')
            setScannedOrder(null)
            setError(null)
            setMatchedItem(false)
            lastScannedRef.current = null
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleStage1Scan = async (barcodes: IDetectedBarcode[]) => {
        if (barcodes.length === 0 || isLoading) return
        
        const rawValue = barcodes[0].rawValue
        if (!rawValue || rawValue === lastScannedRef.current) return
        
        lastScannedRef.current = rawValue
        setIsLoading(true)
        setError(null)

        try {
            // Assume rawValue is the orderId
            const result = await verifyPickupOrder(rawValue)
            
            if (result.success && result.data) {
                // Fix potential null meal name issue map
                const cleanData = {
                     ...result.data,
                     items: result.data.items.map(i => ({
                         ...i,
                         name: i.name || "Unknown Item"
                     }))
                }

                setScannedOrder(cleanData)
                setStage('ITEM_SCAN')
                toast.success("Order Verified! Proceed to scan items.")
            } else {
                setError(result.error || "Invalid QR Code")
                toast.error(result.error || "Invalid QR Code")
                // Clear ref after delay so they can try somewhat same code again if it was a mis-scan
                setTimeout(() => { lastScannedRef.current = null }, 2000)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to verify order")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStage2Scan = (barcodes: IDetectedBarcode[]) => {
        // Stage 2: We are looking for a QR code that matches scanneOrder.id
        // The scanner component (if utilizing native overlay) might highlight it,
        // but here we just want to confirm *if* we see it.
        
        if (!scannedOrder) return

        const match = barcodes.find(bc => bc.rawValue === scannedOrder.id)

        if (match) {
            if (!matchedItem) {
                setMatchedItem(true)
                toast.success("MATCH FOUND!", {
                    icon: '✅',
                    style: {
                        background: '#10B981', // Green-500
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    },
                    duration: 2000
                })
            }
        } else {
             // Optional: Reset match status if lost, or keep it "Found" until manually reset?
             // For now, let's keep it sticky for a moment so the UI doesn't flicker too much
             if (matchedItem) {
                 setTimeout(() => setMatchedItem(false), 3000) // Reset after 3s of no match
             }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                        </svg>
                        Scan QR Code
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {stage === 'CUSTOMER_SCAN' ? (
                        <div className="space-y-4 text-center">
                            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm border border-blue-200">
                                <p className="font-semibold">Step 1: Scan Customer QR</p>
                                <p>Ask customer to show their order QR code.</p>
                            </div>

                            <QRScanner 
                                onScan={handleStage1Scan} 
                                paused={isLoading}
                                onError={(e) => console.error(e)}
                            />
                            
                            {error && (
                                <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-200 animate-pulse">
                                    {error}
                                </div>
                            )}

                            {isLoading && (
                                <p className="text-gray-500 text-sm animate-pulse">Verifying order...</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg">Order #{scannedOrder?.id.slice(-4).toUpperCase()}</p>
                                    <p className="text-xs text-green-800 font-medium">{scannedOrder?.customerName}</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">VERIFIED</span>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <QRScanner 
                                    onScan={handleStage2Scan}
                                    targetData={scannedOrder?.id} // Pass target for creating custom overlay if needed inside component logic
                                />
                                
                                {/* Overlay Helper for Stage 2 */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm pointer-events-none">
                                    Point at Item QR Codes
                                </div>
                                
                                {matchedItem && (
                                    <div className="absolute inset-0 border-4 border-green-500 z-20 animate-pulse pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.5)] bg-green-500/10 flex items-center justify-center">
                                         <div className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xl shadow-lg border-2 border-white transform scale-110 transition-transform">
                                            MATCH FOUND!
                                         </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-700 text-sm mb-2 border-b pb-1">Order Items ({scannedOrder?.itemCount})</h4>
                                <ul className="space-y-2 max-h-32 overflow-y-auto text-sm">
                                    {scannedOrder?.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-start text-gray-600">
                                            <span>
                                                <span className="font-medium text-gray-800">{item.quantity}x</span> {item.name}
                                                {item.options.length > 0 && (
                                                    <span className="block text-xs text-gray-400 pl-5">{item.options.join(', ')}</span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button 
                                onClick={() => {
                                    setStage('CUSTOMER_SCAN')
                                    setScannedOrder(null)
                                    setMatchedItem(false)
                                }}
                                className="w-full py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Scan Next Customer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
