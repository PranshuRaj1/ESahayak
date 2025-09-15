"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, X, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBuyerSchema } from "@/lib/validation"
import { z } from "zod"

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

interface BuyerEditModalProps {
  buyer: Buyer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BuyerEditModal({ buyer, open, onOpenChange, onSuccess }: BuyerEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    fullName: buyer.fullName,
    email: buyer.email || "",
    phone: buyer.phone,
    city: buyer.city,
    propertyType: buyer.propertyType,
    bhk: buyer.bhk || "",
    purpose: buyer.purpose,
    budgetMin: buyer.budgetMin?.toString() || "",
    budgetMax: buyer.budgetMax?.toString() || "",
    timeline: buyer.timeline,
    source: buyer.source,
    status: buyer.status,
    notes: buyer.notes || "",
    tags: buyer.tags?.join(", ") || "",
    updatedAt: buyer.updatedAt, // Hidden field for concurrency control
  })

  useEffect(() => {
    if (open) {
      setFormData({
        fullName: buyer.fullName,
        email: buyer.email || "",
        phone: buyer.phone,
        city: buyer.city,
        propertyType: buyer.propertyType,
        bhk: buyer.bhk || "",
        purpose: buyer.purpose,
        budgetMin: buyer.budgetMin?.toString() || "",
        budgetMax: buyer.budgetMax?.toString() || "",
        timeline: buyer.timeline,
        source: buyer.source,
        status: buyer.status,
        notes: buyer.notes || "",
        tags: buyer.tags?.join(", ") || "",
        updatedAt: buyer.updatedAt,
      })
      setError(null)
      setValidationErrors({})
    }
  }, [buyer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors({})

    try {
      // Prepare data for validation
      const dataToValidate = {
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone,
        city: formData.city,
        propertyType: formData.propertyType,
        bhk: formData.bhk || undefined,
        purpose: formData.purpose,
        budgetMin: formData.budgetMin ? Number.parseInt(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? Number.parseInt(formData.budgetMax) : undefined,
        timeline: formData.timeline,
        source: formData.source,
        notes: formData.notes || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
      }

      // Validate with Zod schema
      createBuyerSchema.parse(dataToValidate)

      // Submit to API
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dataToValidate,
          status: formData.status,
          updatedAt: formData.updatedAt, // Include for concurrency control
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          setError("Record changed, please refresh")
        } else {
          setError(errorData.error || "Failed to update buyer")
        }
        return
      }

      onSuccess()
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((error) => {
          if (error.path.length > 0) {
            errors[error.path[0] as string] = error.message
          }
        })
        setValidationErrors(errors)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Buyer - {buyer.fullName}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className={validationErrors.fullName ? "border-red-500" : ""}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={validationErrors.phone ? "border-red-500" : ""}
                  />
                  {validationErrors.phone && <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger className={validationErrors.city ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="Mohali">Mohali</SelectItem>
                      <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                      <SelectItem value="Panchkula">Panchkula</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.city && <p className="text-sm text-red-500 mt-1">{validationErrors.city}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange("propertyType", value)}
                  >
                    <SelectTrigger className={validationErrors.propertyType ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.propertyType && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.propertyType}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bhk">BHK</Label>
                  <Select value={formData.bhk} onValueChange={(value) => handleInputChange("bhk", value)}>
                    <SelectTrigger className={validationErrors.bhk ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not specified">Not specified</SelectItem>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4 BHK</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.bhk && <p className="text-sm text-red-500 mt-1">{validationErrors.bhk}</p>}
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                    <SelectTrigger className={validationErrors.purpose ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.purpose && <p className="text-sm text-red-500 mt-1">{validationErrors.purpose}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                    className={validationErrors.budgetMin ? "border-red-500" : ""}
                  />
                  {validationErrors.budgetMin && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.budgetMin}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                    className={validationErrors.budgetMax ? "border-red-500" : ""}
                  />
                  {validationErrors.budgetMax && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.budgetMax}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="timeline">Timeline *</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                  <SelectTrigger className={validationErrors.timeline ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3m">0-3 months</SelectItem>
                    <SelectItem value="3-6m">3-6 months</SelectItem>
                    <SelectItem value=">6m">More than 6 months</SelectItem>
                    <SelectItem value="Exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.timeline && <p className="text-sm text-red-500 mt-1">{validationErrors.timeline}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Status & Source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Visited">Visited</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source *</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                    <SelectTrigger className={validationErrors.source ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.source && <p className="text-sm text-red-500 mt-1">{validationErrors.source}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="e.g., urgent, premium, referral"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className={validationErrors.notes ? "border-red-500" : ""}
                />
                <div className="text-xs text-muted-foreground mt-1">{formData.notes.length}/1000 characters</div>
                {validationErrors.notes && <p className="text-sm text-red-500 mt-1">{validationErrors.notes}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Hidden field for concurrency control */}
          <input type="hidden" value={formData.updatedAt} />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
