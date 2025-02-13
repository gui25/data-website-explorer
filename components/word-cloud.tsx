import type React from "react"
import { TagCloud } from "react-tagcloud"

interface WordCloudProps {
  words: { [key: string]: number }
}

const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const data = Object.entries(words)
    .map(([key, value]) => ({ value: key, count: value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)

  return (
    <div className="bg-gray-800 p-4 rounded-md mt-4">
      <h2 className="text-xl font-bold mb-2">Word Frequency</h2>
      <TagCloud
        minSize={12}
        maxSize={35}
        tags={data}
        className="text-center"
        onClick={(tag: { value: string; count: number }) => console.log(`'${tag.value}' was selected!`)}
      />
    </div>
  )
}

export default WordCloud

