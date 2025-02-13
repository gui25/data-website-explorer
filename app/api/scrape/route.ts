import { NextResponse } from "next/server"
import { scrapeUrl } from "@/utils/scraper"

export async function POST(req: Request) {
  try {
    console.log("Received request")
    const { url } = await req.json()
    console.log("URL to scrape:", url)

    if (!url) {
      console.log("No URL provided")
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      console.log("Starting scrape operation")
      const scrapedData = await scrapeUrl(url)
      console.log("Scrape operation completed")
      return NextResponse.json(scrapedData)
    } catch (error) {
      console.error("Error scraping page:", error)
      return NextResponse.json(
        {
          error: "Failed to scrape page",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Invalid request:", error)
    return NextResponse.json(
      {
        error: "Invalid request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}

