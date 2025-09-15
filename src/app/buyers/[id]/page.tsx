import { Suspense } from "react";
// Adjust this import path to wherever you saved your BuyerViewEdit component
import { BuyerViewEdit } from "@/components/buyer-view-edit"; 

// Define a loading skeleton component (you can customize this)
const BuyerLoadingSkeleton = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// This is the page component that Next.js will render for routes like /buyer/123-abc
// It receives the `id` from the URL via the `params` prop.
export default function BuyerDetailPage({ params }: { params: { id: string } }) {
  // We extract the id from the URL parameters
  const { id } = params;

  return (
    <Suspense fallback={<BuyerLoadingSkeleton />}>
      {/* Here, you render your client component and pass the `id` from the URL
        as a prop. Your component's `useEffect` will then use this ID
        to fetch the specific buyer's data.
      */}
      <BuyerViewEdit id={id} />
    </Suspense>
  );
}