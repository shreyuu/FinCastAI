export type Sentiment = "Positive" | "Negative" | "Neutral";

/**
 * The FinBERT label of one /news-impact reason. The backend prefixes each
 * reason with "[Positive]", "[Negative]" or "[Neutral]", so read that prefix;
 * matching the word anywhere would mislabel a headline that merely contains it.
 */
export function sentimentOf(reason: string): Sentiment {
  if (reason.startsWith("[Positive]")) return "Positive";
  if (reason.startsWith("[Negative]")) return "Negative";
  return "Neutral";
}
