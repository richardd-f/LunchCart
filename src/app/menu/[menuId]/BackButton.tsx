'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { IN_APP_NAVIGATION_KEY } from '@/components/NavigationTracker'

interface BackButtonProps {
    /** Shop the menu belongs to — the fallback target when there is no in-app history. */
    shopId: string
}

export default function BackButton({ shopId }: BackButtonProps) {
    const router = useRouter()

    const handleBack = () => {
        // `document.referrer` is not set on Next.js soft navigations, so we rely
        // on the NavigationTracker flag: it's only set after an in-app navigation
        // happened in this tab, which means history points to an in-app page.
        let hasInAppHistory = false
        try {
            hasInAppHistory = sessionStorage.getItem(IN_APP_NAVIGATION_KEY) === '1'
        } catch {
            // Storage unavailable — treat as direct visit.
        }

        if (hasInAppHistory && window.history.length > 1) {
            router.back()
        } else {
            // Direct visit / external link: go to the menu's shop page.
            router.push(`/shop/${shopId}`)
        }
    }

    return (
        <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm text-gray-700 hover:bg-white transition-all"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
    )
}
