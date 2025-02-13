import * as cheerio from "cheerio"

export interface ScrapedData {
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

function getBaseUrl(): string {
  // Ensure base URL always has protocol and host
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  // Fallback for server-side
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function clientScrapeUrl(url: string): Promise<ScrapedData> {
  if (!url) {
    throw new Error("URL is required")
  }

  if (!validateUrl(url)) {
    throw new Error("Invalid URL provided")
  }

  try {
    // Ensure we have a valid base URL
    const baseUrl = getBaseUrl()
    if (!validateUrl(baseUrl)) {
      throw new Error("Invalid base URL configuration")
    }

    // Construct the proxy URL using string concatenation first
    const proxyPath = `/api/proxy?url=${encodeURIComponent(url)}`
    const fullProxyUrl = baseUrl.replace(/\/$/, "") + proxyPath

    console.log("Making request to:", fullProxyUrl)

    const proxyResponse = await fetch(fullProxyUrl)
    const responseData = await proxyResponse.text()

    if (!proxyResponse.ok) {
      try {
        const errorData = JSON.parse(responseData)
        throw new Error(errorData.error || `HTTP error! status: ${proxyResponse.status}`)
      } catch (e) {
        throw new Error(`Failed to fetch URL: ${proxyResponse.status}`)
      }
    }

    if (!responseData || responseData.trim().length === 0) {
      throw new Error("Received empty response from server")
    }

    if (!responseData.includes("<")) {
      throw new Error("Invalid HTML content received")
    }

    const $ = cheerio.load(responseData)

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

    try {
      $("a").each((_, element) => {
        const link = $(element)
        const href = link.attr("href")
        const text = link.text().trim()
        if (href && text) {
          try {
            const fullUrl = new URL(href, url).toString()
            const domain = new URL(fullUrl).hostname
            pageData.links.push({ url: fullUrl, text, domain })
          } catch (e) {
            console.warn("Invalid URL:", href)
          }
        }
      })
    } catch (e) {
      console.error("Error extracting links:", e)
    }

    try {
      $("img").each((_, element) => {
        const img = $(element)
        const src = img.attr("src")
        if (src) {
          try {
            const fullSrc = new URL(src, url).toString()
            const alt = img.attr("alt")?.trim() || ""
            pageData.images.push({ src: fullSrc, alt })
          } catch (e) {
            console.warn("Invalid image URL:", src)
          }
        }
      })
    } catch (e) {
      console.error("Error extracting images:", e)
    }

    try {
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
    } catch (e) {
      console.error("Error extracting headings:", e)
    }

    try {
      $("p").each((_, element) => {
        const text = $(element).text().trim()
        if (text) {
          pageData.paragraphs.push(text)
        }
      })
    } catch (e) {
      console.error("Error extracting paragraphs:", e)
    }

    try {
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
    } catch (e) {
      console.error("Error calculating word frequency:", e)
    }

    return pageData
  } catch (error) {
    console.error("Error in clientScrapeUrl:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

