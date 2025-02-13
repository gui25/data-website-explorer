"use client"

import type React from "react"
import { useState } from "react"
import { Handle, Position } from "reactflow"
import Image from "next/image"

interface ImageNodeProps {
  data: {
    src: string
    alt: string
  }
}

const ImageNode: React.FC<ImageNodeProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-gray-800 p-2 rounded-md">
      <div className="relative w-48 h-48 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <Image
          src={data.src || "/placeholder.svg"}
          alt={data.alt}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <p className="text-xs mt-2 text-center text-gray-300">{data.alt}</p>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-4xl">
            <Image
              src={data.src || "/placeholder.svg"}
              alt={data.alt}
              layout="intrinsic"
              width={800}
              height={600}
              objectFit="contain"
              className="rounded-md"
            />
          </div>
        </div>
      )}
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
    </div>
  )
}

export default ImageNode

