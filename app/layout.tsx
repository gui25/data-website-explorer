import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Network, Github } from "lucide-react"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DataWebsite Explorer",
  description: "Advanced web data extraction and visualization platform",
  authors: [{ name: "Guilherme Bernardo Silva", url: "https://github.com/gui25" }],
  creator: "gui25",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="h-14 px-4 bg-gradient-to-r from-[#7c3aed] via-[#c026d3] to-[#ec4899] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] via-[#c026d3] to-[#ec4899] opacity-0 hover:opacity-100 transition-opacity duration-700 bg-[size:200%] animate-gradient"></div>
            <div className="h-full max-w-[1400px] mx-auto flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2 group cursor-pointer">
                <Network className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-180" />
                <h1 className="text-xl font-semibold text-white relative">
                  <span className="relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-pink-200 transition-all duration-300">
                    DataWebsite Explorer
                  </span>
                  <span className="absolute inset-0 bg-white/20 rounded-lg scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </h1>
              </div>
              <Link
                href="https://github.com/gui25"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white relative group px-3 py-1.5 rounded-full transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full transition-all duration-300"></div>
                <Github className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm font-medium relative">
                  <span className="relative z-10">Gui25</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </Link>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}



import './globals.css'