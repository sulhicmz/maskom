"use client"

interface JsonLdProps {
  data: object
}

function validateJsonLd(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  try {
    const json = JSON.stringify(data)
    JSON.parse(json)
    return true
  } catch {
    return false
  }
}

export default function JsonLd({ data }: JsonLdProps) {
  if (!validateJsonLd(data)) {
    return null
  }

  const jsonString = JSON.stringify(data)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonString
      }}
    />
  )
}
