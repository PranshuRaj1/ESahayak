"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dropzone } from "@/components/ui/dropzone"
import { toast } from "sonner"
import { Loader2, Download, Upload, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ImportError {
  row: number
  errors: string[]
}

interface ImportResult {
  success: boolean
  errors?: ImportError[]
  validCount?: number
  totalCount?: number
  imported?: number
}

export function ImportBuyers() {
  const router = useRouter()
  const [file, setFile] = React.useState<File | null>(null)
  const [csvData, setCsvData] = React.useState<any[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null)

  const parseCSV = React.useCallback((csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row")
    }

    const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))
    const rows = lines.slice(1).map((line) => {
      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
      return row
    })

    return rows
  }, [])

  const handleFileSelect = React.useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile)
      setIsProcessing(true)
      setImportResult(null)

      try {
        const text = await selectedFile.text()
        const data = parseCSV(text)

        if (data.length > 200) {
          throw new Error("Maximum 200 rows allowed")
        }

        setCsvData(data)
        toast("File processed",{
           
          description: `Found ${data.length} rows to import`,
        })
      } catch (error) {
        console.error("Error parsing CSV:", error)
        toast("Error", {
          description: error instanceof Error ? error.message : "Failed to parse CSV file",
   
        })
        setFile(null)
        setCsvData([])
      } finally {
        setIsProcessing(false)
      }
    },
    [parseCSV],
  )

  const handleImport = React.useCallback(async () => {
    if (!csvData.length) return

    setIsImporting(true)
    try {
      const response = await fetch("/api/buyers/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: csvData }),
      })

      const result = await response.json()
      setImportResult(result)

      if (result.success) {
        toast("Import successful", {
          description: `Successfully imported ${result.imported} buyers`,
        })
        // Redirect to buyers list after successful import
        setTimeout(() => {
          router.push("/buyers")
        }, 2000)
      } else {
        toast("Validation errors", {
          description: `Found ${result.errors?.length || 0} rows with errors`,
    
        })
      }
    } catch (error) {
      console.error("Error importing buyers:", error)
      toast("Error",{
        
        description: "Failed to import buyers. Please try again.",
     
      })
    } finally {
      setIsImporting(false)
    }
  }, [csvData, router])

  const downloadTemplate = React.useCallback(() => {
    const headers = [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "notes",
      "tags",
    ]

    const sampleData = [
      "John Doe",
      "john@example.com",
      "9876543210",
      "Chandigarh",
      "Apartment",
      "2",
      "Buy",
      "5000000",
      "7000000",
      "3-6m",
      "Website",
      "Looking for 2BHK in Sector 22",
      "urgent;premium",
    ]

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "buyers-import-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/buyers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Buyers
          </Link>
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Buyers</h1>
            <p className="text-muted-foreground">Upload a CSV file to import buyer leads (max 200 rows)</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file with buyer data. Make sure it includes the required columns: fullName, phone, city,
              propertyType, purpose, timeline, source.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone onFileSelect={handleFileSelect} />
            {isProcessing && (
              <div className="mt-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Processing file...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {file && csvData.length > 0 && !importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Ready to Import
              </CardTitle>
              <CardDescription>
                Found {csvData.length} rows in {file.name}. Click import to validate and add these buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {csvData.length} Buyers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setCsvData([])
                    setImportResult(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Import Successful
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Import Errors
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {importResult.success
                  ? `Successfully imported ${importResult.imported} buyers`
                  : `Found ${importResult.errors?.length || 0} rows with validation errors`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importResult.success ? (
                <div className="space-y-4">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    {importResult.imported} buyers imported
                  </Badge>
                  <p className="text-sm text-muted-foreground">Redirecting to buyers list...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      {importResult.errors?.length || 0} errors
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      {importResult.validCount || 0} valid
                    </Badge>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Errors</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResult.errors.map((error) => (
                            <TableRow key={error.row}>
                              <TableCell>{error.row}</TableCell>
                              <TableCell>
                                <ul className="text-sm text-red-600 dark:text-red-400">
                                  {error.errors.map((err, index) => (
                                    <li key={index}>• {err}</li>
                                  ))}
                                </ul>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        setFile(null)
                        setCsvData([])
                        setImportResult(null)
                      }}
                    >
                      Try Again
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/buyers">Go to Buyers</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
