import { Suspense } from "react"
import { BuyersListPage } from "@/components/buyers-list"

export default function Buyers() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Buyers Management</h1>
          <p className="text-muted-foreground mt-2">Manage and search through your buyer database</p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <BuyersListPage />
        </Suspense>
      </div>
    </div>
  )
}
