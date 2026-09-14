import { listCards } from "../lib/data";

export default async function sitemap() {
  const base = "https://www.shopapexcards.com";

  const staticRoutes = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/singles`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/sold`, changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/pokemon-sets`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/terms`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.2 },
  ];

  let cardRoutes = [];
  try {
    const { cards } = await listCards({ page: 1, includeSold: true });
    cardRoutes = cards.map((card) => ({
      url: `${base}/cards/${card.id}`,
      changeFrequency: "daily",
      priority: card.sold ? 0.3 : 0.8,
    }));
  } catch {
    // If the DB is briefly unreachable at build/request time, still ship the static routes.
  }

  return [...staticRoutes, ...cardRoutes];
}
