import TradeReview from "../../TradeReview";
import { getActiveAccount } from "@/lib/accountScope";

export const dynamic = "force-dynamic";

export default async function TradesReviewMockPage() {
  const activeAccount = await getActiveAccount();
  return <TradeReview returnTo="/trades/review/mock" backHref="/journal?preset=month" accountId={activeAccount.id} />;
}
