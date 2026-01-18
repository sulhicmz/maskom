"use client"

import { memo, useState } from "react"
import type { SocialPlatform } from "@/utils/socialPlatforms"
import { getPlatformIcon, getPlatformAriaLabel, getPlatformTitle, getShareUrl } from "@/utils/socialPlatforms"

interface SocialShareButtonsProps {
   title?: string
   url?: string
   text?: string
   className?: string
   ariaLabel?: string
}

const SocialShareButtons = memo(({
   title = "",
   url: customUrl,
   text,
   className = "",
   ariaLabel = "Share on social media"
}: SocialShareButtonsProps) => {
   const [sharingPlatform, setSharingPlatform] = useState<SocialPlatform | null>(null)

    const handleShare = async (platform: SocialPlatform) => {
       if (sharingPlatform) return

       setSharingPlatform(platform)
       const url = customUrl || (typeof window !== "undefined" ? window.location.href : "https://maskom.co.id")
       const shareText = text || `Check out ${title}!`

       const shareUrl = getShareUrl(platform, url, shareText)

       if (platform === "instagram" || shareUrl === null) {
          try {
             await navigator.clipboard.writeText(url)
             alert("Link copied! Open Instagram and paste to share.")
          } catch (err) {
             console.error("Failed to copy link:", err)
             alert("Failed to copy link. Please copy manually and paste to Instagram.")
          }
          setSharingPlatform(null)
          return
       }

       if (shareUrl) {
          window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400")
          setSharingPlatform(null)
       }
    }

    const getIcon = (platform: SocialPlatform) => {
       if (sharingPlatform === platform) {
          return <i className="fas fa-spinner fa-spin" aria-hidden="true" />
       }
       return <i className={getPlatformIcon(platform)} aria-hidden="true" />
    }

    const getButtonAriaLabel = (platform: SocialPlatform) => {
       return sharingPlatform === platform ? "Sharing..." : getPlatformAriaLabel(platform)
    }

    const getButtonTitle = (platform: SocialPlatform) => {
       return sharingPlatform === platform ? "Sharing..." : getPlatformTitle(platform)
    }

   return (
      <ul className={`social-link ${className}`} role="list" aria-label={ariaLabel}>
         <li>
            <button
               type="button"
               onClick={() => handleShare("facebook")}
               aria-label={getButtonAriaLabel("facebook")}
               aria-busy={sharingPlatform === "facebook"}
               title={getButtonTitle("facebook")}
               disabled={sharingPlatform !== null}
            >
               {getIcon("facebook")}
            </button>
         </li>
         <li>
            <button
               type="button"
               onClick={() => handleShare("twitter")}
               aria-label={getButtonAriaLabel("twitter")}
               aria-busy={sharingPlatform === "twitter"}
               title={getButtonTitle("twitter")}
               disabled={sharingPlatform !== null}
            >
               {getIcon("twitter")}
            </button>
         </li>
         <li>
            <button
               type="button"
               onClick={() => handleShare("linkedin")}
               aria-label={getButtonAriaLabel("linkedin")}
               aria-busy={sharingPlatform === "linkedin"}
               title={getButtonTitle("linkedin")}
               disabled={sharingPlatform !== null}
            >
               {getIcon("linkedin")}
            </button>
         </li>
         <li>
            <button
               type="button"
               onClick={() => handleShare("instagram")}
               aria-label={getButtonAriaLabel("instagram")}
               aria-busy={sharingPlatform === "instagram"}
               title={getButtonTitle("instagram")}
               disabled={sharingPlatform !== null}
            >
               {getIcon("instagram")}
            </button>
         </li>
      </ul>
   )
})

SocialShareButtons.displayName = "SocialShareButtons"

export default SocialShareButtons
