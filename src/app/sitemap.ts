import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Static routes
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

  // Dynamic shop routes
  const shopRoutes: MetadataRoute.Sitemap = shops.map((shop) => ({
    url: `${BASE_URL}/shop/${shop.id}`,
    lastModified: shop.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...shopRoutes];
}
