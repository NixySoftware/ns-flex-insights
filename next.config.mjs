import createNextIntlPlugin from 'next-intl/plugin';

import './src/env.mjs';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        webpackBuildWorker: true
    },
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false
        };
        return config;
    }
};

export default withNextIntl(nextConfig);
