import type React from "react"

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

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Text Analysis</h3>
      <ul className="space-y-2">
        <li>Total words: {totalWords}</li>
        <li>Unique words: {uniqueWords}</li>
        <li>Average word length: {averageWordLength.toFixed(2)} characters</li>
        <li>
          Most common words:
          <ul className="list-disc list-inside">
            {mostCommonWords.map(([word, count]) => (
              <li key={word}>
                {word}: {count} times
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  )
}

export default TextAnalysis

