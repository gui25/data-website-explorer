import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuickJumpProps {
  headings: { level: string; text: string; anchor: string }[]
  pageUrl: string
}

const QuickJump: React.FC<QuickJumpProps> = ({ headings, pageUrl }) => {
  const handleJump = (anchor: string) => {
    window.open(`${pageUrl}#${anchor}`, "_blank")
  }

  return (
    <div>
      <Select onValueChange={handleJump}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Jump to section" />
        </SelectTrigger>
        <SelectContent>
          {headings.map((heading, index) => (
            <SelectItem key={index} value={heading.anchor}>
              {heading.text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default QuickJump

