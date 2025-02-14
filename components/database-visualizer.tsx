"use client"

import React, { useCallback, useState, useMemo } from "react"
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"
import TableNode from "./table-node"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import QuickJump from "./quick-jump"
import TextAnalysis from "./text-analysis"
import { Download, ChevronDown, ChevronUp, AlignLeft } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"

const nodeTypes = { table: TableNode }

interface ScrapedData {
  url: string
  title: string
  description: string
  links: { url: string; text: string; domain: string }[]
  images: { src: string; alt: string }[]
  headings: { level: string; text: string; content: string; anchor: string }[]
  paragraphs: string[]
  metadata: {
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterCard: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
  }
  wordFrequency: { [key: string]: number }
}

interface DatabaseVisualizerProps {
  data: ScrapedData
}

const Flow: React.FC<DatabaseVisualizerProps> = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowInstance = useReactFlow()
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("default")
  const [isTextAnalysisOpen, setIsTextAnalysisOpen] = useState(true)

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const filteredNodes = useMemo(() => {
    const filtered = nodes
      .map((node) => {
        if (filter !== "all" && node.data.label.toLowerCase() !== filter) {
          return null
        }

        const searchLower = search.toLowerCase()

        // Filter columns based on search term
        const filteredColumns = node.data.columns.filter((col: any) => {
          return (
            col.name.toLowerCase().includes(searchLower) ||
            col.value?.toLowerCase().includes(searchLower) ||
            col.text?.toLowerCase().includes(searchLower) ||
            col.content?.toLowerCase().includes(searchLower)
          )
        })

        // If there are matching columns or the node label matches, return the node with filtered columns
        if (filteredColumns.length > 0 || node.data.label.toLowerCase().includes(searchLower)) {
          return {
            ...node,
            data: {
              ...node.data,
              columns: filteredColumns,
            },
          }
        }

        return null
      })
      .filter(Boolean) // Remove null nodes

    if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.data.label.localeCompare(b.data.label))
    } else if (sortBy === "size") {
      filtered.sort((a, b) => b.data.columns.length - a.data.columns.length)
    }

    return filtered
  }, [nodes, filter, search, sortBy])

  React.useEffect(() => {
    if (data) {
      const newNodes = [
        {
          id: "page",
          type: "table",
          position: { x: 0, y: 0 },
          data: {
            label: "Page Info",
            columns: [
              { name: "URL", type: "url", value: data.url },
              { name: "Title", type: "text", value: data.title },
              { name: "Description", type: "text", value: data.description },
            ],
          },
        },
        {
          id: "links",
          type: "table",
          position: { x: 400, y: 0 },
          data: {
            label: "Links",
            columns: data.links.map((link, index) => ({
              name: `Link ${index + 1}`,
              type: "url",
              value: link.url,
              text: link.text,
              domain: link.domain,
            })),
          },
        },
        {
          id: "images",
          type: "table",
          position: { x: 0, y: 300 },
          data: {
            label: "Images",
            columns: data.images.map((image, index) => ({
              name: `Image ${index + 1}`,
              type: "url",
              value: image.src,
              text: image.alt,
            })),
          },
        },
        {
          id: "headings",
          type: "table",
          position: { x: 400, y: 300 },
          data: {
            label: "Headings",
            columns: data.headings.map((heading, index) => ({
              name: `H${heading.level}`,
              type: "text",
              value: heading.text,
              content: heading.content,
              anchor: heading.anchor,
            })),
          },
        },
        {
          id: "metadata",
          type: "table",
          position: { x: 800, y: 0 },
          data: {
            label: "Metadata",
            columns: Object.entries(data.metadata).map(([key, value]) => ({
              name: key,
              type: "text",
              value: value as string,
            })),
          },
        },
      ]

      const newEdges = [
        { id: "page-links", source: "page", target: "links", animated: true, label: "contains" },
        { id: "page-images", source: "page", target: "images", animated: true, label: "displays" },
        { id: "page-headings", source: "page", target: "headings", animated: true, label: "contains" },
        { id: "page-metadata", source: "page", target: "metadata", animated: true, label: "has" },
      ]

      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [data, setNodes, setEdges])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true })
    }, 100)
    return () => clearTimeout(timer)
  }, [reactFlowInstance])

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "scraped_data.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Collapsible open={isTextAnalysisOpen} onOpenChange={setIsTextAnalysisOpen} className="w-full mb-4">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card text-card-foreground rounded-t-md">
          <div className="flex items-center">
            <AlignLeft className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Text Analysis</h3>
          </div>
          {isTextAnalysisOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 bg-card text-card-foreground rounded-b-md">
          <TextAnalysis data={data} />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-card p-4 rounded-md">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-2 md:mb-0">
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="page info">Page Info</SelectItem>
              <SelectItem value="links">Links</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="headings">Headings</SelectItem>
              <SelectItem value="metadata">Metadata</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setSortBy} defaultValue="default">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-48"
          />
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <Button onClick={handleExportJSON} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <QuickJump headings={data.headings} pageUrl={data.url} />
        </div>
      </div>
      <div className="flex-grow min-h-[600px] relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#4f46e5" gap={16} />
        </ReactFlow>
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => reactFlowInstance.fitView()}
            className="bg-background/50 hover:bg-background/80"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => reactFlowInstance.zoomIn()}
            className="bg-background/50 hover:bg-background/80"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => reactFlowInstance.zoomOut()}
            className="bg-background/50 hover:bg-background/80"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const DatabaseVisualizer: React.FC<DatabaseVisualizerProps> = (props) => (
  <ReactFlowProvider>
    <Flow {...props} />
  </ReactFlowProvider>
)

export default DatabaseVisualizer

