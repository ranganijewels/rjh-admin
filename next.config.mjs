/** @type {import('next').NextConfig} */
const nextConfig = {
  // Zero-downtime deploys: each build goes to its own release folder (set by
  // /root/deploy.sh); the live process keeps reading its previous folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",};

export default nextConfig;
