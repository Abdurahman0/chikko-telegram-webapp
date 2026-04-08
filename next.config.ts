import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["nonofficinal-brent-telepathic.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chikko.api.cognilabs.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
