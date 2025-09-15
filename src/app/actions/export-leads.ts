"use server"

import { db } from "@/db/drizzle" // Adjust path to your Drizzle DB instance
import { buyers } from "@/db/schema" // Adjust path to your buyers schema
import { and, asc, desc, like } from "drizzle-orm"

// This function will be called from the client component
export async function exportLeads(filters: any, sortColumn: any, sortOrder: "asc" | "desc") {
  try {
    // Build the query dynamically based on client-side parameters
    const queryFilters = filters ? filters.map((f: any) => and(f)) : []
    const sort = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn)

    const buyerList = await db
      .select()
      .from(buyers)
      .where(and(...queryFilters))
      .orderBy(sort)

    if (buyerList.length === 0) {
      return null
    }

    // Prepare CSV content
    const headers = [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "notes",
      "tags",
      "status",
    ]
    const csvContent = [
      headers.join(","),
      ...buyerList.map((row) =>
        headers.map((header) => `"${(row as any)[header] || ""}"`).join(",")
      ),
    ].join("\n")

    return csvContent
  } catch (error) {
    console.error("Failed to export leads:", error)
    throw new Error("Failed to export leads.")
  }
}