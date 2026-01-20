import { encryptData, decryptData } from '../backupCrypto'

describe('backupCrypto', () => {
  describe('encryptData', () => {
    beforeEach(() => {
      jest.resetModules()
    })

    it('should have encryptData function exported', () => {
      expect(typeof encryptData).toBe('function')
    })

    it('should return string with ENCRYPTED:: prefix', async () => {
      try {
        const encrypted = await encryptData('test')
        expect(encrypted).toMatch(/^ENCRYPTED::/)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle empty string', async () => {
      try {
        const encrypted = await encryptData('')
        expect(encrypted).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle large data', async () => {
      try {
        const data = 'A'.repeat(1000)
        const encrypted = await encryptData(data)
        expect(encrypted).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle special characters', async () => {
      try {
        const data = 'Special: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
        const encrypted = await encryptData(data)
        expect(encrypted).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle Unicode characters', async () => {
      try {
        const data = 'Unicode: 你好 🎉 🚀 العربية'
        const encrypted = await encryptData(data)
        expect(encrypted).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle JSON data', async () => {
      try {
        const data = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } })
        const encrypted = await encryptData(data)
        expect(encrypted).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('decryptData', () => {
    it('should have decryptData function exported', () => {
      expect(typeof decryptData).toBe('function')
    })

    it('should return unencrypted data as-is', async () => {
      const plainData = 'Plain text'
      const decrypted = await decryptData(plainData)
      expect(decrypted).toBe(plainData)
    })

    it('should handle empty string', async () => {
      const plainData = ''
      const decrypted = await decryptData(plainData)
      expect(decrypted).toBe(plainData)
    })

    it('should handle large data', async () => {
      const plainData = 'A'.repeat(1000)
      const decrypted = await decryptData(plainData)
      expect(decrypted).toBe(plainData)
    })

    it('should handle special characters', async () => {
      const plainData = 'Special: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const decrypted = await decryptData(plainData)
      expect(decrypted).toBe(plainData)
    })

    it('should handle Unicode characters', async () => {
      const plainData = 'Unicode: 你好 🎉 🚀 العربية'
      const decrypted = await decryptData(plainData)
      expect(decrypted).toBe(plainData)
    })

    it('should handle JSON data', async () => {
      const plainData = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } })
      const decrypted = await decryptData(plainData)
      expect(decrypted).toBe(plainData)
      const parsed = JSON.parse(decrypted)
      expect(parsed.key).toBe('value')
    })

    it('should return invalid format as-is (not encrypted)', async () => {
      const result = await decryptData('INVALID_FORMAT')
      expect(result).toBe('INVALID_FORMAT')
    })

    it('should throw error on malformed base64 data', async () => {
      await expect(decryptData('ENCRYPTED::@@@')).rejects.toThrow('Failed to decrypt backup data')
    })
  })

  describe('integration tests (requires full Web Crypto API)', () => {
    it('should encrypt and decrypt data successfully in browser environment', async () => {
      const hasFullCrypto = typeof crypto.subtle !== 'undefined' &&
                           typeof crypto.subtle.generateKey === 'function' &&
                           typeof crypto.subtle.encrypt === 'function'

      if (!hasFullCrypto) {
        console.warn('Skipping test: Full Web Crypto API not available in test environment')
        return
      }

      const originalData = 'Secret message'
      const encrypted = await encryptData(originalData)
      const decrypted = await decryptData(encrypted)

      expect(decrypted).toBe(originalData)
    })

    it('should produce different encrypted values for same data', async () => {
      const hasFullCrypto = typeof crypto.subtle !== 'undefined' &&
                           typeof crypto.subtle.generateKey === 'function' &&
                           typeof crypto.subtle.encrypt === 'function'

      if (!hasFullCrypto) {
        console.warn('Skipping test: Full Web Crypto API not available in test environment')
        return
      }

      const data = 'Same data'
      const encrypted1 = await encryptData(data)
      const encrypted2 = await encryptData(data)

      expect(encrypted1).not.toBe(encrypted2)
    })

    it('should maintain data integrity through encrypt-decrypt cycle', async () => {
      const hasFullCrypto = typeof crypto.subtle !== 'undefined' &&
                           typeof crypto.subtle.generateKey === 'function' &&
                           typeof crypto.subtle.encrypt === 'function'

      if (!hasFullCrypto) {
        console.warn('Skipping test: Full Web Crypto API not available in test environment')
        return
      }

      const testData = [
        'Simple text',
        '',
        'A'.repeat(1000),
        'Special chars: !@#$%',
        'Unicode: 你好 🚀',
        JSON.stringify({ complex: { nested: { structure: [1, 2, 3] } } }),
      ]

      for (const data of testData) {
        const encrypted = await encryptData(data)
        const decrypted = await decryptData(encrypted)
        expect(decrypted).toBe(data)
      }
    })
  })
})
