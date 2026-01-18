import { SOCIAL_PLATFORMS, getPlatformConfig, getPlatformIcon, getPlatformAriaLabel, getPlatformTitle, getShareUrl } from "../socialPlatforms"

describe("socialPlatforms", () => {
   describe("SOCIAL_PLATFORMS", () => {
      it("should have 4 platforms", () => {
         expect(Object.keys(SOCIAL_PLATFORMS)).toHaveLength(4)
      })

      it("should have facebook config", () => {
         expect(SOCIAL_PLATFORMS.facebook).toBeDefined()
         expect(SOCIAL_PLATFORMS.facebook.icon).toBe("fab fa-facebook-f")
         expect(SOCIAL_PLATFORMS.facebook.ariaLabel).toBe("Share on Facebook")
         expect(SOCIAL_PLATFORMS.facebook.title).toBe("Share on Facebook")
      })

      it("should have twitter config", () => {
         expect(SOCIAL_PLATFORMS.twitter).toBeDefined()
         expect(SOCIAL_PLATFORMS.twitter.icon).toBe("fab fa-twitter")
         expect(SOCIAL_PLATFORMS.twitter.ariaLabel).toBe("Share on Twitter")
         expect(SOCIAL_PLATFORMS.twitter.title).toBe("Share on Twitter")
      })

      it("should have linkedin config", () => {
         expect(SOCIAL_PLATFORMS.linkedin).toBeDefined()
         expect(SOCIAL_PLATFORMS.linkedin.icon).toBe("fab fa-linkedin-in")
         expect(SOCIAL_PLATFORMS.linkedin.ariaLabel).toBe("Share on LinkedIn")
         expect(SOCIAL_PLATFORMS.linkedin.title).toBe("Share on LinkedIn")
      })

      it("should have instagram config", () => {
         expect(SOCIAL_PLATFORMS.instagram).toBeDefined()
         expect(SOCIAL_PLATFORMS.instagram.icon).toBe("fab fa-instagram")
         expect(SOCIAL_PLATFORMS.instagram.ariaLabel).toBe("Copy link for Instagram")
         expect(SOCIAL_PLATFORMS.instagram.title).toBe("Copy link for Instagram")
      })
   })

   describe("getPlatformConfig", () => {
      it("should return correct config for facebook", () => {
         const config = getPlatformConfig("facebook")
         expect(config.icon).toBe("fab fa-facebook-f")
         expect(config.ariaLabel).toBe("Share on Facebook")
         expect(config.title).toBe("Share on Facebook")
      })

      it("should return correct config for twitter", () => {
         const config = getPlatformConfig("twitter")
         expect(config.icon).toBe("fab fa-twitter")
         expect(config.ariaLabel).toBe("Share on Twitter")
         expect(config.title).toBe("Share on Twitter")
      })

      it("should return correct config for linkedin", () => {
         const config = getPlatformConfig("linkedin")
         expect(config.icon).toBe("fab fa-linkedin-in")
         expect(config.ariaLabel).toBe("Share on LinkedIn")
         expect(config.title).toBe("Share on LinkedIn")
      })

      it("should return correct config for instagram", () => {
         const config = getPlatformConfig("instagram")
         expect(config.icon).toBe("fab fa-instagram")
         expect(config.ariaLabel).toBe("Copy link for Instagram")
         expect(config.title).toBe("Copy link for Instagram")
      })
   })

   describe("getPlatformIcon", () => {
      it("should return correct icon for facebook", () => {
         expect(getPlatformIcon("facebook")).toBe("fab fa-facebook-f")
      })

      it("should return correct icon for twitter", () => {
         expect(getPlatformIcon("twitter")).toBe("fab fa-twitter")
      })

      it("should return correct icon for linkedin", () => {
         expect(getPlatformIcon("linkedin")).toBe("fab fa-linkedin-in")
      })

      it("should return correct icon for instagram", () => {
         expect(getPlatformIcon("instagram")).toBe("fab fa-instagram")
      })
   })

   describe("getPlatformAriaLabel", () => {
      it("should return correct aria-label for facebook", () => {
         expect(getPlatformAriaLabel("facebook")).toBe("Share on Facebook")
      })

      it("should return correct aria-label for twitter", () => {
         expect(getPlatformAriaLabel("twitter")).toBe("Share on Twitter")
      })

      it("should return correct aria-label for linkedin", () => {
         expect(getPlatformAriaLabel("linkedin")).toBe("Share on LinkedIn")
      })

      it("should return correct aria-label for instagram", () => {
         expect(getPlatformAriaLabel("instagram")).toBe("Copy link for Instagram")
      })
   })

   describe("getPlatformTitle", () => {
      it("should return correct title for facebook", () => {
         expect(getPlatformTitle("facebook")).toBe("Share on Facebook")
      })

      it("should return correct title for twitter", () => {
         expect(getPlatformTitle("twitter")).toBe("Share on Twitter")
      })

      it("should return correct title for linkedin", () => {
         expect(getPlatformTitle("linkedin")).toBe("Share on LinkedIn")
      })

      it("should return correct title for instagram", () => {
         expect(getPlatformTitle("instagram")).toBe("Copy link for Instagram")
      })
   })

   describe("getShareUrl", () => {
      it("should return correct URL for facebook", () => {
         const url = "https://example.com/post"
         const text = "Check out this post!"
         const shareUrl = getShareUrl("facebook", url, text)

         expect(shareUrl).toContain("https://www.facebook.com/sharer/sharer.php")
         expect(shareUrl).toContain(encodeURIComponent(url))
      })

      it("should return correct URL for twitter", () => {
         const url = "https://example.com/post"
         const text = "Check out this post!"
         const shareUrl = getShareUrl("twitter", url, text)

         expect(shareUrl).toContain("https://twitter.com/intent/tweet")
         expect(shareUrl).toContain(encodeURIComponent(text))
         expect(shareUrl).toContain(encodeURIComponent(url))
      })

      it("should return correct URL for linkedin", () => {
         const url = "https://example.com/post"
         const text = "Check out this post!"
         const shareUrl = getShareUrl("linkedin", url, text)

         expect(shareUrl).toContain("https://www.linkedin.com/sharing/share-offsite/")
         expect(shareUrl).toContain(encodeURIComponent(url))
      })

      it("should return null for instagram", () => {
         const url = "https://example.com/post"
         const text = "Check out this post!"
         const shareUrl = getShareUrl("instagram", url, text)

         expect(shareUrl).toBeNull()
      })

      it("should encode URL properly", () => {
         const url = "https://example.com/post?param=value&other=test"
         const shareUrl = getShareUrl("facebook", url, "text")

         expect(shareUrl).toContain(encodeURIComponent(url))
      })

      it("should encode text properly", () => {
         const url = "https://example.com/post"
         const text = "Text with special chars: & and < > and #"
         const shareUrl = getShareUrl("twitter", url, text)

         expect(shareUrl).toContain(encodeURIComponent(text))
      })
   })
})
