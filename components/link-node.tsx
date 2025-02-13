import type React from "react"
import { Handle, Position } from "reactflow"
import { ExternalLink } from "lucide-react"

interface LinkNodeProps {
  data: {
    label: string
    url: string
  }
}

const LinkNode: React.FC<LinkNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border border-border">
      <div className="flex items-center">
        <ExternalLink className="mr-2 text-primary" />
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-primary hover:underline"
        >
          {data.label}
        </a>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  )
}

export default LinkNode

