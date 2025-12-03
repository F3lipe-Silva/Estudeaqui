/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true, // Recomendado para exportação estática com Capacitor
    },
    output: 'export', // Habilita a exportação estática
    webpack: (config, { isServer }) => {
        // This is to solve the 'fs' module not found error in browser builds
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                async_hooks: false,
                handlebars: false, // Adicionar para evitar erro no cliente
            };
        }

        return config;
    }
};

export default nextConfig;
