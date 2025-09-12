"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

const cityOptions = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]
const propertyTypeOptions = ["Apartment", "Villa", "Plot", "Office", "Retail"]
const statusOptions = ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]
const timelineOptions = ["0-3m", "3-6m", ">6m", "Exploring"]

const FilterSelect = React.memo(
  ({
    value,
    onValueChange,
    placeholder,
    options,
    allLabel,
  }: {
    value: string
    onValueChange: (value: string) => void
    placeholder: string
    options: string[]
    allLabel: string
  }) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[120px] sm:w-[140px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={allLabel}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
)
FilterSelect.displayName = "FilterSelect"

export const BuyersFilters = React.memo(() => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = React.useState(searchParams.get("search") || "")

  const debouncedSearch = useDebouncedCallback(
    React.useCallback(
      (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set("search", value)
        } else {
          params.delete("search")
        }
        params.delete("page") // Reset to first page
        router.push(`/buyers?${params.toString()}`)
      },
      [searchParams, router],
    ),
    300,
  )

  const updateFilter = React.useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page") // Reset to first page
      router.push(`/buyers?${params.toString()}`)
    },
    [searchParams, router],
  )

  const clearFilters = React.useCallback(() => {
    setSearch("")
    router.push("/buyers")
  }, [router])

  const hasActiveFilters = React.useMemo(() => {
    return (
      searchParams.get("city") ||
      searchParams.get("propertyType") ||
      searchParams.get("status") ||
      searchParams.get("timeline") ||
      searchParams.get("search")
    )
  }, [searchParams])

  const handleCityChange = React.useCallback(
    (value: string) => updateFilter("city", value === "All Cities" ? null : value),
    [updateFilter],
  )

  const handlePropertyTypeChange = React.useCallback(
    (value: string) => updateFilter("propertyType", value === "All Types" ? null : value),
    [updateFilter],
  )

  const handleStatusChange = React.useCallback(
    (value: string) => updateFilter("status", value === "All Status" ? null : value),
    [updateFilter],
  )

  const handleTimelineChange = React.useCallback(
    (value: string) => updateFilter("timeline", value === "All Timelines" ? null : value),
    [updateFilter],
  )

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
      debouncedSearch(e.target.value)
    },
    [debouncedSearch],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or notes..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect
            value={searchParams.get("city") || "All Cities"}
            onValueChange={handleCityChange}
            placeholder="City"
            options={cityOptions}
            allLabel="All Cities"
          />

          <FilterSelect
            value={searchParams.get("propertyType") || "All Types"}
            onValueChange={handlePropertyTypeChange}
            placeholder="Property Type"
            options={propertyTypeOptions}
            allLabel="All Types"
          />

          <FilterSelect
            value={searchParams.get("status") || "All Status"}
            onValueChange={handleStatusChange}
            placeholder="Status"
            options={statusOptions}
            allLabel="All Status"
          />

          <FilterSelect
            value={searchParams.get("timeline") || "All Timelines"}
            onValueChange={handleTimelineChange}
            placeholder="Timeline"
            options={timelineOptions}
            allLabel="All Timelines"
          />

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-10 bg-transparent">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})

BuyersFilters.displayName = "BuyersFilters"
