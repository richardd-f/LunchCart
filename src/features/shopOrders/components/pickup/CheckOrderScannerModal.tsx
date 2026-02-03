'use client';

import React, { useState, useRef } from 'react';
import QRScanner from './QRScanner';
import { getOrderDetails, completeOrder } from '../../action';
import { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { toast } from 'react-toastify';

interface CheckOrderScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface OrderDetails {
    id: string;
    orderStatus: string;
    totalAmount: string; // Decimal comes as string often via JSON
    user: {
        name: string | null;
    } | null;
    orderItems: {
        id: string;
        mealName: string;
        quantity: number;
        price: string;
        options: {
            optionName: string;
            price: string;
        }[];
    }[];
}

export default function CheckOrderScannerModal({ isOpen, onClose }: CheckOrderScannerModalProps) {
    const [scannerActive, setScannerActive] = useState(true);
    const [scannedOrder, setScannedOrder] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const lastScannedRef = useRef<string | null>(null);

    const handleScan = async (barcodes: IDetectedBarcode[]) => {
        if (barcodes.length === 0 || isLoading || !scannerActive) return;

        const rawValue = barcodes[0].rawValue;
        if (!rawValue || rawValue === lastScannedRef.current) return;

        lastScannedRef.current = rawValue;
        setIsLoading(true);

        try {
            const result = await getOrderDetails(rawValue);
            if (result.success && result.data) {
                // @ts-ignore - Prisma types messiness with Decimal/JSON
                setScannedOrder(result.data);
                setScannerActive(false);
                toast.success('Order found!');
            } else {
                toast.error(result.error || 'Order not found');
                 // Allow rescanning after delay
                 setTimeout(() => { lastScannedRef.current = null; }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch order details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!scannedOrder) return;
        setIsCompleting(true);
        try {
            const result = await completeOrder(scannedOrder.id);
            if (result.success) {
                toast.success('Order completed successfully!');
                handleNextScan();
            } else {
                toast.error(result.error || 'Failed to complete order');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to complete order');
        } finally {
            setIsCompleting(false);
        }
    };

    const handleNextScan = () => {
        setScannerActive(true);
        setScannedOrder(null);
        lastScannedRef.current = null;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Check Order
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {scannerActive ? (
                        <div className="space-y-4 text-center">
                            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm border border-blue-200">
                                <p className="font-semibold">Scan QR Code</p>
                                <p>Scan the order QR code to view details.</p>
                            </div>

                            <QRScanner
                                onScan={handleScan}
                                paused={isLoading}
                                onError={(e) => console.error(e)}
                            />

                            {isLoading && (
                                <p className="text-gray-500 text-sm animate-pulse">Fetching details...</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {scannedOrder && (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{scannedOrder.user?.name || "Guest"}</h3>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Order #{scannedOrder.id.slice(-6)}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                scannedOrder.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                scannedOrder.orderStatus === 'READY' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {scannedOrder.orderStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white border rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Items
                                        </div>
                                        <div className="divide-y max-h-60 overflow-y-auto">
                                            {scannedOrder.orderItems.map((item) => (
                                                <div key={item.id} className="p-3">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-800">
                                                            {item.quantity}x {item.mealName}
                                                        </span>
                                                        <span className="text-gray-600 font-medium">
                                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(item.price) * item.quantity)}
                                                        </span>
                                                    </div>
                                                    {item.options.length > 0 && (
                                                        <div className="mt-1 pl-4 space-y-1">
                                                            {item.options.map((opt, i) => (
                                                                <div key={i} className="flex justify-between text-xs text-gray-500">
                                                                    <span>+ {opt.optionName}</span>
                                                                    <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(opt.price))}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(scannedOrder.totalAmount))}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={handleCompleteOrder}
                                            disabled={isCompleting || scannedOrder.orderStatus === 'COMPLETED'}
                                            className={`py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                                                scannedOrder.orderStatus === 'COMPLETED'
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-green-200'
                                            }`}
                                        >
                                            {isCompleting ? 'Completing...' : 'Complete Order'}
                                        </button>
                                        <button
                                            onClick={handleNextScan}
                                            className="py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-95"
                                        >
                                            Next QR Scan
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
