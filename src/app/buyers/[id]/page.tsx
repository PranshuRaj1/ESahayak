  import { notFound } from "next/navigation"
  import Link from "next/link"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Badge } from "@/components/ui/badge"
  import { BuyerHistory } from "@/components/buyers/buyer-history"
  import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, DollarSign, Tag } from "lucide-react"
  import { formatDistanceToNow } from "date-fns"
  import { getSession } from "@/lib/session"
  import { getBuyerDetails } from "@/lib/buyers"

  interface BuyerPageProps {
    params: { id: string }
  }


  const statusColors = {
    New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Visited: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    Negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    Converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    Dropped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  export default async function BuyerPage({ params }: BuyerPageProps) {
    const [data, currentUser] = await Promise.all([
      getBuyerDetails(params.id),
      getSession()
    ]);
    

    // Handle errors (catch them or check nulls)
    if (!data || !currentUser) {
      // getBuyerDetails will throw if unauthorized, but data can be null if not found
      notFound();
    }

    const { buyer, history } = data
    const canEdit = currentUser?.id === buyer.ownerId

    const formatBudget = (min?: number | null, max?: number | null) => {
      if (!min && !max) return "Not specified"

      const formatAmount = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
        return `₹${amount.toLocaleString()}`
      }

      if (min && max) {
        return `${formatAmount(min)} - ${formatAmount(max)}`
      }
      return min ? `${formatAmount(min)}+` : `Up to ${formatAmount(max!)}`
    }

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/buyers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Buyers
            </Link>
          </Button>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{buyer.fullName}</h1>
              <p className="text-muted-foreground">
                Lead created {formatDistanceToNow(new Date(buyer.updatedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={statusColors[buyer.status as keyof typeof statusColors]}>
                {buyer.status}
              </Badge>
              {canEdit && (
                <Button asChild>
                  <Link href={`/buyers/${buyer.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground font-mono">{buyer.phone}</p>
                    </div>
                  </div>
                  {buyer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{buyer.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">City</p>
                      <p className="text-sm text-muted-foreground">{buyer.city}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Property Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Property Type</p>
                    <p className="text-sm text-muted-foreground">
                      {buyer.propertyType}
                      {buyer.bhk && <span className="ml-1">({buyer.bhk} BHK)</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Purpose</p>
                    <p className="text-sm text-muted-foreground">{buyer.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-muted-foreground">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Timeline</p>
                      <p className="text-sm text-muted-foreground">{buyer.timeline}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {buyer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{buyer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p className="text-sm text-muted-foreground">{buyer.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline" className={statusColors[buyer.status as keyof typeof statusColors]}>
                    {buyer.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(buyer.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {buyer.tags && buyer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {buyer.tags.map((tag : string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <BuyerHistory history={history} />
          </div>
        </div>
      </div>
    )
  }
