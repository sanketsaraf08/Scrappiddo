/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import Header from "@/components/ui/header"

export default function Home() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<string[]>([])

  useEffect(() => {
    // Load theme
    const theme = localStorage.getItem("theme")
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    }

    // Load workspaces
    const savedWorkspaces = JSON.parse(localStorage.getItem("workspaces") || "[]")
    setWorkspaces(savedWorkspaces)
  }, [])

 
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ product: string; price: string }[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Load theme preference from localStorage
  useEffect(() => {
    const theme = localStorage.getItem("theme")
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    }
  }, [])

  // Toggle theme function

  const handleScrape = async () => {
    setLoading(true)
    // Simulated API call - replace with actual implementation
    setTimeout(() => {
      setResults([
        { product: "Rev 1.0 Utility Waist Pouch (Deep Blue)", price: "₹250" },
        { product: "Rev 1.0 Utility Waist Pouch (Nardo Grey)", price: "₹250" },
        { product: "Flying Weebee", price: "₹420" },
        { product: "Myth of Asia", price: "₹420" },
        { product: "WIZMAN X SEEDSTORE (PACK OF 3)", price: "₹1,111" },
      ])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Accent color blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl dark:bg-purple-500/10" />
      </div>

      {/* Header */}
      <Header/>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl relative">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              AI Web Scraper
            </h1>
            <p className="text-muted-foreground text-center">
              Enter a website URL and describe what data you want to extract
            </p>
          </div>

          <div className="space-y-4 backdrop-blur-md bg-card/50 p-6 rounded-xl border border-border/50 shadow-lg">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Website URL
              </label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Describe what you want to parse
              </label>
              <Textarea
                id="description"
                placeholder="e.g., Extract all product names and prices"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] bg-background/50 backdrop-blur-sm"
              />
            </div>

            <Button 
              className="w-full bg-primary/90 hover:bg-primary/100 backdrop-blur-sm"
              onClick={handleScrape}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Scraping..." : "Scrape Website"}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-md shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-primary/5">
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item, index) => (
                    <TableRow key={index} className="hover:bg-primary/5">
                      <TableCell>{item.product}</TableCell>
                      <TableCell className="text-right">{item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
