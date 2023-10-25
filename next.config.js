/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false
        };
        return config;
    }
};

module.exports = withNextIntl(nextConfig);
