/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@napi-rs/canvas", "tesseract.js", "pdfjs-dist", "pdf-parse"],
  },
};

module.exports = nextConfig;
