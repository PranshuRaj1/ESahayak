import { z } from "zod"

export const createBuyerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
    source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // BHK required for Apartment/Villa
      if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
        return false
      }
      return true
    },
    {
      message: "BHK is required for Apartment and Villa properties",
      path: ["bhk"],
    },
  )
  .refine(
    (data) => {
      // Budget validation
      if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
        return false
      }
      return true
    },
    {
      message: "Budget max must be greater than or equal to budget min",
      path: ["budgetMax"],
    },
  )

export const updateBuyerSchema = createBuyerSchema.safeExtend({
  updatedAt: z.date(),
})

export const buyerFiltersSchema = z.object({
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]).optional(),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]).optional(),
  status: z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]).optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})
