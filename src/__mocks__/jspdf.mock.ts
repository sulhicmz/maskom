export const createJsPdfMock = function() {
  return {
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    splitTextToSize: jest.fn((text: string) => text.split(' ').map(word => word.substring(0, 50))),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210)
      }
    },
    addPage: jest.fn(),
    save: jest.fn(),
    setTextColor: jest.fn()
  }
}

export default createJsPdfMock
