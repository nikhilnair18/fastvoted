import { REDDIT_CONFIGS, sentPostIds } from '../config.js';
import type { TrendingPost } from '../types.js';

interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    permalink: string;
    score: number;
    created_utc: number;
    subreddit: string;
    num_comments: number;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

async function fetchSubreddit(subreddit: string): Promise<RedditPost[]> {
  try {
    // Using .json endpoint - no auth needed for public subreddits
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
      {
        headers: {
          'User-Agent': 'Fastvoted/1.0 (Slack Integration)',
        },
      }
    );

    if (!res.ok) {
      console.warn(`[Reddit] Failed to fetch r/${subreddit}: ${res.status}`);
      return [];
    }

    const data: RedditResponse = await res.json();
    return data.data.children;
  } catch (err) {
    console.warn(`[Reddit] Error fetching r/${subreddit}:`, err);
    return [];
  }
}

export async function fetchRedditTrending(): Promise<TrendingPost[]> {
  console.log('[Reddit] Fetching from configured subreddits...');

  const trending: TrendingPost[] = [];
  const now = Date.now() / 1000;

  for (const config of REDDIT_CONFIGS) {
    const posts = await fetchSubreddit(config.subreddit);

    for (const post of posts) {
      const { data } = post;
      const ageHours = (now - data.created_utc) / 3600;
      const postId = `reddit-${data.id}`;

      // Check thresholds and if already sent
      if (
        data.score >= config.minScore &&
        ageHours <= config.maxAgeHours &&
        !sentPostIds.has(postId)
      ) {
        trending.push({
          id: postId,
          title: data.title,
          url: data.url.startsWith('/r/')
            ? `https://reddit.com${data.url}`
            : data.url,
          score: data.score,
          category: config.category,
          source: 'reddit',
          subreddit: data.subreddit,
          ageHours: Math.round(ageHours * 10) / 10,
          commentsUrl: `https://reddit.com${data.permalink}`,
        });
      }
    }

    // Small delay to be nice to Reddit's rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`[Reddit] Found ${trending.length} trending posts`);
  return trending;
}
