"use client"

import type React from "react"
import { useState, useCallback } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow"
import "reactflow/dist/style.css"
import TableNode from "./table-node"

const nodeTypes: NodeTypes = {
  table: TableNode,
}

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  relatedCollection?: string
}

interface Table {
  name: string
  columns: Column[]
}

interface DatabaseVisualizerProps {
  data: Table[]
}

const defaultEdgeOptions = {
  type: "smoothstep",
  style: { stroke: "#3b82f6", strokeWidth: 1.5 },
  animated: true,
}

const DatabaseVisualizer: React.FC<DatabaseVisualizerProps> = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  useState(() => {
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const spacing = { x: 320, y: 250 }
    const startPos = { x: 50, y: 50 }

    // Create nodes first
    data.forEach((table, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3

      newNodes.push({
        id: table.name,
        type: "table",
        position: {
          x: startPos.x + col * spacing.x,
          y: startPos.y + row * spacing.y,
        },
        data: { label: table.name, columns: table.columns },
      })
    })

    // Create edges for relations
    data.forEach((sourceTable) => {
      sourceTable.columns.forEach((column) => {
        if (column.type === "relation" && column.relatedCollection) {
          newEdges.push({
            id: `${sourceTable.name}-${column.name}-${column.relatedCollection}`,
            source: sourceTable.name,
            target: column.relatedCollection,
            sourceHandle: `${column.name}-right`,
            targetHandle: `${column.name}-left`,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 1.5 },
            labelStyle: { fill: "#9CA3AF", fontSize: 12 },
            labelBgStyle: { fill: "#1F2937" },
          })
        }
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [data, setNodes, setEdges])

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111827" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1f2937" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

export default DatabaseVisualizer

