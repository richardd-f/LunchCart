import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Force dynamic rendering - this prevents Next.js from trying to generate the sitemap at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes (always available)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Try to fetch dynamic shop routes, but don't fail if database is unavailable
  let shopRoutes: MetadataRoute.Sitemap = [];
  
  try {
    // Fetch all shops with OPEN status for dynamic routes
    const shops = await prisma.shop.findMany({
      where: {
        status: 'OPEN',
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    shopRoutes = shops.map((shop) => ({
      url: `${BASE_URL}/shop/${shop.id}`,
      lastModified: shop.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch shops:', error);
    // Return static routes only if database is unavailable
  }

  return [...staticRoutes, ...shopRoutes];
}
