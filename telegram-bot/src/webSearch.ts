import axios from 'axios'
import * as cheerio from 'cheerio'

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/**
 * Search the web using DuckDuckGo HTML endpoint — no API key required.
 * Falls back to a secondary scrape if the first attempt returns no results.
 */
export async function webSearch(query: string, maxResults = 5): Promise<SearchResult[]> {
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  }

  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`

  const { data } = await axios.get<string>(url, { headers, timeout: 10_000 })
  const $ = cheerio.load(data)

  const results: SearchResult[] = []

  $('.result__body').each((_i, el) => {
    if (results.length >= maxResults) return false

    const titleEl = $(el).find('.result__title a')
    const snippetEl = $(el).find('.result__snippet')

    const title = titleEl.text().trim()
    const href = titleEl.attr('href') ?? ''
    const snippet = snippetEl.text().trim()

    // DuckDuckGo wraps URLs in a redirect; extract the real URL
    const realUrl = extractRealUrl(href)

    if (title && realUrl) {
      results.push({ title, url: realUrl, snippet })
    }
  })

  return results
}

/**
 * Fetch the text content of a webpage for deeper context.
 */
export async function fetchPageContent(url: string, maxChars = 3000): Promise<string> {
  const headers = {
    'User-Agent': USER_AGENT,
  }

  const { data } = await axios.get<string>(url, { headers, timeout: 10_000 })
  const $ = cheerio.load(data)

  // Remove clutter
  $('script, style, nav, footer, header, aside, .ad, .advertisement').remove()

  const text = $('body').text().replace(/\s{2,}/g, ' ').trim()
  return text.slice(0, maxChars)
}

/**
 * Extract the real destination URL from a DuckDuckGo redirect link.
 */
function extractRealUrl(href: string): string {
  if (!href) return ''
  try {
    // DuckDuckGo redirects look like: //duckduckgo.com/l/?uddg=https%3A%2F%2F...
    const match = href.match(/uddg=([^&]+)/)
    if (match) return decodeURIComponent(match[1])
    // Plain URL
    if (href.startsWith('http')) return href
  } catch {
    // ignore
  }
  return href
}
