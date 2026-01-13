import type { RedditSubredditConfig, SourceConfig } from './types.js';

// Slack webhook URL - set via environment variable
export const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';

// How often to check for new content (in minutes)
export const POLL_INTERVAL_MINUTES = 30;

// Hacker News config
export const HN_CONFIG: SourceConfig = {
  name: 'Hacker News',
  category: 'TECH',
  minScore: 100,  // Lowered for better coverage
  maxAgeHours: 6, // Extended window
};

// Reddit configs by category
// Easily expandable - just add more entries!
export const REDDIT_CONFIGS: RedditSubredditConfig[] = [
  // Tech + Startup (50%)
  {
    name: 'r/programming',
    subreddit: 'programming',
    category: 'TECH',
    minScore: 100,
    maxAgeHours: 8,
  },
  {
    name: 'r/webdev',
    subreddit: 'webdev',
    category: 'TECH',
    minScore: 100,
    maxAgeHours: 8,
  },
  {
    name: 'r/startups',
    subreddit: 'startups',
    category: 'STARTUP',
    minScore: 50,
    maxAgeHours: 12,
  },

  // Politics + Geopolitics (25%)
  {
    name: 'r/worldnews',
    subreddit: 'worldnews',
    category: 'WORLD',
    minScore: 500,
    maxAgeHours: 4,
  },
  {
    name: 'r/geopolitics',
    subreddit: 'geopolitics',
    category: 'WORLD',
    minScore: 100,
    maxAgeHours: 8,
  },

  // Sociocultural + Ideas (25%)
  {
    name: 'r/TrueReddit',
    subreddit: 'TrueReddit',
    category: 'IDEAS',
    minScore: 50,
    maxAgeHours: 12,
  },
  {
    name: 'r/philosophy',
    subreddit: 'philosophy',
    category: 'IDEAS',
    minScore: 100,
    maxAgeHours: 8,
  },
];

// Posts already sent (in-memory for now, could be persisted)
export const sentPostIds = new Set<string>();
