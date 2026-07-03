'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const IN_APP_NAVIGATION_KEY = 'lunchcart:navigated';

/**
 * Marks (in sessionStorage) that the user has navigated within the app.
 *
 * Next.js soft navigations don't update `document.referrer`, so components
 * like the menu page's back button can't tell "came from the shop page" apart
 * from "opened the URL directly". This flag can: once any in-app navigation
 * happened in this tab, going back in history is guaranteed to stay in-app.
 */
export function NavigationTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // The initial page of a tab session is a direct entry, not a navigation.
      isFirstRender.current = false;
      return;
    }
    try {
      sessionStorage.setItem(IN_APP_NAVIGATION_KEY, '1');
    } catch {
      // Storage unavailable (private mode etc.) — back button falls back gracefully.
    }
  }, [pathname]);

  return null;
}
