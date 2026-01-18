"use client"

import { memo, useState } from "react"
import type { SocialPlatform } from "@/utils/socialPlatforms"
import { getShareUrl } from "@/utils/socialPlatforms"
import SocialShareButton from "./SocialShareButton"

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

   const platforms: SocialPlatform[] = ["facebook", "twitter", "linkedin", "instagram"]

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

   return (
      <ul className={`social-link ${className}`} role="list" aria-label={ariaLabel}>
         {platforms.map((platform) => (
            <li key={platform}>
               <SocialShareButton
                  platform={platform}
                  onClick={() => handleShare(platform)}
                  isSharing={sharingPlatform === platform}
                  disabled={sharingPlatform !== null}
               />
            </li>
         ))}
      </ul>
   )
})

SocialShareButtons.displayName = "SocialShareButtons"

export default SocialShareButtons
