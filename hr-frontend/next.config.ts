import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Eklentiyi başlat
const withNextIntl = createNextIntlPlugin();

// Mevcut Next.js ayarların burada duracak
const nextConfig: NextConfig = {
  /* config options here */
  // Örn: reactStrictMode: true,
};

// Config'i sarmalayarak dışa aktar
export default withNextIntl(nextConfig);