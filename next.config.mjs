/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Excluir módulos de MongoDB del bundle del cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'util/types': false,
      }
      
      config.externals = config.externals || []
      config.externals.push({
        'mongodb': 'mongodb',
        'mongodb-client-encryption': 'mongodb-client-encryption',
        '@mongodb-js/zstd': '@mongodb-js/zstd',
        '@napi-rs/snappy-win32-x64-msvc': '@napi-rs/snappy-win32-x64-msvc',
        'kerberos': 'kerberos',
      })
    }
    return config
  },
}

export default nextConfig
