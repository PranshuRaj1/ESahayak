import { notFound, redirect } from "next/navigation"
import { EditBuyerForm } from "@/components/buyers/edit-buyer-form"
import { getCurrentUser } from "@/lib/auth"

interface EditBuyerPageProps {
  params: { id: string }
}

async function fetchBuyer(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/buyers/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.buyer
  } catch (error) {
    console.error("Error fetching buyer:", error)
    return null
  }
}

export default async function EditBuyerPage({ params }: EditBuyerPageProps) {
  const buyer = await fetchBuyer(params.id)
  const currentUser = await getCurrentUser()

  if (!buyer) {
    notFound()
  }

  const canEdit = currentUser?.id === buyer.ownerId

  if (!canEdit) {
    redirect(`/buyers/${params.id}`)
  }

  return <EditBuyerForm buyer={buyer} canEdit={canEdit} />
}
