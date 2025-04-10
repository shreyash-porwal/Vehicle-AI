/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ymqpkygmownybanldbpq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "jwhjsvlrrmcyiqjwvnzr.supabase.co", // ✅ Added this
      },
    ],
  },
};

export default nextConfig;
