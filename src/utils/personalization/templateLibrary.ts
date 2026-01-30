/**
 * Personalization Rule Templates
 *
 * Pre-built personalization rule templates for common use cases to accelerate
 * personalization implementation and provide best practices.
 */

import type {
  PersonalizationRule,
  ContentVariant,
  UserSegment,
  PersonalizationTrigger,
  ContentType,
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

// ============================================================================
// TEMPLATES
// ============================================================================

/**
 * Template: New Visitor Welcome Message
 *
 * Shows a personalized welcome message to first-time visitors with
 * a call-to-action to explore most popular content.
 */
export const newVisitorWelcomeTemplate = {
  id: 'new-visitor-welcome',
  name: 'New Visitor Welcome Message',
  description: 'Personalized welcome message for first-time visitors with popular content recommendations',
  category: 'segment-based' as const,
  difficulty: 'beginner' as const,
  rule: {
    id: '',
    name: 'New Visitor Welcome',
    description: 'Welcome message for first-time visitors',
    segment: 'new_visitor' as UserSegment,
    contentType: 'page' as ContentType,
    trigger: 'on_page_load' as PersonalizationTrigger,
    variants: [] as ContentVariant[],
    isActive: true,
    priority: 10,
    conditions: [] as RuleCondition[],
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as PersonalizationRule,
  variants: [
    {
      id: 'welcome-variant-1',
      contentId: 'hero-1',
      variantName: 'Welcome with Popular Content',
      segment: 'new_visitor' as UserSegment,
      contentType: 'page' as ContentType,
      content: {
        headline: 'Selamat Datang di Maskom!',
        subheadline: 'Temukan konten inspiratif dan bermanfaat untuk perjalanan digital Anda.',
        cta: 'Jelajahi Konten Populer',
        featuredContent: 'popular'
      },
      weight: 60,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'welcome-variant-2',
      contentId: 'hero-2',
      variantName: 'Welcome with Getting Started Guide',
      segment: 'new_visitor' as UserSegment,
      contentType: 'page' as ContentType,
      content: {
        headline: 'Halo! Baru di sini?',
        subheadline: 'Panduan memulai untuk mengenal layanan kami.',
        cta: 'Mulai Sekarang',
        featuredContent: 'getting-started'
      },
      weight: 40,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as ContentVariant[],
  metadata: {
    tags: ['onboarding', 'engagement', 'new-users'],
    targetSegments: ['new_visitor'],
    contentType: ['page'],
    estimatedImpact: 'high' as const,
    estimatedLift: 15,
    useCases: [
      'Welcome first-time visitors',
      'Increase engagement for new users',
      'Guide users to popular content'
    ],
    prerequisites: []
  } as TemplateMetadata
};

/**
 * Template: Returning Reader Highlights
 *
 * Shows personalized content highlights based on user's reading history
 * and preferences for returning visitors.
 */
export const returningReaderHighlightsTemplate = {
  id: 'returning-reader-highlights',
  name: 'Returning Reader Highlights',
  description: 'Personalized content recommendations based on reading history for returning visitors',
  category: 'behavioral' as const,
  difficulty: 'intermediate' as const,
  rule: {
    id: '',
    name: 'Returning Reader Highlights',
    description: 'Content recommendations based on reading history',
    segment: 'returning_visitor' as UserSegment,
    contentType: 'page' as ContentType,
    trigger: 'on_page_load' as PersonalizationTrigger,
    variants: [] as ContentVariant[],
    isActive: true,
    priority: 8,
    conditions: [
      {
        field: 'category' as const,
        operator: 'greater_than' as const,
        value: 1
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as PersonalizationRule,
  variants: [
    {
      id: 'highlights-variant-1',
      contentId: 'highlights-1',
      variantName: 'Continue Reading',
      segment: 'returning_visitor' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Lanjutkan Membaca',
        subheadline: 'Anda punya artikel yang belum selesai dibaca.',
        cta: 'Lanjutkan',
        sourceType: 'reading_history',
        contentSource: 'in_progress'
      },
      weight: 50,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'highlights-variant-2',
      contentId: 'highlights-2',
      variantName: 'Similar Articles',
      segment: 'returning_visitor' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Anda mungkin menyukai ini',
        subheadline: 'Berdasarkan minat bacaan Anda.',
        cta: 'Baca Sekarang',
        sourceType: 'recommendation',
        contentSource: 'similar_to_history'
      },
      weight: 50,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as ContentVariant[],
  metadata: {
    tags: ['retention', 'personalization', 'content-discovery'],
    targetSegments: ['returning_visitor', 'frequent_reader'],
    contentType: ['blog_post', 'page'],
    estimatedImpact: 'medium' as const,
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
  } as TemplateMetadata
};

/**
 * Template: Content Creator Spotlight
 *
 * Highlights featured content creators and their contributions for
 * users who have shown interest in content creation.
 */
export const contentCreatorSpotlightTemplate = {
  id: 'content-creator-spotlight',
  name: 'Content Creator Spotlight',
  description: 'Showcase featured content creators and their best work',
  category: 'segment-based' as const,
  difficulty: 'beginner' as const,
  rule: {
    id: '',
    name: 'Content Creator Spotlight',
    description: 'Featured content creator showcase',
    segment: 'content_creator' as UserSegment,
    contentType: 'page' as ContentType,
    trigger: 'on_page_load' as PersonalizationTrigger,
    variants: [] as ContentVariant[],
    isActive: true,
    priority: 6,
    conditions: [] as RuleCondition[],
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as PersonalizationRule,
  variants: [
    {
      id: 'spotlight-variant-1',
      contentId: 'spotlight-1',
      variantName: 'Creator of Month',
      segment: 'content_creator' as UserSegment,
      contentType: 'page' as ContentType,
      content: {
        headline: 'Kreator Konten Bulan Ini',
        subheadline: 'Mengenal lebih dekat kreator konten berbakat kami.',
        cta: 'Lihat Profil',
        spotlightType: 'monthly_winner'
      },
      weight: 70,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'spotlight-variant-2',
      contentId: 'spotlight-2',
      variantName: 'Rising Creators',
      segment: 'content_creator' as UserSegment,
      contentType: 'page' as ContentType,
      content: {
        headline: 'Kreator Konten Pendatang Baru',
        subheadline: 'Talent baru yang patut Anda simak.',
        cta: 'Jelajahi',
        spotlightType: 'rising_stars'
      },
      weight: 30,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as ContentVariant[],
  metadata: {
    tags: ['community', 'engagement', 'user-generated-content'],
    targetSegments: ['engaged_user', 'content_creator'],
    contentType: ['page'],
    estimatedImpact: 'medium' as const,
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
  } as TemplateMetadata
};

/**
 * Template: Engagement-Based CTA
 *
 * Adjusts call-to-action based on user engagement level to improve
 * conversion rates for highly engaged users.
 */
export const engagementBasedCTATemplate = {
  id: 'engagement-based-cta',
  name: 'Engagement-Based CTA',
  description: 'Dynamic call-to-action based on user engagement level',
  category: 'engagement-based' as const,
  difficulty: 'intermediate' as const,
  rule: {
    id: '',
    name: 'Engagement-Based CTA',
    description: 'CTA adaptation based on engagement',
    segment: 'engaged_user' as UserSegment,
    contentType: 'custom' as ContentType,
    trigger: 'on_page_load' as PersonalizationTrigger,
    variants: [] as ContentVariant[],
    isActive: true,
    priority: 9,
    conditions: [
      {
        field: 'engagementScore' as const,
        operator: 'greater_than' as const,
        value: 80
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as PersonalizationRule,
  variants: [
    {
      id: 'cta-variant-1',
      contentId: 'cta-1',
      variantName: 'Premium Upgrade CTA',
      segment: 'engaged_user' as UserSegment,
      contentType: 'custom' as ContentType,
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
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'cta-variant-2',
      contentId: 'cta-2',
      variantName: 'Newsletter Subscription',
      segment: 'engaged_user' as UserSegment,
      contentType: 'custom' as ContentType,
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
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as ContentVariant[],
  metadata: {
    tags: ['conversion', 'engagement', 'monetization'],
    targetSegments: ['engaged_user', 'frequent_reader'],
    contentType: ['custom'],
    estimatedImpact: 'high' as const,
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
  } as TemplateMetadata
};

/**
 * Template: Time-Based Content Promotion
 *
 * Promotes different content based on time of day to match user
 * behavior patterns (morning, afternoon, evening).
 */
export const timeBasedPromotionTemplate = {
  id: 'time-based-promotion',
  name: 'Time-Based Content Promotion',
  description: 'Promote content based on time of day and user behavior',
  category: 'time-based' as const,
  difficulty: 'intermediate' as const,
  rule: {
    id: '',
    name: 'Time-Based Content Promotion',
    description: 'Dynamic content promotion by time of day',
    segment: 'new_visitor' as UserSegment,
    contentType: 'page' as ContentType,
    trigger: 'on_page_load' as PersonalizationTrigger,
    variants: [] as ContentVariant[],
    isActive: true,
    priority: 5,
    conditions: [] as RuleCondition[],
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as PersonalizationRule,
  variants: [
    {
      id: 'promo-morning',
      contentId: 'promo-1',
      variantName: 'Morning Content',
      segment: 'new_visitor' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Mulai Hari dengan Inspirasi',
        subheadline: 'Konten produktifitas untuk memulai hari Anda.',
        cta: 'Baca Artikel',
        timeSlot: 'morning',
        contentTheme: 'productivity'
      },
      weight: 100,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'promo-afternoon',
      contentId: 'promo-2',
      variantName: 'Afternoon Content',
      segment: 'new_visitor' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Waktu Belajar',
        subheadline: 'Tingkatkan pengetahuan Anda dengan artikel pembelajaran.',
        cta: 'Mulai Belajar',
        timeSlot: 'afternoon',
        contentTheme: 'learning'
      },
      weight: 100,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'promo-evening',
      contentId: 'promo-3',
      variantName: 'Evening Content',
      segment: 'new_visitor' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Waktu Istirahat',
        subheadline: 'Konten santai untuk menutup hari.',
        cta: 'Baca Sekarang',
        timeSlot: 'evening',
        contentTheme: 'relaxation'
      },
      weight: 100,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as ContentVariant[],
  metadata: {
    tags: ['personalization', 'behavioral', 'timing'],
    targetSegments: ['new_visitor', 'returning_visitor'],
    contentType: ['blog_post', 'page'],
    estimatedImpact: 'low' as const,
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
  } as TemplateMetadata
};

/**
 * Template: Bookmark-Based Recommendations
 *
 * Provides content recommendations based on user's bookmarked articles
 * and reading preferences.
 */
export const bookmarkBasedRecommendationsTemplate = {
  id: 'bookmark-based-recommendations',
  name: 'Bookmark-Based Recommendations',
  description: 'Content recommendations based on user bookmarks and saved items',
  category: 'behavioral' as const,
  difficulty: 'intermediate' as const,
  rule: {
    id: '',
    name: 'Bookmark-Based Recommendations',
    description: 'Recommendations based on bookmarks',
    segment: 'engaged_user' as UserSegment,
    contentType: 'blog_post' as ContentType,
    trigger: 'on_page_load' as PersonalizationTrigger,
    variants: [] as ContentVariant[],
    isActive: true,
    priority: 7,
    conditions: [
      {
        field: 'engagementScore' as const,
        operator: 'greater_than' as const,
        value: 2
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as PersonalizationRule,
  variants: [
    {
      id: 'bookmark-rec-1',
      contentId: 'bookmark-1',
      variantName: 'More Like Your Bookmarks',
      segment: 'engaged_user' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Lebih Banyak Seperti Ini',
        subheadline: 'Berdasarkan apa yang Anda simpan.',
        cta: 'Lihat Semua',
        sourceType: 'bookmarks',
        recommendationStrategy: 'content_similarity'
      },
      weight: 70,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'bookmark-rec-2',
      contentId: 'bookmark-2',
      variantName: 'Trending in Your Interests',
      segment: 'engaged_user' as UserSegment,
      contentType: 'blog_post' as ContentType,
      content: {
        headline: 'Sedang Populer',
        subheadline: 'Konten populer dalam minat Anda.',
        cta: 'Jelajahi',
        sourceType: 'trending',
        recommendationStrategy: 'category_trending'
      },
      weight: 30,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as ContentVariant[],
  metadata: {
    tags: ['personalization', 'recommendations', 'retention'],
    targetSegments: ['engaged_user', 'frequent_reader'],
    contentType: ['blog_post', 'page'],
    estimatedImpact: 'medium' as const,
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
  } as TemplateMetadata
};

// ============================================================================
// TEMPLATE COLLECTION
// ============================================================================

/**
 * All available personalization templates
 */
export const personalizationTemplates = [
  newVisitorWelcomeTemplate,
  returningReaderHighlightsTemplate,
  contentCreatorSpotlightTemplate,
  engagementBasedCTATemplate,
  timeBasedPromotionTemplate,
  bookmarkBasedRecommendationsTemplate
];

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
  lift?: number;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory) {
  return personalizationTemplates.filter(t => t.category === category);
}

/**
 * Get templates by difficulty level
 */
export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced') {
  return personalizationTemplates.filter(t => t.difficulty === difficulty);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(keyword: string) {
  const lowerKeyword = keyword.toLowerCase();
  return personalizationTemplates.filter(t =>
    t.name.toLowerCase().includes(lowerKeyword) ||
    t.description.toLowerCase().includes(lowerKeyword) ||
    t.metadata.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string) {
  return personalizationTemplates.find(t => t.id === templateId);
}


/**
 * Get recommended templates for a specific user segment
 */
export function getRecommendedTemplates(segment: string) {
  return personalizationTemplates.filter(t =>
    t.metadata.targetSegments.includes(segment) ||
    t.metadata.targetSegments.includes('all_segments')
  );
}
