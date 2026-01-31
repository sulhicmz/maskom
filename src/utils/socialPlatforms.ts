export type SocialPlatform = "facebook" | "twitter" | "linkedin" | "instagram"

export interface SocialPlatformConfig {
   icon: string
   ariaLabel: string
   title: string
   getShareUrl: (url: string, text: string) => string | null
}

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformConfig> = {
    facebook: {
       icon: "fab fa-facebook-f",
       ariaLabel: "Share on Facebook",
       title: "Share on Facebook",
        
       getShareUrl: (url: string, _: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
   twitter: {
      icon: "fab fa-twitter",
      ariaLabel: "Share on Twitter",
      title: "Share on Twitter",
      getShareUrl: (url: string, text: string) =>
         `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
   },
    linkedin: {
       icon: "fab fa-linkedin-in",
       ariaLabel: "Share on LinkedIn",
       title: "Share on LinkedIn",
        
       getShareUrl: (url: string, _: string) =>
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    instagram: {
       icon: "fab fa-instagram",
       ariaLabel: "Copy link for Instagram",
       title: "Copy link for Instagram",
        
       getShareUrl: (_: string, __: string) => null,
    },
}

export function getPlatformConfig(platform: SocialPlatform): SocialPlatformConfig {
   return SOCIAL_PLATFORMS[platform]
}

export function getPlatformIcon(platform: SocialPlatform): string {
   return SOCIAL_PLATFORMS[platform].icon
}

export function getPlatformAriaLabel(platform: SocialPlatform): string {
   return SOCIAL_PLATFORMS[platform].ariaLabel
}

export function getPlatformTitle(platform: SocialPlatform): string {
   return SOCIAL_PLATFORMS[platform].title
}

export function getShareUrl(platform: SocialPlatform, url: string, text: string): string | null {
   return SOCIAL_PLATFORMS[platform].getShareUrl(url, text)
}
