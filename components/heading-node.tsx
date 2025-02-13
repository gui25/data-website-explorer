"use client"

import type React from "react"
import { useState } from "react"
import { Handle, Position } from "reactflow"

interface HeadingNodeProps {
  data: {
    level: string
    text: string
    content: string
    anchor: string
    pageUrl: string
  }
}

const HeadingNode: React.FC<HeadingNodeProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    window.open(`${data.pageUrl}#${data.anchor}`, "_blank")
  }

  return (
    <div className="bg-gray-800 p-4 rounded-md max-w-md">
      <div className="cursor-pointer flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className={`text-${data.level === "h1" ? "xl" : "lg"} font-bold text-white`}>{data.text}</h3>
        <button
          className="ml-2 p-1 bg-blue-500 text-white rounded-md"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
        >
          Go to section
        </button>
      </div>
      {isExpanded && <div className="mt-2 text-sm text-gray-300">{data.content}</div>}
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
    </div>
  )
}

export default HeadingNode

