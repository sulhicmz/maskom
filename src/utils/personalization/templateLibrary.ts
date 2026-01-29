/**
 * Personalization Rule Templates
 * 
 * Pre-built personalization rule templates for common use cases to accelerate
 * personalization implementation and provide best practices.
 */

import type {
  PersonalizationRule,
  ContentVariant,
  RuleCondition
} from '@/types/personalization';

/**
 * Template categories for organizing rule templates
 */
export type TemplateCategory =
  | 'engagement-based'
  | 'segment-based'
  | 'behavioral'
  | 'content-type'
  | 'time-based'
  | 'geographic';

/**
 * Personalization template metadata
 */
export interface PersonalizationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rule: PersonalizationRule;
  variants: ContentVariant[];
  metadata: TemplateMetadata;
}

/**
 * Template metadata for categorization and search
 */
export interface TemplateMetadata {
  tags: string[];
  targetSegments: string[];
  contentType: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  estimatedLift: number;
  useCases: string[];
  prerequisites: string[];
}

/**
 * Template application configuration
 */
export interface TemplateApplicationConfig {
  customizeConditions?: boolean;
  customizeVariants?: boolean;
  customizePriority?: boolean;
  activateImmediately?: boolean;
  notes?: string;
}

/**
 * Template performance metrics
 */
export interface TemplatePerformanceMetrics {
  templateId: string;
  timesUsed: number;
  activeCount: number;
  avgLift: number;
  bestLift: number;
  lastUsed: string;
  rating: number;
}

/**
 * Template usage statistics
 */
export interface TemplateUsageStats {
  templateId: string;
  appliedAt: string;
  ruleId: string;
  isActive: boolean;
  impressions: number;
  lift: number;
  rating?: number;
}

// ============================================================================
// TEMPLATES
// ============================================================================

/**
 * Template: New Visitor Welcome Message
 * 
 * Shows a personalized welcome message to first-time visitors with
 * a call-to-action to explore the most popular content.
 */
export const newVisitorWelcomeTemplate: PersonalizationTemplate = {
  id: 'new-visitor-welcome',
  name: 'New Visitor Welcome Message',
  description: 'Personalized welcome message for first-time visitors with popular content recommendations',
  category: 'segment-based',
  difficulty: 'beginner',
  rule: {
    id: '',
    name: 'New Visitor Welcome',
    description: 'Welcome message for first-time visitors',
    segment: 'new_visitor',
    contentType: 'hero_section',
    trigger: {
      type: 'page_view',
      condition: 'equals',
      value: '/'
    },
    isActive: true,
    priority: 10,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  variants: [
    {
      id: 'welcome-variant-1',
      ruleId: '',
      name: 'Welcome with Popular Content',
      description: 'Welcome message with popular blog posts',
      content: {
        headline: 'Selamat Datang di Maskom!',
        subheadline: 'Temukan konten inspiratif dan bermanfaat untuk perjalanan digital Anda.',
        cta: 'Jelajahi Konten Populer',
        featuredContent: 'popular'
      },
      weight: 60,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'welcome-variant-2',
      ruleId: '',
      name: 'Welcome with Getting Started Guide',
      description: 'Welcome message with getting started guide',
      content: {
        headline: 'Halo! Baru di sini?',
        subheadline: 'Panduan memulai untuk mengenal layanan kami.',
        cta: 'Mulai Sekarang',
        featuredContent: 'getting-started'
      },
      weight: 40,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metadata: {
    tags: ['onboarding', 'engagement', 'new-users'],
    targetSegments: ['new_visitor'],
    contentType: ['hero_section', 'banner'],
    estimatedImpact: 'high',
    estimatedLift: 15,
    useCases: [
      'Welcome first-time visitors',
      'Increase engagement for new users',
      'Guide users to popular content'
    ],
    prerequisites: []
  }
};

/**
 * Template: Returning Reader Highlights
 * 
 * Shows personalized content highlights based on user's reading history
 * and preferences for returning visitors.
 */
export const returningReaderHighlightsTemplate: PersonalizationTemplate = {
  id: 'returning-reader-highlights',
  name: 'Returning Reader Highlights',
  description: 'Personalized content recommendations based on reading history for returning visitors',
  category: 'behavioral',
  difficulty: 'intermediate',
  rule: {
    id: '',
    name: 'Returning Reader Highlights',
    description: 'Content recommendations based on reading history',
    segment: 'returning_visitor',
    contentType: 'content_section',
    trigger: {
      type: 'page_view',
      condition: 'equals',
      value: '/blog'
    },
    isActive: true,
    priority: 8,
    variants: [],
    conditions: [
      {
        field: 'readArticleCount',
        operator: 'greater_than',
        value: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  variants: [
    {
      id: 'highlights-variant-1',
      ruleId: '',
      name: 'Continue Reading',
      description: 'Show articles the user started reading',
      content: {
        headline: 'Lanjutkan Membaca',
        subheadline: 'Anda punya artikel yang belum selesai dibaca.',
        cta: 'Lanjutkan',
        sourceType: 'reading_history',
        contentSource: 'in_progress'
      },
      weight: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'highlights-variant-2',
      ruleId: '',
      name: 'Similar Articles',
      description: 'Show articles similar to what user has read',
      content: {
        headline: 'Anda mungkin menyukai ini',
        subheadline: 'Berdasarkan minat bacaan Anda.',
        cta: 'Baca Sekarang',
        sourceType: 'recommendation',
        contentSource: 'similar_to_history'
      },
      weight: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metadata: {
    tags: ['retention', 'personalization', 'content-discovery'],
    targetSegments: ['returning_visitor', 'frequent_reader'],
    contentType: ['content_section', 'recommendation_carousel'],
    estimatedImpact: 'medium',
    estimatedLift: 12,
    useCases: [
      'Improve content discovery',
      'Increase reading time',
      'Personalize content feed'
    ],
    prerequisites: [
      'Reading history tracking',
      'User behavior analysis'
    ]
  }
};

/**
 * Template: Content Creator Spotlight
 * 
 * Highlights featured content creators and their contributions for
 * users who have shown interest in content creation.
 */
export const contentCreatorSpotlightTemplate: PersonalizationTemplate = {
  id: 'content-creator-spotlight',
  name: 'Content Creator Spotlight',
  description: 'Showcase featured content creators and their best work',
  category: 'segment-based',
  difficulty: 'beginner',
  rule: {
    id: '',
    name: 'Content Creator Spotlight',
    description: 'Featured content creator showcase',
    segment: 'content_creator',
    contentType: 'spotlight_section',
    trigger: {
      type: 'page_view',
      condition: 'contains',
      value: '/blog'
    },
    isActive: true,
    priority: 6,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  variants: [
    {
      id: 'spotlight-variant-1',
      ruleId: '',
      name: 'Creator of the Month',
      description: 'Highlight top content creator of the month',
      content: {
        headline: 'Kreator Konten Bulan Ini',
        subheadline: 'Mengenal lebih dekat kreator konten berbakat kami.',
        cta: 'Lihat Profil',
        spotlightType: 'monthly_winner'
      },
      weight: 70,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'spotlight-variant-2',
      ruleId: '',
      name: 'Rising Creators',
      description: 'Highlight upcoming content creators',
      content: {
        headline: 'Kreator Konten Pendatang Baru',
        subheadline: 'Talent baru yang patut Anda simak.',
        cta: 'Jelajahi',
        spotlightType: 'rising_stars'
      },
      weight: 30,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metadata: {
    tags: ['community', 'engagement', 'user-generated-content'],
    targetSegments: ['engaged_user', 'content_creator'],
    contentType: ['spotlight_section', 'feature'],
    estimatedImpact: 'medium',
    estimatedLift: 8,
    useCases: [
      'Highlight community members',
      'Encourage content creation',
      'Showcase user achievements'
    ],
    prerequisites: [
      'Content creator identification',
      'Creator rating system'
    ]
  }
};

/**
 * Template: Engagement-Based CTA
 * 
 * Adjusts call-to-action based on user engagement level to improve
 * conversion rates for highly engaged users.
 */
export const engagementBasedCTATemplate: PersonalizationTemplate = {
  id: 'engagement-based-cta',
  name: 'Engagement-Based CTA',
  description: 'Dynamic call-to-action based on user engagement level',
  category: 'engagement-based',
  difficulty: 'intermediate',
  rule: {
    id: '',
    name: 'Engagement-Based CTA',
    description: 'CTA adaptation based on engagement',
    segment: 'engaged_user',
    contentType: 'cta_component',
    trigger: {
      type: 'engagement_score',
      condition: 'greater_than',
      value: 70
    },
    isActive: true,
    priority: 9,
    variants: [],
    conditions: [
      {
        field: 'engagementScore',
        operator: 'greater_than',
        value: 80
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  variants: [
    {
      id: 'cta-variant-1',
      ruleId: '',
      name: 'Premium Upgrade CTA',
      description: 'Offer premium upgrade for highly engaged users',
      content: {
        headline: 'Tingkatkan Pengalaman Anda',
        subheadline: 'Akses fitur premium dan manfaat eksklusif.',
        cta: 'Upgrade Sekarang',
        ctaType: 'primary',
        offer: 'premium_upgrade',
        discount: '20%'
      },
      weight: 60,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cta-variant-2',
      ruleId: '',
      name: 'Newsletter Subscription',
      description: 'Encourage newsletter subscription',
      content: {
        headline: 'Jangan Lewatkan Konten Terbaru',
        subheadline: 'Berlangganan newsletter mingguan kami.',
        cta: 'Berlangganan',
        ctaType: 'secondary',
        offer: 'newsletter_subscription',
        benefit: 'eksklusif'
      },
      weight: 40,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metadata: {
    tags: ['conversion', 'engagement', 'monetization'],
    targetSegments: ['engaged_user', 'frequent_reader'],
    contentType: ['cta_component', 'button'],
    estimatedImpact: 'high',
    estimatedLift: 18,
    useCases: [
      'Increase conversion rates',
      'Target high-value users',
      'Improve monetization'
    ],
    prerequisites: [
      'Engagement score calculation',
      'User segmentation'
    ]
  }
};

/**
 * Template: Time-Based Content Promotion
 * 
 * Promotes different content based on time of day to match user
 * behavior patterns (morning, afternoon, evening).
 */
export const timeBasedPromotionTemplate: PersonalizationTemplate = {
  id: 'time-based-promotion',
  name: 'Time-Based Content Promotion',
  description: 'Promote content based on time of day and user behavior',
  category: 'time-based',
  difficulty: 'intermediate',
  rule: {
    id: '',
    name: 'Time-Based Content Promotion',
    description: 'Dynamic content promotion by time of day',
    segment: 'all_segments',
    contentType: 'promo_banner',
    trigger: {
      type: 'time_of_day',
      condition: 'range',
      value: '06:00-12:00'
    },
    isActive: true,
    priority: 5,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  variants: [
    {
      id: 'promo-morning',
      ruleId: '',
      name: 'Morning Content',
      description: 'Productivity-focused content for morning hours',
      content: {
        headline: 'Mulai Hari dengan Inspirasi',
        subheadline: 'Konten produktifitas untuk memulai hari Anda.',
        cta: 'Baca Artikel',
        timeSlot: 'morning',
        contentTheme: 'productivity'
      },
      weight: 100,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'promo-afternoon',
      ruleId: '',
      name: 'Afternoon Content',
      description: 'Learning-focused content for afternoon hours',
      content: {
        headline: 'Waktu Belajar',
        subheadline: 'Tingkatkan pengetahuan Anda dengan artikel pembelajaran.',
        cta: 'Mulai Belajar',
        timeSlot: 'afternoon',
        contentTheme: 'learning'
      },
      weight: 100,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'promo-evening',
      ruleId: '',
      name: 'Evening Content',
      description: 'Relaxing content for evening hours',
      content: {
        headline: 'Waktu Istirahat',
        subheadline: 'Konten santai untuk menutup hari.',
        cta: 'Baca Sekarang',
        timeSlot: 'evening',
        contentTheme: 'relaxation'
      },
      weight: 100,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metadata: {
    tags: ['personalization', 'behavioral', 'timing'],
    targetSegments: ['all_segments'],
    contentType: ['promo_banner', 'notification'],
    estimatedImpact: 'low',
    estimatedLift: 5,
    useCases: [
      'Match content to user habits',
      'Improve engagement timing',
      'Reduce content fatigue'
    ],
    prerequisites: [
      'Time zone detection',
      'User behavior analysis'
    ]
  }
};

/**
 * Template: Bookmark-Based Recommendations
 * 
 * Provides content recommendations based on user's bookmarked articles
 * and reading preferences.
 */
export const bookmarkBasedRecommendationsTemplate: PersonalizationTemplate = {
  id: 'bookmark-based-recommendations',
  name: 'Bookmark-Based Recommendations',
  description: 'Content recommendations based on user bookmarks and saved items',
  category: 'behavioral',
  difficulty: 'intermediate',
  rule: {
    id: '',
    name: 'Bookmark-Based Recommendations',
    description: 'Recommendations based on bookmarks',
    segment: 'engaged_user',
    contentType: 'recommendation_section',
    trigger: {
      type: 'bookmark_count',
      condition: 'greater_than',
      value: 2
    },
    isActive: true,
    priority: 7,
    variants: [],
    conditions: [
      {
        field: 'bookmarkCount',
        operator: 'greater_than',
        value: 2
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  variants: [
    {
      id: 'bookmark-rec-1',
      ruleId: '',
      name: 'More Like Your Bookmarks',
      description: 'Similar articles to bookmarked content',
      content: {
        headline: 'Lebih Banyak Seperti Ini',
        subheadline: 'Berdasarkan apa yang Anda simpan.',
        cta: 'Lihat Semua',
        sourceType: 'bookmarks',
        recommendationStrategy: 'content_similarity'
      },
      weight: 70,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'bookmark-rec-2',
      ruleId: '',
      name: 'Trending in Your Interests',
      description: 'Trending content in bookmarked categories',
      content: {
        headline: 'Sedang Populer',
        subheadline: 'Konten populer dalam minat Anda.',
        cta: 'Jelajahi',
        sourceType: 'trending',
        recommendationStrategy: 'category_trending'
      },
      weight: 30,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  metadata: {
    tags: ['personalization', 'recommendations', 'retention'],
    targetSegments: ['engaged_user', 'frequent_reader'],
    contentType: ['recommendation_section', 'sidebar'],
    estimatedImpact: 'medium',
    estimatedLift: 14,
    useCases: [
      'Improve content discovery',
      'Increase bookmark engagement',
      'Personalize recommendations'
    ],
    prerequisites: [
      'Bookmark tracking',
      'Content similarity algorithm'
    ]
  }
};

// ============================================================================
// TEMPLATE COLLECTION
// ============================================================================

/**
 * All available personalization templates
 */
export const personalizationTemplates: PersonalizationTemplate[] = [
  newVisitorWelcomeTemplate,
  returningReaderHighlightsTemplate,
  contentCreatorSpotlightTemplate,
  engagementBasedCTATemplate,
  timeBasedPromotionTemplate,
  bookmarkBasedRecommendationsTemplate
];

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): PersonalizationTemplate | undefined {
  return personalizationTemplates.find(t => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): PersonalizationTemplate[] {
  return personalizationTemplates.filter(t => t.category === category);
}

/**
 * Get templates by difficulty level
 */
export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): PersonalizationTemplate[] {
  return personalizationTemplates.filter(t => t.difficulty === difficulty);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(keyword: string): PersonalizationTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return personalizationTemplates.filter(t =>
    t.name.toLowerCase().includes(lowerKeyword) ||
    t.description.toLowerCase().includes(lowerKeyword) ||
    t.metadata.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get recommended templates for a specific user segment
 */
export function getRecommendedTemplates(segment: string): PersonalizationTemplate[] {
  return personalizationTemplates.filter(t =>
    t.metadata.targetSegments.includes(segment) ||
    t.metadata.targetSegments.includes('all_segments')
  );
}
