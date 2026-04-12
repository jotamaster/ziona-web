import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  // Default dynamicStartUrl injects an async cacheWillUpdate; workbox serializes it
  // with SWC helpers (_async_to_generator) that are not defined in the SW → runtime error and broken navigations (e.g. after OAuth).
  dynamicStartUrl: false,
});

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

export default withPWA(nextConfig);
