/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    compiler: {
        removeConsole: {
            exclude: ['error', 'warning']
        },
    }
};

export default nextConfig;
