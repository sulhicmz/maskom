"use client"

import { memo } from "react"

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
   const handleShare = (platform: SocialPlatform) => {
      const url = customUrl || (typeof window !== "undefined" ? window.location.href : "https://maskom.co.id")
      const shareText = text || `Check out ${title}!`
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
         case "instagram":
            shareUrl = "https://www.instagram.com/"
            break
      }

      if (shareUrl) {
         window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400")
      }
   }

   return (
      <ul className={`social-link ${className}`} role="list" aria-label={ariaLabel}>
         <li>
            <button
               type="button"
               onClick={() => handleShare("facebook")}
               aria-label="Share on Facebook"
               title="Share on Facebook"
            >
               <i className="fab fa-facebook-f" aria-hidden="true" />
            </button>
         </li>
         <li>
            <button
               type="button"
               onClick={() => handleShare("twitter")}
               aria-label="Share on Twitter"
               title="Share on Twitter"
            >
               <i className="fab fa-twitter" aria-hidden="true" />
            </button>
         </li>
         <li>
            <button
               type="button"
               onClick={() => handleShare("linkedin")}
               aria-label="Share on LinkedIn"
               title="Share on LinkedIn"
            >
               <i className="fab fa-linkedin-in" aria-hidden="true" />
            </button>
         </li>
         <li>
            <button
               type="button"
               onClick={() => handleShare("instagram")}
               aria-label="Share on Instagram"
               title="Share on Instagram"
            >
               <i className="fab fa-instagram" aria-hidden="true" />
            </button>
         </li>
      </ul>
   )
})

SocialShareButtons.displayName = "SocialShareButtons"

export default SocialShareButtons
