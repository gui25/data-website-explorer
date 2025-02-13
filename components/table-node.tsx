import type React from "react"
import { memo, useState } from "react"
import { Handle, Position } from "reactflow"
import { GripVertical, Copy, Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Column {
  name: string
  type: string
  value: string
  text?: string
  domain?: string
  content?: string
  anchor?: string
}

interface TableNodeProps {
  data: {
    label: string
    columns: Column[]
  }
}

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "url":
      return "text-green-400"
    case "text":
      return "text-orange-400"
    default:
      return "text-gray-400"
  }
}

const TableNode: React.FC<TableNodeProps> = memo(({ data }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  return (
    <div className="min-w-[240px] max-w-[400px] bg-gray-900 border border-gray-800 shadow-lg rounded-md overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="font-semibold text-lg text-gray-200">{data.label}</div>
        <GripVertical className="text-gray-500 w-4 h-4 cursor-move" />
      </div>
      <div className="divide-y divide-gray-800 max-h-[300px] overflow-y-auto">
        {data.columns.map((column, index) => (
          <div key={index} className="px-4 py-2 flex flex-col relative">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 font-mono">{column.name}</span>
              <span className={`text-xs font-mono ${getTypeColor(column.type)}`}>{column.type}</span>
            </div>
            <div className="flex items-center justify-between">
              {column.type === "url" ? (
                <a
                  href={column.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline truncate mr-2"
                >
                  {column.text || column.value}
                </a>
              ) : (
                <span className="text-sm text-gray-300 truncate mr-2">{column.value}</span>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCopy(column.value, index)}
                      className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copiedIndex === index ? "Copied!" : "Copy to clipboard"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {column.content && <span className="text-xs text-gray-500 mt-1 truncate">{column.content}</span>}
          </div>
        ))}
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500" />
    </div>
  )
})

TableNode.displayName = "TableNode"

export default TableNode

