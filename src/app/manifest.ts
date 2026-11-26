import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rimal LifeStyle',
    short_name: 'Rimal',
    description: "Discover Rimal Lifestyle, a men's fashion brand in Bangladesh offering premium Panjabis, shirts, trousers and timeless styles.",
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0000',
    theme_color: '#550000',
    icons: [
      {
        src: '/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
