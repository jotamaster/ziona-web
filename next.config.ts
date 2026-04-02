import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/app/homes",
        destination: "/app/spaces",
        permanent: true,
      },
      {
        source: "/app/homes/:path*",
        destination: "/app/spaces/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
