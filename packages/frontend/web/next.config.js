const withImages = require('next-images')

const rawApiUri = process.env?.API_URI || 'http://localhost:4001'
const baseURL = /^https?:\/\//i.test(rawApiUri)
  ? rawApiUri
  : `https://${rawApiUri}`

module.exports = withImages({
  swcMinify: true,
  esModule: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  env: {
    baseURL,
    siteKey: process.env?.HCAPTCHA_SITEKEY,
    sheetPass: process.env.SHEET_PASSWORD || '',
  },
  images: {
    domains: [
      'localhost',
      '*.cloudflare.net',
      '*.amazonaws.com',
      '*.azure.net',
    ],
  },
  async redirects() {
    return [
      {
        source: '/certificados',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/',
        destination: '/participants/login',
        permanent: true,
      },
    ]
  },
})
