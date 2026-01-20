import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import SocialShareButtons from "../SocialShareButtons"

describe("SocialShareButtons", () => {
    beforeEach(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        window.open = jest.fn()
        Object.defineProperty(window, 'location', {
           value: { href: 'https://test.maskom.co.id' },
           writable: true,
           configurable: true,
        })
        Object.defineProperty(navigator, "clipboard", {
           value: {
              writeText: jest.fn().mockResolvedValue(undefined),
           },
           writable: true,
           configurable: true,
        })
    })

    afterEach(() => {
       jest.clearAllMocks()
       jest.resetAllMocks()
    })

    afterEach(() => {
       jest.clearAllMocks()
       jest.resetAllMocks()
    })

    describe("Rendering", () => {
       it("should render social share buttons", () => {
          render(<SocialShareButtons />)

          expect(screen.getByLabelText("Share on Facebook")).toBeInTheDocument()
          expect(screen.getByLabelText("Share on Twitter")).toBeInTheDocument()
          expect(screen.getByLabelText("Share on LinkedIn")).toBeInTheDocument()
          expect(screen.getByLabelText("Copy link for Instagram")).toBeInTheDocument()
       })

      it("should render with custom className", () => {
         render(<SocialShareButtons className="custom-class" />)

         const list = screen.getByRole("list")
         expect(list).toHaveClass("social-link", "custom-class")
      })

      it("should render with custom aria-label", () => {
         render(<SocialShareButtons ariaLabel="Custom share label" />)

         const list = screen.getByRole("list")
         expect(list).toHaveAttribute("aria-label", "Custom share label")
      })

      it("should have role list on ul element", () => {
         render(<SocialShareButtons />)

         const list = screen.getByRole("list")
         expect(list).toBeInTheDocument()
      })

      it("should have icons with aria-hidden", () => {
         render(<SocialShareButtons />)

         const buttons = screen.getAllByLabelText(/Share on/)

         buttons.forEach((button) => {
            const icon = button.querySelector("i")
            expect(icon).toHaveAttribute("aria-hidden", "true")
         })
      })

       it("should have title attributes on buttons", () => {
          render(<SocialShareButtons />)

          expect(screen.getByTitle("Share on Facebook")).toBeInTheDocument()
          expect(screen.getByTitle("Share on Twitter")).toBeInTheDocument()
          expect(screen.getByTitle("Share on LinkedIn")).toBeInTheDocument()
          expect(screen.getByTitle("Copy link for Instagram")).toBeInTheDocument()
       })
   })

   describe("Social Platform Buttons", () => {
      it("should render Facebook button with correct aria-label", () => {
         render(<SocialShareButtons />)

         const button = screen.getByLabelText("Share on Facebook")
         expect(button).toBeInTheDocument()
         expect(button).toHaveAttribute("type", "button")
      })

      it("should render Twitter button with correct aria-label", () => {
         render(<SocialShareButtons />)

         const button = screen.getByLabelText("Share on Twitter")
         expect(button).toBeInTheDocument()
         expect(button).toHaveAttribute("type", "button")
      })

      it("should render LinkedIn button with correct aria-label", () => {
         render(<SocialShareButtons />)

         const button = screen.getByLabelText("Share on LinkedIn")
         expect(button).toBeInTheDocument()
         expect(button).toHaveAttribute("type", "button")
      })

       it("should render Instagram button with correct aria-label", () => {
          render(<SocialShareButtons />)

          const button = screen.getByLabelText("Copy link for Instagram")
          expect(button).toBeInTheDocument()
          expect(button).toHaveAttribute("type", "button")
       })
   })

   describe("Facebook Sharing", () => {
      it("should open Facebook share dialog when clicked", () => {
         render(<SocialShareButtons title="Test Title" />)

         const button = screen.getByLabelText("Share on Facebook")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining("facebook.com/sharer/sharer.php"),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
         )
      })

      it("should include URL in Facebook share", () => {
         render(<SocialShareButtons url="https://example.com/post" />)

         const button = screen.getByLabelText("Share on Facebook")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining(encodeURIComponent("https://example.com/post")),
            "_blank",
            expect.any(String)
         )
      })
   })

   describe("Twitter Sharing", () => {
      it("should open Twitter share dialog when clicked", () => {
         render(<SocialShareButtons title="Test Title" />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining("twitter.com/intent/tweet"),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
         )
      })

      it("should include text and URL in Twitter share", () => {
         render(<SocialShareButtons title="My Post" url="https://example.com/post" />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         const shareUrl = (window.open as jest.Mock).mock.calls[0][0]
         expect(shareUrl).toContain(encodeURIComponent("Check out My Post!"))
         expect(shareUrl).toContain(encodeURIComponent("https://example.com/post"))
      })
   })

   describe("LinkedIn Sharing", () => {
      it("should open LinkedIn share dialog when clicked", () => {
         render(<SocialShareButtons title="Test Title" />)

         const button = screen.getByLabelText("Share on LinkedIn")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining("linkedin.com/sharing/share-offsite"),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
         )
      })

      it("should include URL in LinkedIn share", () => {
         render(<SocialShareButtons url="https://example.com/post" />)

         const button = screen.getByLabelText("Share on LinkedIn")
         fireEvent.click(button)

         const shareUrl = (window.open as jest.Mock).mock.calls[0][0]
         expect(shareUrl).toContain(encodeURIComponent("https://example.com/post"))
      })
   })

     describe("Instagram Sharing", () => {
        it("should copy link to clipboard when clicked", async () => {
           const mockLocation = { href: "https://maskom.co.id/test" };
           delete (window as any).location;
           Object.defineProperty(window, 'location', {
              value: mockLocation,
              writable: true,
              configurable: true,
           });

           render(<SocialShareButtons />)

           const button = screen.getByLabelText("Copy link for Instagram")
           fireEvent.click(button)

           expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://maskom.co.id/test")
           expect(window.open).not.toHaveBeenCalled()
        })
    })

   describe("Custom Props", () => {
      it("should use custom title in share text", () => {
         render(<SocialShareButtons title="Custom Title" />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         const shareUrl = (window.open as jest.Mock).mock.calls[0][0]
         expect(shareUrl).toContain(encodeURIComponent("Check out Custom Title!"))
      })

      it("should use custom text in share", () => {
         render(<SocialShareButtons text="Custom share text" />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         const shareUrl = (window.open as jest.Mock).mock.calls[0][0]
         expect(shareUrl).toContain(encodeURIComponent("Custom share text"))
      })

      it("should use custom URL when provided", () => {
         render(<SocialShareButtons url="https://custom.com/page" />)

         const button = screen.getByLabelText("Share on Facebook")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining(encodeURIComponent("https://custom.com/page")),
            "_blank",
            expect.any(String)
         )
      })

    it("should use window.location.href when custom URL not provided", () => {
        render(<SocialShareButtons title="Test Title" />)

        const twitterButton = screen.getByRole("button", { name: /twitter/i })
        expect(twitterButton).toBeInTheDocument()

        fireEvent.click(twitterButton)

        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining("https://twitter.com/intent/tweet"),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
        )
    })
   })

   describe("Accessibility", () => {
       it("should be keyboard navigable", () => {
          render(<SocialShareButtons />)

          const buttons = [
             screen.getByLabelText("Share on Facebook"),
             screen.getByLabelText("Share on Twitter"),
             screen.getByLabelText("Share on LinkedIn"),
             screen.getByLabelText("Copy link for Instagram"),
          ]

          buttons.forEach((button) => {
             button.focus()
             expect(button).toHaveFocus()
          })
       })
   })

   describe("Edge Cases", () => {
      it("should handle empty title gracefully", () => {
         render(<SocialShareButtons title="" />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         const shareUrl = (window.open as jest.Mock).mock.calls[0][0]
         expect(shareUrl).toContain(encodeURIComponent("Check out !"))
      })

      it("should handle special characters in title", () => {
         render(<SocialShareButtons title="Title with & and < >" />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalled()
      })

      it("should handle long titles", () => {
         const longTitle = "A".repeat(200)
         render(<SocialShareButtons title={longTitle} />)

         const button = screen.getByLabelText("Share on Twitter")
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalled()
      })

      it("should handle multiple rapid clicks", () => {
         render(<SocialShareButtons />)

         const button = screen.getByLabelText("Share on Facebook")
         fireEvent.click(button)
         fireEvent.click(button)
         fireEvent.click(button)

         expect(window.open).toHaveBeenCalledTimes(3)
      })
   })
})
