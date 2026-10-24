export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/feed', '/feed/'],
      },
    ],
    sitemap: 'https://subbiayaveltrust.vercel.app/sitemap.xml',
  }
}
