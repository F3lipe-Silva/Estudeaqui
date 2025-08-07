/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // This is to solve the 'fs' module not found error in browser builds
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                async_hooks: false,
            };
        }

        return config;
    }
};

export default nextConfig;
