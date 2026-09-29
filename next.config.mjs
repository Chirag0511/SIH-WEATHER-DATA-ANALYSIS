/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com", "api.placeholder.com"],
  },
};

export default nextConfig;
