/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    experimental: {
      serverActions: true,
      serverComponentsExternalPackages: ["mongoose"],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "img.clerk.com",
        },
        {
          protocol: "https",
          hostname: "images.clerk.dev",
        },
        {
          protocol: "https",
          hostname: "uploadthing.com",
        },
        {
          protocol: "https",
          hostname: "placehold.co",
        },
      ],
    },
  };
  
  module.exports = nextConfig;