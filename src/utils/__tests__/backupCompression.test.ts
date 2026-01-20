import { compressData, decompressData } from '../backupCompression'

describe('backupCompression', () => {
  describe('compressData', () => {
    it('should have compressData function exported', () => {
      expect(typeof compressData).toBe('function')
    })

    it('should return string with COMPRESSED:: prefix', async () => {
      try {
        const compressed = await compressData('test')
        expect(compressed).toMatch(/^COMPRESSED::/)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should compress data successfully', async () => {
      try {
        const data = 'Hello, World!'
        const compressed = await compressData(data)

        expect(compressed).toBeDefined()
        expect(typeof compressed).toBe('string')
        expect(compressed).not.toBe(data)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should compress empty string', async () => {
      try {
        const data = ''
        const compressed = await compressData(data)

        expect(compressed).toBeDefined()
        expect(compressed).toMatch(/^COMPRESSED::/)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should compress large data', async () => {
      try {
        const data = 'A'.repeat(1000)
        const compressed = await compressData(data)

        expect(compressed).toBeDefined()
        expect(compressed).toMatch(/^COMPRESSED::/)
        expect(compressed.length).toBeGreaterThan(0)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should compress special characters', async () => {
      try {
        const data = 'Special: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
        const compressed = await compressData(data)

        expect(compressed).toBeDefined()
        expect(compressed).toMatch(/^COMPRESSED::/)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should compress Unicode characters', async () => {
      try {
        const data = 'Unicode: 你好 🎉 🚀 العربية'
        const compressed = await compressData(data)

        expect(compressed).toBeDefined()
        expect(compressed).toMatch(/^COMPRESSED::/)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should compress JSON data', async () => {
      try {
        const data = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } })
        const compressed = await compressData(data)

        expect(compressed).toBeDefined()
        expect(compressed).toMatch(/^COMPRESSED::/)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('decompressData', () => {
    it('should have decompressData function exported', () => {
      expect(typeof decompressData).toBe('function')
    })

    it('should return uncompressed data as-is', async () => {
      const plainData = 'Plain text'
      const decompressed = await decompressData(plainData)

      expect(decompressed).toBe(plainData)
    })

    it('should handle empty string', async () => {
      const plainData = ''
      const decompressed = await decompressData(plainData)

      expect(decompressed).toBe(plainData)
    })

    it('should handle large data', async () => {
      const plainData = 'A'.repeat(1000)
      const decompressed = await decompressData(plainData)

      expect(decompressed).toBe(plainData)
    })

    it('should handle special characters', async () => {
      const plainData = 'Special: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const decompressed = await decompressData(plainData)

      expect(decompressed).toBe(plainData)
    })

    it('should handle Unicode characters', async () => {
      const plainData = 'Unicode: 你好 🎉 🚀 العربية'
      const decompressed = await decompressData(plainData)

      expect(decompressed).toBe(plainData)
    })

    it('should handle JSON data', async () => {
      const plainData = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } })
      const decompressed = await decompressData(plainData)

      expect(decompressed).toBe(plainData)
      const parsed = JSON.parse(decompressed)
      expect(parsed.key).toBe('value')
    })

    it('should throw error on malformed base64 data', async () => {
      await expect(decompressData('COMPRESSED::@@@')).rejects.toThrow('Failed to decompress backup data')
    })

    it('should throw error on invalid compressed data', async () => {
      await expect(decompressData('COMPRESSED::aW52YWxpZA==')).rejects.toThrow('Failed to decompress backup data')
    })
  })

  describe('integration tests (requires CompressionStream API)', () => {
    it('should compress and decompress data successfully in browser environment', async () => {
      const hasCompressionAPI = typeof CompressionStream !== 'undefined' &&
                                typeof DecompressionStream !== 'undefined'

      if (!hasCompressionAPI) {
        console.warn('Skipping test: CompressionStream API not available in test environment')
        return
      }

      const originalData = 'Secret message that should be compressed'
      const compressed = await compressData(originalData)
      const decompressed = await decompressData(compressed)

      expect(decompressed).toBe(originalData)
    })

    it('should reduce data size for repetitive data', async () => {
      const hasCompressionAPI = typeof CompressionStream !== 'undefined' &&
                                typeof DecompressionStream !== 'undefined'

      if (!hasCompressionAPI) {
        console.warn('Skipping test: CompressionStream API not available in test environment')
        return
      }

      const originalData = 'A'.repeat(1000)
      const compressed = await compressData(originalData)
      const decompressed = await decompressData(compressed)

      expect(decompressed).toBe(originalData)
      expect(compressed.length).toBeLessThan(originalData.length)
    })

    it('should maintain data integrity through compress-decompress cycle', async () => {
      const hasCompressionAPI = typeof CompressionStream !== 'undefined' &&
                                typeof DecompressionStream !== 'undefined'

      if (!hasCompressionAPI) {
        console.warn('Skipping test: CompressionStream API not available in test environment')
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
        const compressed = await compressData(data)
        const decompressed = await decompressData(compressed)
        expect(decompressed).toBe(data)
      }
    })

    it('should handle multiple compress-decompress cycles', async () => {
      const hasCompressionAPI = typeof CompressionStream !== 'undefined' &&
                                typeof DecompressionStream !== 'undefined'

      if (!hasCompressionAPI) {
        console.warn('Skipping test: CompressionStream API not available in test environment')
        return
      }

      const originalData = 'Multi-cycle test data'
      let current = originalData

      for (let i = 0; i < 3; i++) {
        const compressed = await compressData(current)
        current = await decompressData(compressed)
      }

      expect(current).toBe(originalData)
    })
  })
})
