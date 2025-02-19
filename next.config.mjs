/** @type {import('next').NextConfig} */
const nextConfig = {
  // exclude the 'worker' directory from the build
  exclude: ["worker"],
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
