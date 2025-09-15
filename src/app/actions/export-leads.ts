"use server"

import { db } from "@/db/drizzle"
import { buyers } from "@/db/schema"
import { and, asc, desc, like, SQL, sql } from "drizzle-orm"
import type { AnyColumn, InferSelectModel } from "drizzle-orm";
import { keyof } from "zod";

// 1. Define a type for the filters. 
// A filter is a SQL expression, which Drizzle's `and` function returns.
// The `SQL<unknown>` type is a good general-purpose type for these.
type Filter = SQL<unknown>;

// 2. Define the type for sortable columns to prevent runtime errors.
// This is the same type-safe pattern we've used before.
const sortableColumns: Record<string, AnyColumn> = {
  fullName: buyers.fullName,
  phone: buyers.phone,
  city: buyers.city,
  propertyType: buyers.propertyType,
  bhk: buyers.bhk,
  purpose: buyers.purpose,
  budgetMin: buyers.budgetMin,
  budgetMax: buyers.budgetMax,
  timeline: buyers.timeline,
  source: buyers.source,
  notes: buyers.notes,
  tags: buyers.tags,
  status: buyers.status,
  updatedAt: buyers.updatedAt,
};


// 3. Define the main function with correct types
export async function exportLeads(
  filters: Filter[], // Use the `Filter` type for the filters array
  sortColumnName: keyof typeof sortableColumns, // Ensure the sort column is a valid key
  sortOrder: "asc" | "desc"
) {
  try {
    const sortColumn = sortableColumns[sortColumnName] || buyers.updatedAt;
    const sort = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    const buyerList = await db
      .select()
      .from(buyers)
      .where(and(...filters))
      .orderBy(sort);

    if (buyerList.length === 0) {
      return null;
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
    ];
    type Buyer = InferSelectModel<typeof buyers>;

    const csvContent = [
      headers.join(","),
      ...buyerList.map((row) =>
        headers.map((header) => {
          const value = (row as Buyer)[header as keyof Buyer] || ""; // Still need a cast here since `headers` is a string array
          return `"${String(value).replace(/"/g, '""')}"`; // Escape double quotes for proper CSV formatting
        }).join(",")
      ),
    ].join("\n");

    return csvContent;

  } catch (error) {
    console.error("Failed to export leads:", error);
    throw new Error("Failed to export leads.");
  }
}