/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true, // Disable ESLint during build
    }
};

export default nextConfig;
