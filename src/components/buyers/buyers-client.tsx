"use client"

import * as React from "react"
import { BuyersTable, type Buyer } from "./buyers-table"
import { toast } from "sonner"


interface BuyersClientProps {
  initialData: Buyer[]
}

export function BuyersClient({ initialData }: BuyersClientProps) {
  const [buyers, setBuyers] = React.useState(initialData)
  const [loading, setLoading] = React.useState(false)


  const handleStatusChange = React.useCallback(async (id: string, status: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/buyers/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      const updatedBuyer = await response.json()

      setBuyers((prev) =>
        prev.map((buyer) =>
          buyer.id === id
            ? { ...buyer, status: updatedBuyer.status, updatedAt: new Date(updatedBuyer.updatedAt) }
            : buyer,
        ),
      )

      toast( "Status updated",{
      
        description: `Buyer status changed to ${status}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast("Error",{
        description: "Failed to update status. Please try again.",
      
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return <BuyersTable data={buyers} loading={loading} onStatusChange={handleStatusChange} />
}
