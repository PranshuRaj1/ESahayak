"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { MoreHorizontal, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
// For user feedback, you might want a toast library like sonner
// import { toast } from "sonner"

export type Buyer = {
  id: string
  fullName: string
  phone: string
  email?: string | null
  city: string
  propertyType: string
  bhk?: string | null
  purpose: string
  budgetMin?: number | null
  budgetMax?: number | null
  timeline: string
  source: string
  status: string
  notes?: string | null
  tags?: string[] | null
  ownerId: string
  updatedAt: Date
}

const statusColors = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Visited: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  Dropped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

interface BuyersTableProps {
  data: Buyer[]
  loading?: boolean
}

const MemoizedBadge = React.memo(Badge)
const MemoizedButton = React.memo(Button)

const BudgetCell = React.memo(({ buyer }: { buyer: Buyer }) => {
  const { budgetMin, budgetMax } = buyer

  const budgetText = React.useMemo(() => {
    if (!budgetMin && !budgetMax) return "-"

    const formatBudget = (amount: number) => {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
      return `₹${amount.toLocaleString()}`
    }

    if (budgetMin && budgetMax) {
      return `${formatBudget(budgetMin)} - ${formatBudget(budgetMax)}`
    } else if (budgetMin) {
      return `₹${formatBudget(budgetMin)}+`
    } else if (budgetMax) {
      return `Up to ${formatBudget(budgetMax)}`
    }
    return "-"
  }, [budgetMin, budgetMax])

  return <div className="hidden lg:block text-sm">{budgetText}</div>
})
BudgetCell.displayName = "BudgetCell"

const StatusCell = React.memo(
  ({ buyer, onStatusChange }: { buyer: Buyer; onStatusChange: (id: string, status: string) => Promise<void> }) => {
    const status = buyer.status as keyof typeof statusColors

    const handleStatusChange = React.useCallback(
      (newStatus: string) => {
        onStatusChange(buyer.id, newStatus)
      },
      [buyer.id, onStatusChange],
    )

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MemoizedButton variant="ghost" className="h-auto p-0">
            <MemoizedBadge variant="outline" className={statusColors[status]}>
              {status}
            </MemoizedBadge>
          </MemoizedButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.keys(statusColors).map((statusOption) => (
            <DropdownMenuItem
              key={statusOption}
              onClick={() => handleStatusChange(statusOption)}
              disabled={statusOption === status}
            >
              <MemoizedBadge variant="outline" className={statusColors[statusOption as keyof typeof statusColors]}>
                {statusOption}
              </MemoizedBadge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)
StatusCell.displayName = "StatusCell"

const ActionsCell = React.memo(({ buyer }: { buyer: Buyer }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <MemoizedButton variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </MemoizedButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <Link href={`/buyers/${buyer.id}`} className="flex items-center">
          <Eye className="mr-2 h-4 w-4" />
          View
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/buyers/${buyer.id}/edit`} className="flex items-center">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
))
ActionsCell.displayName = "ActionsCell"

export const BuyersTable = React.memo<BuyersTableProps>(({ data, loading = false }) => {
  const router = useRouter()

  const handleStatusChange = React.useCallback(async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/buyers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // This is the key: refresh the data from the server
      router.refresh()
      // toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Failed to update status:", error)
      // toast.error("Could not update status.");
    }
  }, [router])

  const columns = React.useMemo<ColumnDef<Buyer>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium max-w-[150px] truncate" title={row.getValue("fullName")}>
            {row.getValue("fullName")}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("phone")}</div>,
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => <div className="hidden sm:block">{row.getValue("city")}</div>,
      },
      {
        accessorKey: "propertyType",
        header: "Property Type",
        cell: ({ row }) => {
          const bhk = row.original.bhk
          const propertyType = row.getValue("propertyType") as string
          return (
            <div className="hidden md:block">
              {propertyType}
              {bhk && <span className="ml-1 text-xs text-muted-foreground">({bhk} BHK)</span>}
            </div>
          )
        },
      },
      {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) => <BudgetCell buyer={row.original} />,
      },
      {
        accessorKey: "timeline",
        header: "Timeline",
        cell: ({ row }) => <div className="hidden xl:block">{row.getValue("timeline")}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell buyer={row.original} onStatusChange={handleStatusChange} />,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => {
          const date = row.getValue("updatedAt") as Date
          const timeAgo = React.useMemo(() => formatDistanceToNow(date, { addSuffix: true }), [date])
          return <div className="text-sm text-muted-foreground hidden sm:block">{timeAgo}</div>
        },
      },
      {
        id: "actions",
        cell: ({ row }) => <ActionsCell buyer={row.original} />,
      },
    ],
    [handleStatusChange],
  )

  return <DataTable columns={columns} data={data} />
})

BuyersTable.displayName = "BuyersTable"

