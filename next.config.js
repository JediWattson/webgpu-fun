/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: config => {
        config.module.rules.push({
            test: /\.wgsl$/i,
            use: 'raw-loader',
        });
        return config;
    }
}

module.exports = nextConfig
