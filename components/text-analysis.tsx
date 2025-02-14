import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart2, Book, Hash, Type } from "lucide-react"

interface TextAnalysisProps {
  data: {
    paragraphs: string[]
    headings: { level: string; text: string; content: string }[]
    wordFrequency: { [key: string]: number }
  }
}

const TextAnalysis: React.FC<TextAnalysisProps> = ({ data }) => {
  const getTextContent = () => {
    const headingContent = data.headings.map((heading) => `${heading.text} ${heading.content}`).join(" ")
    const paragraphContent = data.paragraphs.join(" ")
    return `${headingContent} ${paragraphContent}`
  }

  const getWordFrequency = (text: string) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    return words.reduce(
      (acc, word) => {
        if (word.length > 1) {
          acc[word] = (acc[word] || 0) + 1
        }
        return acc
      },
      {} as { [key: string]: number },
    )
  }

  const textContent = getTextContent()
  const filteredWordFrequency = getWordFrequency(textContent)

  const totalWords = Object.values(filteredWordFrequency).reduce((sum, count) => sum + count, 0)
  const uniqueWords = Object.keys(filteredWordFrequency).length
  const averageWordLength = Object.keys(filteredWordFrequency).reduce((sum, word) => sum + word.length, 0) / uniqueWords
  const mostCommonWords = Object.entries(filteredWordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const readingTime = Math.ceil(totalWords / 200) // Assuming average reading speed of 200 words per minute

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Words</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWords}</div>
          <p className="text-xs text-muted-foreground">{readingTime} min read</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Words</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueWords}</div>
          <Progress value={(uniqueWords / totalWords) * 100} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Word Length</CardTitle>
          <Type className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageWordLength.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">characters</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Common Words</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {mostCommonWords.map(([word, count]) => (
              <li key={word} className="text-sm">
                <span className="font-medium">{word}</span>: {count}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default TextAnalysis

