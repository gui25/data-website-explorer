"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatJSON } from "../utils/json-formatter"
import { placeholderSchema } from "../utils/placeholder-schema"

interface JsonInputSheetProps {
  onJsonSubmit: (json: string) => void
}

const JsonInputSheet: React.FC<JsonInputSheetProps> = ({ onJsonSubmit }) => {
  const [jsonInput, setJsonInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value)
  }

  const handleSubmit = () => {
    onJsonSubmit(jsonInput || formatJSON(JSON.stringify(placeholderSchema)))
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      setJsonInput("")
    }
  }, [isOpen])

  const placeholderText = formatJSON(JSON.stringify(placeholderSchema))

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="json-editor-button bg-[#4a4a4a] text-white hover:bg-[#4a4a4a]/90">Open JSON Editor</Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="json-editor-sheet w-[400px] sm:w-[540px] md:w-[720px] bg-[#1a1a1a] text-white flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Edit JSON Schema</SheetTitle>
          <SheetDescription className="text-[#808080]">
            Paste or edit your pocketbase JSON schema here. Click 'Visualize Schema' when you're ready to see the
            database structure.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden">
            <Textarea
              value={jsonInput}
              onChange={handleJsonChange}
              className="json-editor-textarea w-full h-full p-2 text-sm font-mono resize-none bg-[#2a2a2a] text-white border-[#4a4a4a] overflow-auto no-scrollbar placeholder-[#4a4a4a]"
              placeholder={placeholderText}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="visualize-button mt-4 bg-[#1371ff] text-white hover:bg-[#1371ff]/90"
          >
            Visualize Schema
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default JsonInputSheet

