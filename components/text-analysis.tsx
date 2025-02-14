import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart2, Book, Hash, Type } from "lucide-react"

interface TextAnalysisProps {
  data: {
    paragraphs: string[]
    wordFrequency: { [key: string]: number }
  }
}

const TextAnalysis: React.FC<TextAnalysisProps> = ({ data }) => {
  const totalWords = data.paragraphs.join(" ").split(/\s+/).length
  const uniqueWords = Object.keys(data.wordFrequency).length
  const averageWordLength = Object.keys(data.wordFrequency).reduce((sum, word) => sum + word.length, 0) / uniqueWords
  const mostCommonWords = Object.entries(data.wordFrequency)
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

