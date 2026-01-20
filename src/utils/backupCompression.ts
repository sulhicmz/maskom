export async function compressData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(data)

    const compressedStream = new CompressionStream('gzip')
    const writer = compressedStream.writable.getWriter()

    await writer.write(uint8Array)
    await writer.close()

    const reader = compressedStream.readable.getReader()
    const chunks: Uint8Array[] = []

    let result = await reader.read()
    while (!result.done) {
      if (result.value) {
        chunks.push(result.value)
      }
      result = await reader.read()
    }

    const combined = new Uint8Array(
      chunks.reduce((total, chunk) => total + chunk.length, 0),
    )
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }

    const base64 = btoa(String.fromCharCode(...combined))
    return `COMPRESSED::${base64}`
  } catch (error) {
    console.error('Compression failed:', error)
    throw new Error('Failed to compress backup data')
  }
}

export async function decompressData(compressedData: string): Promise<string> {
  try {
    if (!compressedData.startsWith('COMPRESSED::')) {
      return compressedData
    }

    const base64 = compressedData.replace('COMPRESSED::', '')
    const binaryString = atob(base64)
    const compressed = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i)
    }

    const decompressedStream = new DecompressionStream('gzip')
    const writer = decompressedStream.writable.getWriter()

    await writer.write(compressed)
    await writer.close()

    const reader = decompressedStream.readable.getReader()
    const chunks: Uint8Array[] = []

    let result = await reader.read()
    while (!result.done) {
      if (result.value) {
        chunks.push(result.value)
      }
      result = await reader.read()
    }

    const combined = new Uint8Array(
      chunks.reduce((total, chunk) => total + chunk.length, 0),
    )
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }

    const decoder = new TextDecoder()
    return decoder.decode(combined)
  } catch (error) {
    console.error('Decompression failed:', error)
    throw new Error('Failed to decompress backup data')
  }
}
