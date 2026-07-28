import { createFileRoute } from '@tanstack/react-router'

const BASE_URL = '' // TODO: replace with your project URL once a project name or custom domain is set

const pages: Array<{ path: string; changefreq: string; priority: number }> = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const lastmod = new Date().toISOString().split('T')[0]
        const urls = pages
          .map(
            ({ path, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
          )
          .join('')

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})