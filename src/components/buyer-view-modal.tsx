"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Loader2, Clock, User, MapPin, Home, DollarSign, Calendar, Tag, FileText } from "lucide-react"

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

interface BuyerHistory {
  id: string
  buyerId: string
  changedBy: string
  changedAt: string
  // Changed `any` to `unknown`
  diff: Record<string, { old: unknown; new: unknown }> 
}

interface BuyerViewModalProps {
  buyer: Buyer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BuyerViewModal({ buyer, open, onOpenChange }: BuyerViewModalProps) {
  const [history, setHistory] = useState<BuyerHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (open && buyer.id) {
      fetchHistory()
    }
  }, [open, buyer.id])

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/buyers/${buyer.id}/history`)
      if (response.ok) {
        const data = await response.json()
        // Here, we can safely assume the data matches the type and cast it.
        setHistory(data.history as BuyerHistory[] || [])
      }
    } catch (error) {
      console.error("Error fetching buyer history:", error)
    } finally {
      setLoadingHistory(false)
    }
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

  const formatBudget = () => {
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
  
  // Changed `any` to `unknown` and added type checks
  const formatFieldChange = (field: string, oldValue: unknown, newValue: unknown) => {
    if (field === "budgetMin" || field === "budgetMax") {
      const formatAmount = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
        return `₹${amount.toLocaleString()}`
      }
      // Added check to ensure oldValue and newValue are numbers
      const oldAmount = typeof oldValue === "number" ? formatAmount(oldValue) : "Not set";
      const newAmount = typeof newValue === "number" ? formatAmount(newValue) : "Not set";
      return `${oldAmount} → ${newAmount}`;
    }
    // Added a more generic string conversion to handle unknown types gracefully
    const oldString = typeof oldValue !== "undefined" && oldValue !== null ? String(oldValue) : "Not set";
    const newString = typeof newValue !== "undefined" && newValue !== null ? String(newValue) : "Not set";
    return `${oldString} → ${newString}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {buyer.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buyer Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{buyer.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">📞</span>
                  <span>{buyer.phone}</span>
                </div>
                {buyer.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✉️</span>
                    <span>{buyer.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{buyer.city}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{buyer.propertyType}</span>
                  {buyer.bhk && <Badge variant="outline">{buyer.bhk} BHK</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Purpose: {buyer.purpose}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatBudget()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Timeline: {buyer.timeline}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(buyer.status)}>{buyer.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Source:</span>
                  <span>{buyer.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Updated: {new Date(buyer.updatedAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {buyer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{buyer.notes}</p>
                </CardContent>
              </Card>
            )}

            {buyer.tags && buyer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {buyer.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No recent changes</p>
                ) : (
                  <div className="space-y-4">
                    {history.slice(0, 5).map((change) => (
                      <div key={change.id} className="border-l-2 border-muted pl-4 pb-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(change.changedAt).toLocaleString()} • {change.changedBy}
                        </div>
                        <div className="space-y-1">
                          {Object.entries(change.diff).map(([field, { old, new: newValue }]) => (
                            <div key={field} className="text-sm">
                              <span className="font-medium capitalize">
                                {field.replace(/([A-Z])/g, " $1").toLowerCase()}:
                              </span>
                              <div className="text-muted-foreground ml-2">
                                {formatFieldChange(field, old, newValue)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}