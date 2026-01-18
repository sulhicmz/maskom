"use client"

import { memo, useState } from "react"

type SocialPlatform = "facebook" | "twitter" | "linkedin" | "instagram"

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

      if (platform === "instagram") {
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

      const encodedUrl = encodeURIComponent(url)
      const encodedText = encodeURIComponent(shareText)

      let shareUrl = ""
      switch (platform) {
         case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
            break
         case "twitter":
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
            break
         case "linkedin":
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
            break
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
      switch (platform) {
         case "facebook":
            return <i className="fab fa-facebook-f" aria-hidden="true" />
         case "twitter":
            return <i className="fab fa-twitter" aria-hidden="true" />
         case "linkedin":
            return <i className="fab fa-linkedin-in" aria-hidden="true" />
         case "instagram":
            return <i className="fab fa-instagram" aria-hidden="true" />
      }
   }

   const getButtonAriaLabel = (platform: SocialPlatform) => {
      if (sharingPlatform === platform) {
         return "Sharing..."
      }
      switch (platform) {
         case "facebook":
            return "Share on Facebook"
         case "twitter":
            return "Share on Twitter"
         case "linkedin":
            return "Share on LinkedIn"
         case "instagram":
            return "Copy link for Instagram"
      }
   }

   const getButtonTitle = (platform: SocialPlatform) => {
      if (sharingPlatform === platform) {
         return "Sharing..."
      }
      switch (platform) {
         case "facebook":
            return "Share on Facebook"
         case "twitter":
            return "Share on Twitter"
         case "linkedin":
            return "Share on LinkedIn"
         case "instagram":
            return "Copy link for Instagram"
      }
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
