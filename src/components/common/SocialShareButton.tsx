"use client"

import { memo } from "react"
import { SOCIAL_PLATFORMS } from "@/utils/socialPlatforms"
import type { SocialPlatform } from "@/utils/socialPlatforms"

interface SocialShareButtonProps {
   platform: SocialPlatform
   onClick: () => void
   isSharing: boolean
   disabled: boolean
}

const SocialShareButton = memo(({
   platform,
   onClick,
   isSharing,
   disabled
}: SocialShareButtonProps) => {
   const config = SOCIAL_PLATFORMS[platform]

   return (
      <button
         type="button"
         onClick={onClick}
         aria-label={isSharing ? "Sharing..." : config.ariaLabel}
         aria-busy={isSharing}
         title={isSharing ? "Sharing..." : config.title}
         disabled={disabled}
      >
         {isSharing ? (
            <i className="fas fa-spinner fa-spin" aria-hidden="true" />
         ) : (
            <i className={config.icon} aria-hidden="true" />
         )}
      </button>
   )
})

SocialShareButton.displayName = "SocialShareButton"

export default SocialShareButton
