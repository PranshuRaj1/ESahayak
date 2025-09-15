import { BuyerLeadForm } from "@/components/buyer-lead-form"
import { Suspense } from "react"

export default function NewBuyerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Buyer Lead</h1>
            <p className="text-muted-foreground">Add a new buyer lead to the system with all required information</p>
          </div>
          <Suspense fallback={<div>Loading form...</div>}>
            <BuyerLeadForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}