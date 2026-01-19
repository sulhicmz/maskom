export async function encryptData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBuffer,
    )

    const keyBuffer = await crypto.subtle.exportKey('raw', key)
    const encryptedDataUint8Array = new Uint8Array(encryptedData)
    const combined = new Uint8Array(
      iv.length + keyBuffer.byteLength + encryptedData.byteLength,
    )
    combined.set(iv, 0)
    combined.set(new Uint8Array(keyBuffer), iv.length)
    combined.set(encryptedDataUint8Array, iv.length + keyBuffer.byteLength)

    const base64 = btoa(String.fromCharCode(...combined))

    return `ENCRYPTED::${base64}`
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt backup data')
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    if (!encryptedData.startsWith('ENCRYPTED::')) {
      return encryptedData
    }

    const base64 = encryptedData.replace('ENCRYPTED::', '')
    const binaryString = atob(base64)
    const combined = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i)
    }

    const iv = combined.slice(0, 12)
    const keyBuffer = combined.slice(12, 44)
    const dataBuffer = combined.slice(44)

    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['decrypt'],
    )

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBuffer,
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt backup data')
  }
}
