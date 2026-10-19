/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the floating dev badge away from the sidebar's account/theme footer
  // (bottom-left), where it covered real UI while developing.
  devIndicators: { position: "bottom-right" },
  // Zero-downtime deploys: each build goes to its own release folder (set by
  // /root/deploy.sh); the live process keeps reading its previous folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",};

export default nextConfig;
