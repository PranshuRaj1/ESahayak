"use client" 

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportButton() {
  const searchParams = useSearchParams()

  const handleExport = async () => {
    const params = new URLSearchParams(searchParams.toString())

    try {
      const response = await fetch(`/api/buyers/export?${params}`)
      if (!response.ok) throw new Error("Failed to export")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `buyers-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}