import { db } from "@/db/drizzle";
import { buyers, buyerHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "./session";
import { BuyerHistoryItem } from "@/components/buyers/buyer-history";

export async function getBuyerDetails(id: string) {
  const session = await getSession();
  const user = session?.createdAt ? session : null;
  if (!user) {
    throw new Error("Not authorized");
  }

  const [buyer] = await db.select().from(buyers).where(eq(buyers.id, id));

  if (!buyer) {
    return null; // Or throw a "Not Found" error
  }

  // SECURITY CHECK: Ensure the user owns this record
  if (buyer.ownerId !== user.id) {
    throw new Error("Forbidden"); // User is logged in but doesn't own this
  }

  const rawHistory = await db
    .select()
    .from(buyerHistory)
    .where(eq(buyerHistory.buyerId, id))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5);

    // 2. Assert the type. This tells TypeScript to trust that the data shape is correct.
  const history = rawHistory as BuyerHistoryItem[];

  return { buyer, history };
}