import { HN_CONFIG, sentPostIds } from '../config.js';
import type { TrendingPost } from '../types.js';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  descendants?: number;
}

async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(`${HN_API_BASE}/item/${id}.json`);
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchHackerNewsTrending(): Promise<TrendingPost[]> {
  console.log('[HN] Fetching top stories...');

  const res = await fetch(`${HN_API_BASE}/topstories.json`);
  const topIds: number[] = await res.json();

  // Check top 50 stories
  const items = await Promise.all(topIds.slice(0, 50).map(fetchItem));

  const now = Date.now() / 1000;
  const trending: TrendingPost[] = [];

  for (const item of items) {
    if (!item) continue;

    const ageHours = (now - item.time) / 3600;
    const postId = `hn-${item.id}`;

    // Check thresholds and if already sent
    if (
      item.score >= HN_CONFIG.minScore &&
      ageHours <= HN_CONFIG.maxAgeHours &&
      !sentPostIds.has(postId)
    ) {
      trending.push({
        id: postId,
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        score: item.score,
        category: 'TECH',
        source: 'hackernews',
        ageHours: Math.round(ageHours * 10) / 10,
        commentsUrl: `https://news.ycombinator.com/item?id=${item.id}`,
      });
    }
  }

  console.log(`[HN] Found ${trending.length} trending posts`);
  return trending;
}
