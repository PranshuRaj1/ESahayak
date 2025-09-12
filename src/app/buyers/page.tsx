"use client"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BuyersFilters } from "@/components/buyers/buyers-filters"
import { BuyersTable } from "@/components/buyers/buyers-table"
import { Pagination } from "@/components/buyers/pagination"
import { Plus, Download, Upload } from "lucide-react"
import { buyerFiltersSchema } from "@/lib/validation"
import { useSearchParams } from "next/navigation"

interface BuyersPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

async function fetchBuyers(searchParams: Record<string, string | string[] | undefined>) {
  const filters = buyerFiltersSchema.parse({
    city: searchParams.city,
    propertyType: searchParams.propertyType,
    status: searchParams.status,
    timeline: searchParams.timeline,
    search: searchParams.search,
    page: Number.parseInt(searchParams.page as string) || 1,
    limit: Number.parseInt(searchParams.limit as string) || 10,
  })

  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, value.toString())
    }
  })

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/buyers?${params}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch buyers")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching buyers:", error)
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    }
  }
}

function ExportButton() {
  const searchParams = useSearchParams()

  const handleExport = async () => {
    const params = new URLSearchParams(searchParams.toString())

    try {
      const response = await fetch(`/api/buyers/export?${params}`)

      if (!response.ok) {
        throw new Error("Failed to export")
      }

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

async function BuyersContent({ searchParams }: BuyersPageProps) {
  const { data: buyers, pagination } = await fetchBuyers(searchParams)

  // const handleStatusChange = async (id: string, status: string) => {
  //   "use server"
  //   // This will be handled on the client side
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyers</h1>
          <p className="text-muted-foreground">Manage your buyer leads and track their progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/buyers/import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <ExportButton />
          <Button asChild>
            <Link href="/buyers/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Lead
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <BuyersFilters />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <BuyersTable
            data={buyers}
            onStatusChange={async (id: string, status: string) => {
              // This will be handled by client component
            }}
          />
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </div>
  )
}

export default function BuyersPage({ searchParams }: BuyersPageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <BuyersContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
