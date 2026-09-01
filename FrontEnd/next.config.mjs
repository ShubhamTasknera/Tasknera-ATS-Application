import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.DIST_DIR || '.next',
  reactStrictMode: true,
  typescript: {

    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ];
  },
  webpack(
    config,
    {
      dev: dev,
      isServer,
    }
  ) {
    if (isServer) {
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.afterEmit.tap('EnsurePagesManifest', () => {
            try {
              import('fs').then(fs => {
                import('path').then(path => {
                  const serverDir = path.resolve('.next/server');
                  if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });
                  const manifestPath = path.join(serverDir, 'pages-manifest.json');
                  if (!fs.existsSync(manifestPath)) {
                    fs.writeFileSync(manifestPath, JSON.stringify({}));
                  }
                });
              });
            } catch {}
          });
        }
      });
    }

    if (dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
      const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      config.watchOptions = {
        ignored: ignoredPaths.length
          ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
          : undefined,
      };
    }
    return config;
  },
};


export default nextConfig;
