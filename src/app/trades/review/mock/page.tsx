import TradeReview from "../../TradeReview";

export const dynamic = "force-dynamic";

export default function TradesReviewMockPage() {
  return <TradeReview returnTo="/trades/review/mock" backHref="/journal?preset=month" />;
}
