import axios, { type AxiosInstance } from "axios"
import * as cheerio from "cheerio"
import { parse } from "url"
import ProxyChain from "proxy-chain"

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
]

const PROXY_LIST = [
  "http://proxy1.example.com:8080",
  "http://proxy2.example.com:8080",
  "http://proxy3.example.com:8080",
]

class EnhancedScraper {
  private axiosInstance: AxiosInstance
  private proxyIndex = 0
  private userAgentIndex = 0

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
    })
  }

  private async rotateProxy(): Promise<void> {
    const oldProxyUrl = PROXY_LIST[this.proxyIndex]
    this.proxyIndex = (this.proxyIndex + 1) % PROXY_LIST.length
    const newProxyUrl = PROXY_LIST[this.proxyIndex]

    const newProxy = await ProxyChain.anonymizeProxy(newProxyUrl)
    this.axiosInstance.defaults.proxy = {
      host: parse(newProxy).hostname!,
      port: Number(parse(newProxy).port),
    }

    console.log(`Rotated proxy from ${oldProxyUrl} to ${newProxyUrl}`)
  }

  private rotateUserAgent(): void {
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length
    this.axiosInstance.defaults.headers["User-Agent"] = USER_AGENTS[this.userAgentIndex]
    console.log(`Rotated User-Agent to ${USER_AGENTS[this.userAgentIndex]}`)
  }

  private async retryWithBackoff(fn: () => Promise<any>, maxRetries = 5): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
        console.log(`Request failed, retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        await this.rotateProxy()
        this.rotateUserAgent()
      }
    }
  }

  async scrapeUrl(url: string, depth = 0): Promise<any> {
    return this.retryWithBackoff(async () => {
      const response = await this.axiosInstance.get(url)
      const html = response.data
      const $ = cheerio.load(html)

      const baseUrl = parse(url).protocol + "//" + parse(url).host

      const pageData = {
        url,
        title: $("title").text(),
        description: $('meta[name="description"]').attr("content") || "",
        links: [] as { url: string; text: string; domain: string }[],
        images: [] as { src: string; alt: string }[],
        headings: [] as { level: string; text: string; content: string; anchor: string }[],
        paragraphs: [] as string[],
        metadata: {
          ogTitle: $('meta[property="og:title"]').attr("content") || "",
          ogDescription: $('meta[property="og:description"]').attr("content") || "",
          ogImage: $('meta[property="og:image"]').attr("content") || "",
          twitterCard: $('meta[name="twitter:card"]').attr("content") || "",
          twitterTitle: $('meta[name="twitter:title"]').attr("content") || "",
          twitterDescription: $('meta[name="twitter:description"]').attr("content") || "",
          twitterImage: $('meta[name="twitter:image"]').attr("content") || "",
        },
        wordFrequency: {} as { [key: string]: number },
      }

      $("a").each((_, element) => {
        const link = $(element)
        const href = link.attr("href")
        if (href) {
          const fullUrl = href.startsWith("http") ? href : new URL(href, baseUrl).toString()
          const domain = parse(fullUrl).hostname || ""
          pageData.links.push({
            url: fullUrl,
            text: link.text().trim(),
            domain,
          })
        }
      })

      $("img").each((_, element) => {
        const img = $(element)
        const src = img.attr("src")
        if (src) {
          pageData.images.push({
            src: src.startsWith("http") ? src : new URL(src, baseUrl).toString(),
            alt: img.attr("alt") || "",
          })
        }
      })

      $("h1, h2, h3, h4, h5, h6").each((_, element) => {
        const heading = $(element)
        const level = element.name
        const text = heading.text().trim()
        const anchor = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
        let content = ""
        let next = heading.next()
        while (next.length && !next.is("h1, h2, h3, h4, h5, h6")) {
          content += next.is("img") ? "[Image] " : next.text().trim() + " "
          next = next.next()
        }
        pageData.headings.push({ level, text, content: content.trim(), anchor })
      })

      $("p").each((_, element) => {
        pageData.paragraphs.push($(element).text().trim())
      })

      const words =
        $("body")
          .text()
          .toLowerCase()
          .match(/\b\w+\b/g) || []
      words.forEach((word) => {
        pageData.wordFrequency[word] = (pageData.wordFrequency[word] || 0) + 1
      })

      if (depth > 0) {
        pageData.subpages = await Promise.all(
          pageData.links.slice(0, 5).map((link) => this.scrapeUrl(link.url, depth - 1)),
        )
      }

      return pageData
    })
  }
}

export default EnhancedScraper

