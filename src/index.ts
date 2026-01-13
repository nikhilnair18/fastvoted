import { readFileSync, existsSync } from 'fs';

// Load .env file if it exists
const envPath = new URL('../.env', import.meta.url).pathname;
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
}

import { POLL_INTERVAL_MINUTES } from './config.js';
import { fetchHackerNewsTrending } from './sources/hackernews.js';
import { fetchRedditTrending } from './sources/reddit.js';
import { postToSlack } from './slack.js';
import type { TrendingPost } from './types.js';

async function fetchAllTrending(): Promise<TrendingPost[]> {
  console.log('\n========================================');
  console.log(`[Fastvoted] Fetching at ${new Date().toISOString()}`);
  console.log('========================================\n');

  const [hnPosts, redditPosts] = await Promise.all([
    fetchHackerNewsTrending(),
    fetchRedditTrending(),
  ]);

  // Combine and sort by score (normalized)
  const allPosts = [...hnPosts, ...redditPosts];

  // Balance 50/50 between tech and non-tech
  const techPosts = allPosts.filter((p) =>
    ['TECH', 'STARTUP'].includes(p.category)
  );
  const otherPosts = allPosts.filter((p) =>
    ['WORLD', 'IDEAS'].includes(p.category)
  );

  // Take top from each category to maintain balance
  const maxPerCategory = 4;
  const balanced = [
    ...techPosts.slice(0, maxPerCategory),
    ...otherPosts.slice(0, maxPerCategory),
  ];

  // Sort by score descending
  balanced.sort((a, b) => b.score - a.score);

  console.log(`[Fastvoted] Total balanced: ${balanced.length} posts`);
  return balanced;
}

async function run(): Promise<void> {
  const posts = await fetchAllTrending();
  await postToSlack(posts);
}

// Check for --once flag (single run, no loop)
const runOnce = process.argv.includes('--once');

if (runOnce) {
  console.log('[Fastvoted] Running once...');
  run().then(() => {
    console.log('[Fastvoted] Done!');
    process.exit(0);
  });
} else {
  console.log(`[Fastvoted] Starting scheduler (every ${POLL_INTERVAL_MINUTES} min)`);
  console.log('[Fastvoted] Press Ctrl+C to stop\n');

  // Run immediately
  run();

  // Then run on interval
  setInterval(run, POLL_INTERVAL_MINUTES * 60 * 1000);
}
