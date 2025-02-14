"use client"

import type React from "react"
import { useState } from "react"
import DatabaseVisualizer from "../components/database-visualizer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { clientScrapeUrl, type ScrapedData } from "@/utils/clientScraper"

const Home: React.FC = () => {
  const [url, setUrl] = useState("")
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleScrape = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Starting scrape for URL:", url)
      const data = await clientScrapeUrl(url)
      console.log("Scrape completed successfully")
      setScrapedData(data)
    } catch (err) {
      console.error("Scraping error details:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred while extracting data from the page.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card p-6 rounded-lg shadow-md border custom-border">
          <h2 className="text-2xl font-semibold mb-4 custom-text">Uncover Web Data Insights</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <Input
              type="url"
              placeholder="Enter URL to extract data"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow bg-background/50 border-indigo-300 dark:border-indigo-700"
            />
            <Button
              onClick={handleScrape}
              disabled={isLoading}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? "Extracting Data..." : "Extract and Visualize"}
            </Button>
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!scrapedData && !error && (
          <div className="text-center p-8 bg-card rounded-lg border custom-border">
            <Info className="mx-auto h-12 w-12 text-indigo-400" />
            <h2 className="mt-2 text-xl font-semibold custom-text">Ready to Explore the Data Website</h2>
            <p className="mt-1 text-muted-foreground">
              Enter a URL and click &quot;Extract and Visualize&quot; to begin your data exploration journey
            </p>
          </div>
        )}
      </div>
      {scrapedData && (
        <div className="mt-8">
          <DatabaseVisualizer data={scrapedData} />
        </div>
      )}
    </div>
  )
}

export default Home

