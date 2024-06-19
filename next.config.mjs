/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    removeConsole: {
        exclude: ["error", "warn"]
    }
};

export default nextConfig;
