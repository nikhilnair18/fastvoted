import { SLACK_WEBHOOK_URL, sentPostIds } from './config.js';
import type { TrendingPost } from './types.js';

function formatScore(score: number): string {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return String(score);
}

function formatPost(post: TrendingPost): string {
  const sourceLabel =
    post.source === 'hackernews'
      ? 'HN'
      : `r/${post.subreddit}`;

  return `[${post.category}] *<${post.url}|${post.title}>* (${formatScore(post.score)} pts) - <${post.commentsUrl}|${sourceLabel}>`;
}

export async function postToSlack(posts: TrendingPost[]): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.log('[Slack] No webhook URL configured - printing to console instead:\n');
    posts.forEach((post) => console.log(formatPost(post)));
    console.log('');
    return;
  }

  if (posts.length === 0) {
    console.log('[Slack] No new posts to send');
    return;
  }

  // Group by category for cleaner output
  const byCategory = posts.reduce(
    (acc, post) => {
      if (!acc[post.category]) acc[post.category] = [];
      acc[post.category].push(post);
      return acc;
    },
    {} as Record<string, TrendingPost[]>
  );

  // Build message blocks
  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Trending Now (${posts.length} posts)`,
      },
    },
  ];

  for (const [category, categoryPosts] of Object.entries(byCategory)) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: categoryPosts.map(formatPost).join('\n\n'),
      },
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `_Fastvoted | ${new Date().toLocaleTimeString()}_`,
      },
    ],
  });

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (res.ok) {
      // Mark as sent
      posts.forEach((post) => sentPostIds.add(post.id));
      console.log(`[Slack] Posted ${posts.length} items`);
    } else {
      console.error(`[Slack] Failed to post: ${res.status}`);
    }
  } catch (err) {
    console.error('[Slack] Error posting:', err);
  }
}
