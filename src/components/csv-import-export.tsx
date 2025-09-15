"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { exportLeads } from "@/app/actions/export-leads" 
import { SQL } from "drizzle-orm"

interface ImportError {
  row: number
  field: string
  message: string
}

// Corrected: A type for the raw, unvalidated CSV data
interface RawLeadData {
  [key: string]: string
}

// Corrected: A type for the validated and parsed data
interface LeadData {
  fullName: string
  email: string | undefined
  phone: string
  city: string
  propertyType: string
  bhk: string | undefined
  purpose: string
  budgetMin: number | undefined
  budgetMax: number | undefined
  timeline: string
  source: string
  notes: string | undefined
  tags: string | undefined
  status: string
}

const propertyTypes = ["Apartment", "Villa", "Plot", "Commercial", "Other"]
const purposes = ["Buy", "Rent", "Investment"]
const timelines = ["Immediate", "1-3 months", "3-6 months", "6+ months"]
const sources = ["Website", "Referral", "Social Media", "Advertisement", "Walk-in", "Other"]
const statuses = ["New", "Contacted", "Qualified", "Converted", "Lost"]

// Corrected: Replace `any` with the `RawLeadData` interface
const validateRow = (row: RawLeadData, rowIndex: number): { isValid: boolean; errors: ImportError[] } => {
  const errors: ImportError[] = []

  // fullName validation: ≥ 2 chars
  if (!row.fullName || row.fullName.length < 2) {
    errors.push({
      row: rowIndex + 1,
      field: "fullName",
      message: "Full name must be at least 2 characters",
    })
  }

  // phone validation: numeric 10-15 digits
  const phoneRegex = /^\d{10,15}$/
  if (row.phone && !phoneRegex.test(row.phone)) {
    errors.push({
      row: rowIndex + 1,
      field: "phone",
      message: "Phone must be numeric and 10-15 digits",
    })
  }

  // email validation: valid if provided
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (row.email && !emailRegex.test(row.email)) {
    errors.push({
      row: rowIndex + 1,
      field: "email",
      message: "Please enter a valid email address",
    })
  }

  // budgetMax ≥ budgetMin when both present
  if (row.budgetMin && row.budgetMax) {
    const min = Number.parseFloat(row.budgetMin)
    const max = Number.parseFloat(row.budgetMax)
    if (isNaN(min) || isNaN(max)) {
      errors.push({
        row: rowIndex + 1,
        field: "budget",
        message: "Budget values must be numeric",
      })
    } else if (max < min) {
      errors.push({
        row: rowIndex + 1,
        field: "budgetMax",
        message: "Maximum budget must be greater than or equal to minimum budget",
      })
    }
  }

  // bhk required if propertyType ∈ {Apartment, Villa}
  if (["Apartment", "Villa"].includes(row.propertyType) && !row.bhk) {
    errors.push({
      row: rowIndex + 1,
      field: "bhk",
      message: "BHK is required for Apartment/Villa property types",
    })
  }

  // Required fields
  if (!row.city) {
    errors.push({
      row: rowIndex + 1,
      field: "city",
      message: "City is required",
    })
  }

  if (!row.propertyType) {
    errors.push({
      row: rowIndex + 1,
      field: "propertyType",
      message: "Property type is required",
    })
  }

  if (!row.purpose) {
    errors.push({
      row: rowIndex + 1,
      field: "purpose",
      message: "Purpose is required",
    })
  }

  // Unknown enums → error
  if (row.propertyType && !propertyTypes.includes(row.propertyType)) {
    errors.push({
      row: rowIndex + 1,
      field: "propertyType",
      message: `Unknown property type: ${row.propertyType}. Valid values: ${propertyTypes.join(", ")}`,
    })
  }

  if (row.purpose && !purposes.includes(row.purpose)) {
    errors.push({
      row: rowIndex + 1,
      field: "purpose",
      message: `Unknown purpose: ${row.purpose}. Valid values: ${purposes.join(", ")}`,
    })
  }

  if (row.timeline && !timelines.includes(row.timeline)) {
    errors.push({
      row: rowIndex + 1,
      field: "timeline",
      message: `Unknown timeline: ${row.timeline}. Valid values: ${timelines.join(", ")}`,
    })
  }

  if (row.source && !sources.includes(row.source)) {
    errors.push({
      row: rowIndex + 1,
      field: "source",
      message: `Unknown source: ${row.source}. Valid values: ${sources.join(", ")}`,
    })
  }

  if (row.status && !statuses.includes(row.status)) {
    errors.push({
      row: rowIndex + 1,
      field: "status",
      message: `Unknown status: ${row.status}. Valid values: ${statuses.join(", ")}`,
    })
  }

  return { isValid: errors.length === 0, errors }
}

// Corrected: The function now returns an array of `RawLeadData` objects
const parseCSV = (csvText: string): RawLeadData[] => {
  const lines = csvText.trim().split("\n")
  if (lines.length === 0) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const rows = []

  for (let i = 1; i < lines.length && i <= 200; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    const row: RawLeadData = {} // Corrected: Use the RawLeadData type

    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    rows.push(row)
  }

  return rows
}

// A helper function to trigger the file download
const download = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function CsvImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importErrors, setImportErrors] = useState<ImportError[]>([])
  const [validRows, setValidRows] = useState<LeadData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      toast.error("Invalid File", {
        description: "Please upload a CSV file",
      })
      return
    }

    setIsProcessing(true)
    setImportErrors([])
    setValidRows([])
    setShowResults(false)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length === 0) {
        toast.error("Empty File", {
          description: "The CSV file appears to be empty",
        })
        return
      }

      const allErrors: ImportError[] = []
      const validRowsData: LeadData[] = []

      rows.forEach((row, index) => {
        const { isValid, errors } = validateRow(row, index)

        if (isValid) {
          // Corrected: Manually map from RawLeadData to LeadData
          validRowsData.push({
            fullName: row.fullName,
            email: row.email || undefined,
            phone: row.phone,
            city: row.city,
            propertyType: row.propertyType,
            bhk: row.bhk || undefined,
            purpose: row.purpose,
            budgetMin: row.budgetMin ? Number.parseFloat(row.budgetMin) : undefined,
            budgetMax: row.budgetMax ? Number.parseFloat(row.budgetMax) : undefined,
            timeline: row.timeline,
            source: row.source,
            notes: row.notes || undefined,
            tags: row.tags || undefined,
            status: row.status,
          })
        } else {
          allErrors.push(...errors)
        }
      })

      setImportErrors(allErrors)
      setValidRows(validRowsData)
      setShowResults(true)

      toast.success("File Processed", {
        description: `${validRowsData.length} valid rows, ${allErrors.length} errors found`,
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to process CSV file",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImportValidRows = async () => {
    if (validRows.length === 0) return

    setIsProcessing(true)

    try {
      // NOTE: This is a mock API call. You would replace this with
      // a server action or API route that inserts the valid rows into your Neon DB.
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRows),
      });

      if (!response.ok) {
        throw new Error("Failed to import data");
      }

      toast.success("Import Successful", {
        description: `${validRows.length} leads imported successfully`,
      })

      // Reset state
      setImportErrors([])
      setValidRows([])
      setShowResults(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error("Import Failed", {
        description: "Failed to import leads. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    type Filter = SQL<unknown>;
    const filters: Filter[]  = []
    const sortColumn = "fullName"
    const sortOrder = "asc" as "asc" | "desc"; // Type assertion for string literal
    
    try {
      toast.info("Preparing export...", { description: "Fetching data from the database." })
      
      const csvContent = await exportLeads(filters, sortColumn, sortOrder)

      if (csvContent) {
        download(csvContent, `buyer-leads-${new Date().toISOString().split("T")[0]}.csv`)
        toast.success("Export Successful", {
          description: "CSV file has been downloaded.",
        })
      } else {
        toast.info("No data to export", {
          description: "The current list is empty.",
        })
      }
    } catch (error) {
      toast.error("Export Failed", {
        description: "An error occurred while exporting the data.",
      })
    }
  }

  return (
    <div className="space-y-6  py-5">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File (max 200 rows)</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Expected headers: fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax,
              timeline, source, notes, tags, status
            </p>
          </div>

          {showResults && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-4">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {validRows.length} Valid Rows
                </Badge>
                {importErrors.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {importErrors.length} Errors
                  </Badge>
                )}
              </div>

              {/* Import Button */}
              {validRows.length > 0 && (
                <Button onClick={handleImportValidRows} disabled={isProcessing} className="w-full">
                  {isProcessing ? "Importing..." : `Import ${validRows.length} Valid Rows`}
                </Button>
              )}

              {/* Error Table */}
              {importErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Import Errors</h4>
                  <div className="border rounded-md max-h-64 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Error Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importErrors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell>{error.field}</TableCell>
                            <TableCell className="text-sm">{error.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            CSV Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export current filtered list of buyer leads (respects filters/search/sort)
            </p>
            <Button onClick={handleExport} variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}