import type React from "react"
import { memo } from "react"
import { Handle, Position } from "reactflow"
import { GripVertical } from "lucide-react"

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  relatedCollection?: string
}

interface TableNodeProps {
  data: {
    label: string
    columns: Column[]
  }
}

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "int":
      return "text-yellow-400"
    case "varchar":
    case "text":
      return "text-orange-400"
    case "datetime":
    case "date":
      return "text-cyan-400"
    case "json":
      return "text-purple-400"
    case "url":
      return "text-green-400"
    case "relation":
      return "text-blue-400"
    default:
      return "text-gray-400"
  }
}

const TableNode: React.FC<TableNodeProps> = memo(({ data }) => {
  return (
    <div className="min-w-[240px] bg-gray-900 border border-gray-800 shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="font-semibold text-lg text-gray-200">{data.label}</div>
        <GripVertical className="text-gray-500 w-4 h-4 cursor-move" />
      </div>

      {/* Table rows */}
      <div className="divide-y divide-gray-800">
        {data.columns.map((column, index) => (
          <div key={index} className="px-4 py-2 flex items-center justify-between relative">
            <span className="text-sm text-gray-400 font-mono">{column.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono ${getTypeColor(column.type)}`}>{column.type}</span>
            </div>
            {column.type === "relation" && (
              <>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${column.name}-right`}
                  className="!absolute !bg-blue-500 w-2 h-2"
                  style={{ right: "-5px" }}
                />
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${column.name}-left`}
                  className="!absolute !bg-blue-500 w-2 h-2"
                  style={{ left: "-5px" }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

TableNode.displayName = "TableNode"

export default TableNode

