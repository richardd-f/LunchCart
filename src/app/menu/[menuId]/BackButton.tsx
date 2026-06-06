'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()

    const handleBack = () => {
        // If the user navigated here from another in-app page, the browser
        // history already points to it (shop page, homepage, etc.), so a plain
        // back() lands them exactly where they came from.
        const cameFromSameOrigin =
            typeof document !== 'undefined' &&
            document.referrer &&
            new URL(document.referrer).origin === window.location.origin

        if (cameFromSameOrigin && window.history.length > 1) {
            router.back()
        } else {
            // Direct visit or external referrer: fall back to the homepage.
            router.push('/')
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
