"use client"

import React from 'react'
import { Scanner, IDetectedBarcode, IScannerProps } from '@yudiel/react-qr-scanner'

interface QRScannerProps {
    onScan: (barcodes: IDetectedBarcode[]) => void
    onError?: (error: unknown) => void
    paused?: boolean
    overlayColor?: string
    /**
     * Target data to check for in Stage 2.
     * If provided, we can potentially use this for advanced styling, 
     * though highlighting specific QR requires access to coordinates which we get in onScan.
     */
    targetData?: string 
}

export default function QRScanner({ onScan, onError, paused = false }: QRScannerProps) {
    return (
        <div className="rounded-xl overflow-hidden shadow-md bg-black relative max-w-sm mx-auto aspect-square">
             <Scanner
                onScan={onScan}
                onError={onError}
                paused={paused}
                allowMultiple={true}
                scanDelay={500}
                styles={{
                    container: { 
                        width: '100%', 
                        height: '100%',
                    }
                }}
            />
             {paused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white z-10">
                    <span className="text-sm font-medium">Scanner Paused</span>
                </div>
            )}
        </div>
    )
}
