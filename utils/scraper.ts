import * as cheerio from "cheerio"
import { parse } from "url"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface ScrapedData {
  url: string
  title: string
  description: string
  links: { url: string; text: string; domain: string }[]
  images: { src: string; alt: string }[]
  headings: { level: string; text: string; content: string; anchor: string }[]
  paragraphs: string[]
  metadata: {
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterCard: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
  }
  wordFrequency: { [key: string]: number }
}

function shouldIncludeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    const skipPatterns = [
      "/w/",
      "Special:",
      "File:",
      "Category:",
      "Help:",
      "Template:",
      "Wikipedia:",
      "action=",
      "oldid=",
      "diff=",
      "redlink=1",
      "edit",
    ]
    return !skipPatterns.some((pattern) => parsedUrl.pathname.includes(pattern))
  } catch {
    return false
  }
}

function getAllLinks($: cheerio.CheerioAPI, baseUrl: string): { url: string; text: string; domain: string }[] {
  const links: { url: string; text: string; domain: string }[] = []
  const seenUrls = new Set<string>()

  $("a").each((_, element) => {
    const link = $(element)
    const href = link.attr("href")
    if (href && !seenUrls.has(href)) {
      try {
        const fullUrl = href.startsWith("http") ? href : new URL(href, baseUrl).toString()
        if (shouldIncludeUrl(fullUrl)) {
          const domain = parse(fullUrl).hostname || ""
          const text = link.text().trim()
          if (text && fullUrl) {
            links.push({ url: fullUrl, text, domain })
            seenUrls.add(href)
          }
        }
      } catch (e) {
        console.warn("Invalid URL:", href)
      }
    }
  })

  return links
}

export async function scrapeUrl(url: string, maxRetries = 3): Promise<ScrapedData> {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const proxyBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      const proxyUrl = new URL("/api/proxy", proxyBaseUrl)
      console.log("Base URL:", proxyBaseUrl)
      console.log("Proxy URL:", proxyUrl.toString())
      const response = await fetch(proxyUrl.toString())

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`)
      }

      const html = await response.text()
      if (!html || html.trim().length === 0) {
        throw new Error("Empty response received")
      }

      const $ = cheerio.load(html, {
        decodeEntities: true,
        xmlMode: false,
      })

      const parsedUrl = parse(url)
      const baseUrl = parsedUrl.protocol + "//" + parsedUrl.host

      // Remove unwanted elements
      $("script, style, .noprint, .reference, .error").remove()

      const pageData: ScrapedData = {
        url,
        title: $("title").text().trim() || "Untitled",
        description: $('meta[name="description"]').attr("content")?.trim() || "",
        links: [],
        images: [],
        headings: [],
        paragraphs: [],
        metadata: {
          ogTitle: $('meta[property="og:title"]').attr("content")?.trim() || "",
          ogDescription: $('meta[property="og:description"]').attr("content")?.trim() || "",
          ogImage: $('meta[property="og:image"]').attr("content")?.trim() || "",
          twitterCard: $('meta[name="twitter:card"]').attr("content")?.trim() || "",
          twitterTitle: $('meta[name="twitter:title"]').attr("content")?.trim() || "",
          twitterDescription: $('meta[name="twitter:description"]').attr("content")?.trim() || "",
          twitterImage: $('meta[name="twitter:image"]').attr("content")?.trim() || "",
        },
        wordFrequency: {},
      }

      // Get all links
      pageData.links = getAllLinks($, parsedUrl.protocol + "//" + parsedUrl.host)

      // Extract images
      $("img").each((_, element) => {
        const img = $(element)
        const src = img.attr("src")
        if (src && !src.includes("Special:")) {
          try {
            const fullSrc = src.startsWith("http")
              ? src
              : new URL(src, parsedUrl.protocol + "//" + parsedUrl.host).toString()
            const alt = img.attr("alt")?.trim() || ""
            pageData.images.push({ src: fullSrc, alt })
          } catch (e) {
            console.warn("Invalid image URL:", src)
          }
        }
      })

      // Extract headings and content
      $("h1, h2, h3, h4, h5, h6").each((_, element) => {
        const heading = $(element)
        const level = element.name
        const text = heading.text().trim()
        if (text) {
          const anchor = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")

          let content = ""
          let next = heading.next()
          while (next.length && !next.is("h1, h2, h3, h4, h5, h6")) {
            if (next.is("p, ul, ol")) {
              content += next.text().trim() + " "
            }
            next = next.next()
          }

          pageData.headings.push({
            level,
            text,
            content: content.trim(),
            anchor,
          })
        }
      })

      // Extract paragraphs
      $("p").each((_, element) => {
        const text = $(element).text().trim()
        if (text) {
          pageData.paragraphs.push(text)
        }
      })

      // Calculate word frequency
      const words =
        $("body")
          .text()
          .toLowerCase()
          .match(/\b\w+\b/g) || []

      words.forEach((word) => {
        if (word.length > 1) {
          pageData.wordFrequency[word] = (pageData.wordFrequency[word] || 0) + 1
        }
      })

      return pageData
    } catch (error) {
      console.error(`Error scraping ${url}:`, error)
      retries++
      if (retries >= maxRetries) {
        throw error
      }
      await delay(Math.pow(2, retries) * 1000) // Exponential backoff
    }
  }

  throw new Error(`Failed to scrape ${url} after ${maxRetries} retries`)
}

