"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "./tag-input"
import { updateBuyerSchema } from "@/lib/validation"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import type { z } from "zod"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type UpdateBuyerFormData = z.infer<typeof updateBuyerSchema>

interface Buyer {
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

interface EditBuyerFormProps {
  buyer: Buyer
  canEdit: boolean
}

const cityOptions = [
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Mohali", label: "Mohali" },
  { value: "Zirakpur", label: "Zirakpur" },
  { value: "Panchkula", label: "Panchkula" },
  { value: "Other", label: "Other" },
]

const propertyTypeOptions = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Plot", label: "Plot" },
  { value: "Office", label: "Office" },
  { value: "Retail", label: "Retail" },
]

const bhkOptions = [
  { value: "Studio", label: "Studio" },
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
]

const purposeOptions = [
  { value: "Buy", label: "Buy" },
  { value: "Rent", label: "Rent" },
]

const timelineOptions = [
  { value: "0-3m", label: "0-3 months" },
  { value: "3-6m", label: "3-6 months" },
  { value: ">6m", label: "More than 6 months" },
  { value: "Exploring", label: "Just exploring" },
]

const sourceOptions = [
  { value: "Website", label: "Website" },
  { value: "Referral", label: "Referral" },
  { value: "Walk-in", label: "Walk-in" },
  { value: "Call", label: "Phone Call" },
  { value: "Other", label: "Other" },
]

export function EditBuyerForm({ buyer, canEdit }: EditBuyerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const form = useForm<UpdateBuyerFormData>({
    resolver: zodResolver(updateBuyerSchema),
    defaultValues: {
      fullName: buyer.fullName,
      email: buyer.email || "",
      phone: buyer.phone,
      city: buyer.city as any,
      propertyType: buyer.propertyType as any,
      bhk: buyer.bhk as any,
      purpose: buyer.purpose as any,
      budgetMin: buyer.budgetMin || undefined,
      budgetMax: buyer.budgetMax || undefined,
      timeline: buyer.timeline as any,
      source: buyer.source as any,
      notes: buyer.notes || "",
      tags: buyer.tags || [],
      updatedAt: buyer.updatedAt,
    },
  })

  const propertyType = form.watch("propertyType")
  const showBhkField = propertyType === "Apartment" || propertyType === "Villa"

  const onSubmit = React.useCallback(
    async (data: UpdateBuyerFormData) => {
      if (!canEdit) return

      setIsSubmitting(true)
      try {
        const response = await fetch(`/api/buyers/${buyer.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          if (response.status === 409) {
            toast("Conflict",{
             
              description: "Record changed, please refresh",
       
            })
            router.refresh()
            return
          }
          throw new Error(error.message || "Failed to update buyer")
        }

        toast("Success",{
          
          description: "Buyer updated successfully",
        })

        router.refresh()
      } catch (error) {
        console.error("Error updating buyer:", error)
        toast("Error",{
          description: error instanceof Error ? error.message : "Failed to update buyer. Please try again.",
        
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [buyer.id, canEdit, router],
  )

  const handleDelete = React.useCallback(async () => {
    if (!canEdit) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete buyer")
      }

      toast("Success", {
        description: "Buyer deleted successfully",
      })

      router.push("/buyers")
    } catch (error) {
      console.error("Error deleting buyer:", error)
      toast("Error",{
       
        description: error instanceof Error ? error.message : "Failed to delete buyer. Please try again.",
      
      })
    } finally {
      setIsDeleting(false)
    }
  }, [buyer.id, canEdit, router])

  if (!canEdit) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/buyers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Buyers
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">View Lead</h1>
          <p className="text-muted-foreground">You can only view this lead (not owned by you)</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground">{buyer.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">{buyer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{buyer.email || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <p className="text-sm text-muted-foreground">{buyer.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Property Type</label>
                  <p className="text-sm text-muted-foreground">
                    {buyer.propertyType}
                    {buyer.bhk && <span className="ml-1">({buyer.bhk} BHK)</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Purpose</label>
                  <p className="text-sm text-muted-foreground">{buyer.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <p className="text-sm text-muted-foreground">
                    {buyer.budgetMin && buyer.budgetMax
                      ? `₹${buyer.budgetMin.toLocaleString()} - ₹${buyer.budgetMax.toLocaleString()}`
                      : buyer.budgetMin
                        ? `₹${buyer.budgetMin.toLocaleString()}+`
                        : buyer.budgetMax
                          ? `Up to ₹${buyer.budgetMax.toLocaleString()}`
                          : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timeline</label>
                  <p className="text-sm text-muted-foreground">{buyer.timeline}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Source</label>
                <p className="text-sm text-muted-foreground">{buyer.source}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{buyer.notes || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {buyer.tags && buyer.tags.length > 0 ? (
                    buyer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/buyers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Buyers
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Lead</h1>
            <p className="text-muted-foreground">Update buyer information</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the buyer lead and all associated history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Basic contact details for the buyer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormDescription>10-15 digits only</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Property Requirements Card */}
          <Card>
            <CardHeader>
              <CardTitle>Property Requirements</CardTitle>
              <CardDescription>Details about the property they're looking for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showBhkField && (
                  <FormField
                    control={form.control}
                    name="bhk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BHK *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select BHK" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bhkOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purposeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Min (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Minimum budget"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Max (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Maximum budget"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timelineOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Source, notes, and tags for better organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sourceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any additional notes..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add tags (press Enter or comma to add)"
                      />
                    </FormControl>
                    <FormDescription>Press Enter or comma to add tags</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Lead
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/buyers/${buyer.id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
