import { render } from "@testing-library/react"
import JsonLd from "@/components/common/JsonLd"

describe("JsonLd Component", () => {
  it("renders JSON-LD script tag", () => {
    const testData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Test Organization"
    }
    
    const { container } = render(<JsonLd data={testData} />)
    const scriptTag = container.querySelector('script[type="application/ld+json"]')
    
    expect(scriptTag).toBeInTheDocument()
  })

  it("includes correct JSON data in script", () => {
    const testData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Test Article"
    }
    
    const { container } = render(<JsonLd data={testData} />)
    const scriptTag = container.querySelector('script[type="application/ld+json"]')
    const scriptContent = scriptTag?.textContent
    
    expect(scriptContent).toBe(JSON.stringify(testData))
  })

  it("handles complex nested objects", () => {
    const complexData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Complex Article",
      author: {
        "@type": "Person",
        name: "John Doe"
      },
      publisher: {
        "@type": "Organization",
        name: "Test Org",
        logo: {
          "@type": "ImageObject",
          url: "https://example.com/logo.png"
        }
      }
    }
    
    const { container } = render(<JsonLd data={complexData} />)
    const scriptTag = container.querySelector('script[type="application/ld+json"]')
    const scriptContent = scriptTag?.textContent
    
    expect(scriptContent).toBe(JSON.stringify(complexData))
  })

  it("handles arrays in JSON data", () => {
    const dataWithArrays = {
      "@context": "https://schema.org",
      "@type": "Article",
      image: ["/image1.jpg", "/image2.jpg"],
      keywords: ["keyword1", "keyword2", "keyword3"]
    }
    
    const { container } = render(<JsonLd data={dataWithArrays} />)
    const scriptTag = container.querySelector('script[type="application/ld+json"]')
    const scriptContent = scriptTag?.textContent
    
    expect(scriptContent).toBe(JSON.stringify(dataWithArrays))
  })
})
