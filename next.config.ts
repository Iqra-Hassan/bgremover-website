import type { NextConfig } from 'next';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is not set');
}

if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is not set');
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    resolveAlias: {
      canvas: './empty.js',
    },
  },
  webpack: (config) => {
    // Remove the 'canvas' module from the webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    // Add a fallback for 'canvas' to an empty module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };

    return config;
  },
  redirects: async () => {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/admin/settings',
        destination: '/admin/settings/general',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
