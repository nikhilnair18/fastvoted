export type ContentCategory = 'TECH' | 'STARTUP' | 'WORLD' | 'IDEAS';

export interface TrendingPost {
  id: string;
  title: string;
  url: string;
  score: number;
  category: ContentCategory;
  source: 'hackernews' | 'reddit';
  subreddit?: string;
  ageHours: number;
  commentsUrl: string;
}

export interface SourceConfig {
  name: string;
  category: ContentCategory;
  minScore: number;
  maxAgeHours: number;
}

export interface RedditSubredditConfig extends SourceConfig {
  subreddit: string;
}
