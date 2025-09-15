"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Save, X, Clock, User } from "lucide-react"


interface Buyer {
  id: string
  fullName: string
  email?: string
  phone: string
  city: string
  propertyType: string
  bhk?: string
  purpose: string
  budgetMin?: number
  budgetMax?: number
  timeline: string
  source: string
  status: string
  notes?: string
  tags?: string[]
  ownerId: string
  updatedAt: string
}

interface HistoryRecord {
  id: string
  buyerId: string
  changedBy: string
  changedAt: string
  // Replaced `any` with `unknown`
  diff: Record<string, { old: unknown; new: unknown }>
}

const cities = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]
const propertyTypes = ["Apartment", "Villa", "Plot", "Office", "Retail"]
const bhkOptions = ["1", "2", "3", "4", "Studio"]
const purposes = ["Buy", "Rent"]
const timelines = ["0-3m", "3-6m", ">6m", "Exploring"]
const sources = ["Website", "Referral", "Walk-in", "Call", "Other"]
const statuses = ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]

const statusColors = {
  New: "bg-blue-100 text-blue-800",
  Qualified: "bg-green-100 text-green-800",
  Contacted: "bg-yellow-100 text-yellow-800",
  Visited: "bg-purple-100 text-purple-800",
  Negotiation: "bg-orange-100 text-orange-800",
  Converted: "bg-emerald-100 text-emerald-800",
  Dropped: "bg-red-100 text-red-800",
}

export function BuyerViewEdit({ id }: { id: string }) {
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Buyer | null>(null)

  useEffect(() => {
    fetchBuyer()
  }, [id])

  const fetchBuyer = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/buyers/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/")
          return
        }
        throw new Error("Failed to fetch buyer")
      }

      const data = await response.json()
      setBuyer(data.buyer)
      setHistory(data.history)
      setFormData(data.buyer)
    } catch (error) {
      console.error("Error fetching buyer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          fetchBuyer() // Refresh data
          return
        }
        throw new Error(data.error || "Failed to update buyer")
      }

      setBuyer(data.buyer)
      setFormData(data.buyer)
      setIsEditing(false)
      fetchBuyer() // Refresh to get updated history
    } catch (error) {
      console.error("Error updating buyer:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(buyer)
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Replaced `any` with `unknown` and added type checks
  const renderHistoryValue = (value: unknown) => {
    if (Array.isArray(value)) {
      // Safely join array elements
      return value.map(String).join(", ");
    }
    if (typeof value === "number") {
      // Check if it's a number and format
      if (value > 1000) {
        return formatCurrency(value);
      }
      return String(value);
    }
    // Handle other types gracefully
    if (value === null || value === undefined) {
      return "Not set";
    }
    return String(value);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!buyer) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900">Buyer not found</h1>
          <Button onClick={() => router.push("/")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{buyer.fullName}</h1>
            <p className="text-sm text-gray-500">ID: {buyer.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buyer Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Buyer Details</CardTitle>
              <CardDescription>Last updated: {formatDate(buyer.updatedAt)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={formData?.fullName || ""}
                        onChange={(e) => setFormData((prev) => (prev ? { ...prev, fullName: e.target.value } : null))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.fullName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData?.phone || ""}
                        onChange={(e) => setFormData((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.phone}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData?.email || ""}
                        onChange={(e) => setFormData((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.email || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Property Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Property Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.city || ""}
                        onValueChange={(value) => setFormData((prev) => (prev ? { ...prev, city: value } : null))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.propertyType || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => (prev ? { ...prev, propertyType: value } : null))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.propertyType}</p>
                    )}
                  </div>
                  {(buyer.propertyType === "Apartment" || buyer.propertyType === "Villa") && (
                    <div>
                      <Label htmlFor="bhk">BHK</Label>
                      {isEditing ? (
                        <Select
                          value={formData?.bhk || ""}
                          onValueChange={(value) => setFormData((prev) => (prev ? { ...prev, bhk: value } : null))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bhkOptions.map((bhk) => (
                              <SelectItem key={bhk} value={bhk}>
                                {bhk}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{buyer.bhk || "Not specified"}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="purpose">Purpose *</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.purpose || ""}
                        onValueChange={(value) => setFormData((prev) => (prev ? { ...prev, purpose: value } : null))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {purposes.map((purpose) => (
                            <SelectItem key={purpose} value={purpose}>
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.purpose}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Budget & Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Budget & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                    {isEditing ? (
                      <Input
                        id="budgetMin"
                        type="number"
                        value={formData?.budgetMin || ""}
                        onChange={(e) =>
                          setFormData((prev) => (prev ? { ...prev, budgetMin: Number(e.target.value) } : null))
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {buyer.budgetMin ? formatCurrency(buyer.budgetMin) : "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                    {isEditing ? (
                      <Input
                        id="budgetMax"
                        type="number"
                        value={formData?.budgetMax || ""}
                        onChange={(e) =>
                          setFormData((prev) => (prev ? { ...prev, budgetMax: Number(e.target.value) } : null))
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {buyer.budgetMax ? formatCurrency(buyer.budgetMax) : "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline *</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.timeline || ""}
                        onValueChange={(value) => setFormData((prev) => (prev ? { ...prev, timeline: value } : null))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timelines.map((timeline) => (
                            <SelectItem key={timeline} value={timeline}>
                              {timeline}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.timeline}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="source">Source *</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.source || ""}
                        onValueChange={(value) => setFormData((prev) => (prev ? { ...prev, source: value } : null))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{buyer.source}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status & Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Status & Notes</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.status || ""}
                        onValueChange={(value) => setFormData((prev) => (prev ? { ...prev, status: value } : null))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={statusColors[buyer.status as keyof typeof statusColors]}>
                          {buyer.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    {isEditing ? (
                      <Textarea
                        id="notes"
                        value={formData?.notes || ""}
                        onChange={(e) => setFormData((prev) => (prev ? { ...prev, notes: e.target.value } : null))}
                        className="mt-1"
                        rows={3}
                        maxLength={1000}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{buyer.notes || "No notes"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {buyer.tags && buyer.tags.length > 0 ? (
                        buyer.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tags</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden updatedAt field for concurrency control */}
              {isEditing && <input type="hidden" value={formData?.updatedAt || ""} />}
            </CardContent>
          </Card>
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Changes
              </CardTitle>
              <CardDescription>Last 5 modifications</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <User className="w-3 h-3" />
                        <span>User {record.changedBy}</span>
                        <span>•</span>
                        <span>{formatDate(record.changedAt)}</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(record.diff).map(([field, change]) => (
                          <div key={field} className="text-xs">
                            <span className="font-medium capitalize">{field}:</span>
                            <div className="ml-2">
                              <span className="text-red-600 line-through">{renderHistoryValue(change.old)}</span>
                              <span className="mx-1">→</span>
                              <span className="text-green-600">{renderHistoryValue(change.new)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No changes recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}