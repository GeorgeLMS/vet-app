import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'VetApp',
        short_name: 'VetApp',
        description: 'Gestión de clínica veterinaria',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#f3f4f6',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/apple-icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
