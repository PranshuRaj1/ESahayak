import { Suspense } from "react"
import { BuyersListPage } from "@/components/buyers-list"
import { CsvImportExport } from "@/components/csv-import-export"
import NewEntry from "@/components/newEntry"

export default function Buyers() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Buyers Management</h1>
            <p className="text-muted-foreground mt-2">Manage and search through your buyer database</p>
          </div>
          <div className="flex space-x-2">
            <NewEntry />
          </div>
        </div>
        
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <BuyersListPage />
          <CsvImportExport />
        </Suspense>
      </div>
    </div>
  )
}