"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { History, User } from "lucide-react"

export interface BuyerHistoryItem {
  id: string
  buyerId: string
  changedBy: string
  changedAt: Date
  diff: {
    action: string
    changes: Record<string, { old: any; new: any }>
  }
}

export interface BuyerHistoryProps {
  history: BuyerHistoryItem[]
}

export function BuyerHistory({ history }: BuyerHistoryProps) {
  const formatValue = React.useCallback((value: any) => {
    if (value === null || value === undefined) return "—"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return value.join(", ")
    return String(value)
  }, [])

  const getActionColor = React.useCallback((action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "status_updated":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }, [])

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No changes recorded yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Change History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getActionColor(item.diff.action)}>
                {item.diff.action.replace("_", " ")}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{item.changedBy}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(item.changedAt), { addSuffix: true })}</span>
              </div>
            </div>

            {item.diff.action === "created" ? (
              <p className="text-sm text-muted-foreground">Lead created</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(item.diff.changes).map(([field, change]) => (
                  <div key={field} className="text-sm">
                    <span className="font-medium capitalize">{field.replace(/([A-Z])/g, " $1").toLowerCase()}:</span>
                    <div className="ml-2 flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400 line-through">{formatValue(change.old)}</span>
                      <span>→</span>
                      <span className="text-green-600 dark:text-green-400">{formatValue(change.new)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
