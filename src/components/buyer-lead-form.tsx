"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- UPDATED INTERFACE to allow null for empty numbers ---
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  budgetMin: number | null; // <-- CHANGED
  budgetMax: number | null; // <-- CHANGED
  timeline: string;
  source: string;
  notes: string;
  tags: string[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

// --- Enums ---
const cityOptions = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"] as const;
const propertyTypeOptions = ["Apartment", "Villa", "Plot", "Office", "Retail"] as const;
const bhkOptions = ["1", "2", "3", "4", "Studio"] as const;
const purposeOptions = ["Buy", "Rent"] as const;
const timelineOptions = ["0-3m", "3-6m", ">6m", "Exploring"] as const;
const sourceOptions = ["Website", "Referral", "Walk-in", "Call", "Other"] as const;

export function BuyerLeadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    propertyType: "",
    bhk: "",
    purpose: "",
    budgetMin: 6000000, // This default is fine
    budgetMax: 7000000, // This default is fine
    timeline: "",
    source: "",
    notes: "",
    tags: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side validation is unchanged
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be a 10-15 digit number";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    // Updated check to handle null
    if (formData.budgetMin !== null && formData.budgetMax !== null) {
      if (formData.budgetMax < formData.budgetMin) {
        newErrors.budgetMax = "Max budget must be >= Min budget";
      }
    }
    if (["Apartment", "Villa"].includes(formData.propertyType) && !formData.bhk) {
      newErrors.bhk = "BHK is required for Apartment/Villa";
    }
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (!formData.timeline) newErrors.timeline = "Timeline is required";
    if (!formData.source) newErrors.source = "Source is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- FIXED HANDLERS ---
  // Handler for all text inputs and select dropdowns
  const handleTextChange = (
    field: keyof Omit<FormData, "budgetMin" | "budgetMax" | "tags">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // NEW: Dedicated handler for number inputs
  const handleNumberChange = (
    field: "budgetMin" | "budgetMax",
    value: string
  ) => {
    // Convert empty string to null, otherwise parse as integer
    const numValue = value === "" ? null : parseInt(value, 10);
    
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(numValue!) ? null : numValue, // Store null if input is empty or invalid
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  // --- END OF FIXED HANDLERS ---


  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // --- UPDATED API DATA ---
    // Prepare data, converting nulls to undefined to satisfy Zod's .optional()
    const apiData = {
      ...formData,
      email: formData.email || undefined,
      bhk: formData.bhk || undefined,
      budgetMin: formData.budgetMin === null ? undefined : formData.budgetMin, // <-- FIXED
      budgetMax: formData.budgetMax === null ? undefined : formData.budgetMax, // <-- FIXED
      notes: formData.notes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    try {
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData), // This now sends real numbers or undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.details) {
          const zodErrors: FormErrors = {};
          for (const [key, value] of Object.entries(errorData.details as Record<string, string[]>)) {
            if (Array.isArray(value) && value.length > 0) {
              zodErrors[key] = value[0];
            }
          }
          setErrors(zodErrors);
          setApiError("Please correct the errors in the form.");
        } else {
          setApiError(errorData.error || "An unknown error occurred.");
        }
        return;
      }

      router.push("/buyers");
    } catch (error) {
      console.error("Submission failed:", error);
      setApiError("Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX Form (Only updated onChange/value props are shown in comments) ---
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Buyer Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && !Object.keys(errors).length && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleTextChange("fullName", e.target.value)} // <-- UPDATED HANDLER
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleTextChange("phone", e.target.value)} // <-- UPDATED HANDLER
                placeholder="10-15 digits"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleTextChange("email", e.target.value)} // <-- UPDATED HANDLER
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select value={formData.city} onValueChange={(value) => handleTextChange("city", value)}> {/* <-- UPDATED HANDLER */}
                <SelectTrigger className={errors.city ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>
          </div>

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleTextChange("propertyType", value)}> {/* <-- UPDATED HANDLER */}
                <SelectTrigger className={errors.propertyType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && <p className="text-sm text-destructive">{errors.propertyType}</p>}
            </div>

            {["Apartment", "Villa"].includes(formData.propertyType) && (
              <div className="space-y-2">
                <Label htmlFor="bhk">BHK *</Label>
                <Select value={formData.bhk} onValueChange={(value) => handleTextChange("bhk", value)}> {/* <-- UPDATED HANDLER */}
                  <SelectTrigger className={errors.bhk ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    {bhkOptions.map((bhk) => (
                      <SelectItem key={bhk} value={bhk}>
                        {bhk === "Studio" ? "Studio" : `${bhk} BHK`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bhk && <p className="text-sm text-destructive">{errors.bhk}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Select value={formData.purpose} onValueChange={(value) => handleTextChange("purpose", value)}> {/* <-- UPDATED HANDLER */}
                <SelectTrigger className={errors.purpose ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {purposeOptions.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.purpose && <p className="text-sm text-destructive">{errors.purpose}</p>}
            </div>
          </div>

          {/* Budget Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Minimum Budget (₹)</Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin ?? ""} // <-- UPDATED VALUE
                onChange={(e) => handleNumberChange("budgetMin", e.target.value)} // <-- UPDATED HANDLER
                placeholder="e.g., 5000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget (₹)</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax ?? ""} // <-- UPDATED VALUE
                onChange={(e) => handleNumberChange("budgetMax", e.target.value)} // <-- UPDATED HANDLER
                placeholder="e.g., 7500000"
                className={errors.budgetMax ? "border-destructive" : ""}
              />
              {errors.budgetMax && <p className="text-sm text-destructive">{errors.budgetMax}</p>}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline *</Label>
              <Select value={formData.timeline} onValueChange={(value) => handleTextChange("timeline", value)}> {/* <-- UPDATED HANDLER */}
                <SelectTrigger className={errors.timeline ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map((timeline) => (
                    <SelectItem key={timeline} value={timeline}>
                      {timeline === "0-3m" && "0-3 months"}
                      {timeline === "3-6m" && "3-6 months"}
                      {timeline === ">6m" && "> 6 months"}
                      {timeline === "Exploring" && "Just Exploring"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select value={formData.source} onValueChange={(value) => handleTextChange("source", value)}> {/* <-- UPDATED HANDLER */}
                <SelectTrigger className={errors.source ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source && <p className="text-sm text-destructive">{errors.source}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add Tag
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-md border p-2 min-h-[40px]">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleTextChange("notes", e.target.value)} // <-- UPDATED HANDLER
              placeholder="Additional notes or comments"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Creating Lead..." : "Create Buyer Lead"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}