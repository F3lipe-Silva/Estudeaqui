/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Adiciona fallbacks para módulos do Node.js que não devem ser incluídos no bundle do cliente.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        async_hooks: false,
      };
    }

    return config;
  },
};

export default nextConfig;
