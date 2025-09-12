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
import { createBuyerSchema } from "@/lib/validation"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { z } from "zod"

type CreateBuyerFormData = z.infer<typeof createBuyerSchema>

const cityOptions = React.useMemo(
  () => [
    { value: "Chandigarh", label: "Chandigarh" },
    { value: "Mohali", label: "Mohali" },
    { value: "Zirakpur", label: "Zirakpur" },
    { value: "Panchkula", label: "Panchkula" },
    { value: "Other", label: "Other" },
  ],
  [],
)

const propertyTypeOptions = React.useMemo(
  () => [
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Office", label: "Office" },
    { value: "Retail", label: "Retail" },
  ],
  [],
)

const bhkOptions = React.useMemo(
  () => [
    { value: "Studio", label: "Studio" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4", label: "4 BHK" },
  ],
  [],
)

const purposeOptions = React.useMemo(
  () => [
    { value: "Buy", label: "Buy" },
    { value: "Rent", label: "Rent" },
  ],
  [],
)

const timelineOptions = React.useMemo(
  () => [
    { value: "0-3m", label: "0-3 months" },
    { value: "3-6m", label: "3-6 months" },
    { value: ">6m", label: "More than 6 months" },
    { value: "Exploring", label: "Just exploring" },
  ],
  [],
)

const sourceOptions = React.useMemo(
  () => [
    { value: "Website", label: "Website" },
    { value: "Referral", label: "Referral" },
    { value: "Walk-in", label: "Walk-in" },
    { value: "Call", label: "Phone Call" },
    { value: "Other", label: "Other" },
  ],
  [],
)

export const CreateBuyerForm = React.memo(() => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<CreateBuyerFormData>({
    resolver: zodResolver(createBuyerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: undefined,
      propertyType: undefined,
      bhk: undefined,
      purpose: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      timeline: undefined,
      source: undefined,
      notes: "",
      tags: [],
    },
  })

  const propertyType = form.watch("propertyType")
  const showBhkField = React.useMemo(() => propertyType === "Apartment" || propertyType === "Villa", [propertyType])

  const onSubmit = React.useCallback(
    async (data: CreateBuyerFormData) => {
      setIsSubmitting(true)
      try {
        const response = await fetch("/api/buyers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to create buyer")
        }

        const buyer = await response.json()

        toast("Success",{
          
          description: "Buyer lead created successfully",
        })

        router.push(`/buyers/${buyer.id}`)
      } catch (error) {
        console.error("Error creating buyer:", error)
        toast("Error",{
          description: error instanceof Error ? error.message : "Failed to create buyer. Please try again.",

        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [router],
  )

  const handleBudgetMinChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    return e.target.value ? Number.parseInt(e.target.value) : undefined
  }, [])

  const handleBudgetMaxChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    return e.target.value ? Number.parseInt(e.target.value) : undefined
  }, [])

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/buyers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Buyers
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Lead</h1>
        <p className="text-muted-foreground">Add a new buyer lead to your database</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          onChange={(e) => field.onChange(handleBudgetMinChange(e))}
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
                          onChange={(e) => field.onChange(handleBudgetMaxChange(e))}
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
              Create Lead
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/buyers">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
})

CreateBuyerForm.displayName = "CreateBuyerForm"
