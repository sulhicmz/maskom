import React from "react"
import { render, screen } from "@testing-library/react"
import SocialShareButton from "../SocialShareButton"
import type { SocialPlatform } from "@/utils/socialPlatforms"

describe("SocialShareButton", () => {
   describe("Rendering", () => {
      it("should render button for Facebook platform", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         expect(screen.getByLabelText("Share on Facebook")).toBeInTheDocument()
      })

      it("should render button for Twitter platform", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="twitter"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         expect(screen.getByLabelText("Share on Twitter")).toBeInTheDocument()
      })

      it("should render button for LinkedIn platform", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="linkedin"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         expect(screen.getByLabelText("Share on LinkedIn")).toBeInTheDocument()
      })

      it("should render button for Instagram platform", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="instagram"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         expect(screen.getByLabelText("Copy link for Instagram")).toBeInTheDocument()
      })
   })

   describe("Button Attributes", () => {
      it("should have type attribute set to button", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("type", "button")
      })

      it("should display correct aria-label", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="twitter"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("aria-label", "Share on Twitter")
      })

      it("should display correct title", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="linkedin"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("title", "Share on LinkedIn")
      })

      it("should have aria-hidden on icon", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const icon = screen.getByRole("button").querySelector("i")
         expect(icon).toHaveAttribute("aria-hidden", "true")
      })

      it("should not be disabled when disabled prop is false", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).not.toBeDisabled()
      })

      it("should be disabled when disabled prop is true", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={true}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toBeDisabled()
      })
   })

   describe("Icons", () => {
      it("should render correct icon for Facebook", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const icon = screen.getByRole("button").querySelector("i")
         expect(icon).toHaveClass("fab", "fa-facebook-f")
      })

      it("should render correct icon for Twitter", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="twitter"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const icon = screen.getByRole("button").querySelector("i")
         expect(icon).toHaveClass("fab", "fa-twitter")
      })

      it("should render correct icon for LinkedIn", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="linkedin"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const icon = screen.getByRole("button").querySelector("i")
         expect(icon).toHaveClass("fab", "fa-linkedin-in")
      })

      it("should render correct icon for Instagram", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="instagram"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const icon = screen.getByRole("button").querySelector("i")
         expect(icon).toHaveClass("fab", "fa-instagram")
      })
   })

   describe("Sharing State", () => {
      it("should display spinner when isSharing is true", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={true}
               disabled={false}
            />
         )

         const icon = screen.getByRole("button").querySelector("i")
         expect(icon).toHaveClass("fas", "fa-spinner", "fa-spin")
      })

      it("should change aria-label to Sharing... when isSharing is true", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="twitter"
               onClick={handleClick}
               isSharing={true}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("aria-label", "Sharing...")
      })

      it("should change title to Sharing... when isSharing is true", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="linkedin"
               onClick={handleClick}
               isSharing={true}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("title", "Sharing...")
      })

      it("should set aria-busy to true when isSharing is true", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="instagram"
               onClick={handleClick}
               isSharing={true}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("aria-busy", "true")
      })

      it("should not set aria-busy when isSharing is false", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         expect(button).toHaveAttribute("aria-busy", "false")
      })
   })

   describe("Click Handling", () => {
      it("should call onClick handler when clicked", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         button.click()

         expect(handleClick).toHaveBeenCalledTimes(1)
      })

      it("should not call onClick when button is disabled", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="twitter"
               onClick={handleClick}
               isSharing={false}
               disabled={true}
            />
         )

         const button = screen.getByRole("button")
         button.click()

         expect(handleClick).not.toHaveBeenCalled()
      })
   })

   describe("Accessibility", () => {
      it("should be keyboard navigable", () => {
         const handleClick = jest.fn()
         render(
            <SocialShareButton
               platform="facebook"
               onClick={handleClick}
               isSharing={false}
               disabled={false}
            />
         )

         const button = screen.getByRole("button")
         button.focus()
         expect(button).toHaveFocus()
      })

      it("should have appropriate aria-labels for all platforms", () => {
         const platforms: SocialPlatform[] = ["facebook", "twitter", "linkedin", "instagram"]
         const handleClick = jest.fn()

         platforms.forEach((platform) => {
            render(
               <SocialShareButton
                  platform={platform}
                  onClick={handleClick}
                  isSharing={false}
                  disabled={false}
               />
            )

            const button = screen.getByRole("button")
            expect(button).toHaveAttribute("aria-label")
            expect(button.getAttribute("aria-label")).not.toBe("")

            document.body.innerHTML = ""
         })
      })
   })

   describe("Memoization", () => {
      it("should have displayName set", () => {
         expect(SocialShareButton.displayName).toBe("SocialShareButton")
      })
   })
})
