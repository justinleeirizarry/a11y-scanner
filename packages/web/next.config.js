/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@accessibility-toolkit/core',
        '@accessibility-toolkit/ai-auditor',
    ],
};

export default nextConfig;
