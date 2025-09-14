"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface Buyer {
  id: string
  fullName: string
  email?: string
  phone: string
  city: "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other"
  propertyType: "Apartment" | "Villa" | "Plot" | "Office" | "Retail"
  bhk?: "1" | "2" | "3" | "4" | "Studio"
  purpose: "Buy" | "Rent"
  budgetMin?: number
  budgetMax?: number
  timeline: "0-3m" | "3-6m" | ">6m" | "Exploring"
  source: "Website" | "Referral" | "Walk-in" | "Call" | "Other"
  status: "New" | "Qualified" | "Contacted" | "Visited" | "Negotiation" | "Converted" | "Dropped"
  notes?: string
  tags?: string[]
  ownerId: string
  updatedAt: string
}

interface BuyersResponse {
  buyers: Buyer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    cities: string[]
    propertyTypes: string[]
    statuses: string[]
    timelines: string[]
  }
}

const ITEMS_PER_PAGE = 10

export function BuyersListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  })
  const [filterOptions, setFilterOptions] = useState({
    cities: [] as string[],
    propertyTypes: [] as string[],
    statuses: [] as string[],
    timelines: [] as string[],
  })

  // URL-synced state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "All Cities")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(searchParams.get("propertyType") || "All Property Types")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All Statuses")
  const [timelineFilter, setTimelineFilter] = useState(searchParams.get("timeline") || "All Timelines")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "updatedAt")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"))

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchBuyers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearchTerm) params.set("search", debouncedSearchTerm)
      if (cityFilter !== "All Cities") params.set("city", cityFilter)
      if (propertyTypeFilter !== "All Property Types") params.set("propertyType", propertyTypeFilter)
      if (statusFilter !== "All Statuses") params.set("status", statusFilter)
      if (timelineFilter !== "All Timelines") params.set("timeline", timelineFilter)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("page", currentPage.toString())
      params.set("limit", ITEMS_PER_PAGE.toString())

      const response = await fetch(`/api/buyers?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch buyers")

      const data: BuyersResponse = await response.json()
      setBuyers(data.buyers)
      setPagination(data.pagination)
      setFilterOptions(data.filters)
    } catch (error) {
      console.error("Error fetching buyers:", error)
    } finally {
      setLoading(false)
    }
  }, [
    debouncedSearchTerm,
    cityFilter,
    propertyTypeFilter,
    statusFilter,
    timelineFilter,
    sortBy,
    sortOrder,
    currentPage,
  ])

  useEffect(() => {
    fetchBuyers()
  }, [fetchBuyers])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm)
    if (cityFilter !== "All Cities") params.set("city", cityFilter)
    if (propertyTypeFilter !== "All Property Types") params.set("propertyType", propertyTypeFilter)
    if (statusFilter !== "All Statuses") params.set("status", statusFilter)
    if (timelineFilter !== "All Timelines") params.set("timeline", timelineFilter)
    if (sortBy !== "updatedAt") params.set("sortBy", sortBy)
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder)
    if (currentPage !== 1) params.set("page", currentPage.toString())

    const newUrl = params.toString() ? `/buyers?${params.toString()}` : "/buyers"
    router.replace(newUrl, { scroll: false })
  }, [
    debouncedSearchTerm,
    cityFilter,
    propertyTypeFilter,
    statusFilter,
    timelineFilter,
    sortBy,
    sortOrder,
    currentPage,
  ])

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, cityFilter, propertyTypeFilter, statusFilter, timelineFilter])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCityFilter("All Cities")
    setPropertyTypeFilter("All Property Types")
    setStatusFilter("All Statuses")
    setTimelineFilter("All Timelines")
    setSortBy("updatedAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Qualified":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Visited":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Negotiation":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      case "Converted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatBudget = (buyer: Buyer) => {
    if (!buyer.budgetMin && !buyer.budgetMax) return "Not specified"

    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
      return `₹${amount.toLocaleString()}`
    }

    if (buyer.budgetMin && buyer.budgetMax) {
      return `${formatAmount(buyer.budgetMin)} - ${formatAmount(buyer.budgetMax)}`
    }
    return buyer.budgetMin ? `From ${formatAmount(buyer.budgetMin)}` : `Up to ${formatAmount(buyer.budgetMax!)}`
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Cities">All Cities</SelectItem>
                {filterOptions.cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Property Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Property Types">All Property Types</SelectItem>
                {filterOptions.propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                {filterOptions.statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timelineFilter} onValueChange={setTimelineFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Timelines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Timelines">All Timelines</SelectItem>
                {filterOptions.timelines.map((timeline) => (
                  <SelectItem key={timeline} value={timeline}>
                    {timeline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <p className="text-sm text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                `Showing ${buyers.length} of ${pagination.total} buyers`
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("fullName")}>
                  Name {sortBy === "fullName" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("phone")}>
                  Phone {sortBy === "phone" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("city")}>
                  City {sortBy === "city" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("propertyType")}>
                  Property Type {sortBy === "propertyType" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("budgetMin")}>
                  Budget {sortBy === "budgetMin" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("timeline")}>
                  Timeline {sortBy === "timeline" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("updatedAt")}>
                  Updated {sortBy === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : buyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No buyers found
                  </TableCell>
                </TableRow>
              ) : (
                buyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">{buyer.fullName}</TableCell>
                    <TableCell>{buyer.phone}</TableCell>
                    <TableCell>{buyer.city}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{buyer.propertyType}</span>
                        {buyer.bhk && <span className="text-xs text-muted-foreground">{buyer.bhk} BHK</span>}
                      </div>
                    </TableCell>
                    <TableCell>{formatBudget(buyer)}</TableCell>
                    <TableCell>{buyer.timeline}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(buyer.status)}>{buyer.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(buyer.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
