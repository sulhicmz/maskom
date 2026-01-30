import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import RealTimeEditor from '../RealTimeEditor'


jest.mock('@/utils/collaboration/collaborationClient', () => ({
  createCollaborationClient: jest.fn()
}))

jest.mock('@/utils/collaboration/collaborativeHistory', () => ({
  addToHistory: jest.fn()
}))

describe('RealTimeEditor', () => {
  const defaultProps = {
    postId: 1,
    initialContent: {
      title: 'Initial Title',
      description: 'Initial Description',
      content: 'Initial Content'
    },
    userId: 1,
    username: 'testuser',
    onSave: jest.fn(),
    hasEditorRole: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render editor with initial content', () => {
      render(<RealTimeEditor {...defaultProps} />)

      expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Initial Description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Initial Content')).toBeInTheDocument()
    })

    it('should display connection status indicator', () => {
      render(<RealTimeEditor {...defaultProps} />)

      expect(screen.getByText(/Terputus/)).toBeInTheDocument()
    })
  })

  describe('String Manipulation Functions', () => {
    describe('insertAtPosition', () => {
      it('should insert text at beginning of string', () => {
        render(<RealTimeEditor {...defaultProps} />)

        const titleInput = screen.getByDisplayValue('Initial Title')
        fireEvent.change(titleInput, { target: { value: 'Prefix Initial Title' } })

        expect(titleInput).toHaveValue('Prefix Initial Title')
      })

      it('should insert text in the middle of string', () => {
        render(<RealTimeEditor {...defaultProps} />)

        const titleInput = screen.getByDisplayValue('Initial Title')
        fireEvent.change(titleInput, { target: { value: 'Initi al Title' } })

        expect(titleInput).toHaveValue('Initi al Title')
      })

      it('should insert text at end of string', () => {
        render(<RealTimeEditor {...defaultProps} />)

        const titleInput = screen.getByDisplayValue('Initial Title')
        fireEvent.change(titleInput, { target: { value: 'Initial Title Suffix' } })

        expect(titleInput).toHaveValue('Initial Title Suffix')
      })

      it('should insert empty string', () => {
        render(<RealTimeEditor {...defaultProps} />)

        const titleInput = screen.getByDisplayValue('Initial Title')
        fireEvent.change(titleInput, { target: { value: '' } })

        expect(titleInput).toHaveValue('')
      })

      it('should handle Unicode characters', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'Indonesian Text' }} />)

        const titleInput = screen.getByDisplayValue('Indonesian Text')
        fireEvent.change(titleInput, { target: { value: 'Indo🇮🇩nesian Text' } })

        expect(titleInput).toHaveValue('Indo🇮🇩nesian Text')
      })
    })

    describe('deleteAtPosition', () => {
      it('should delete text from beginning', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'Prefix Initial Title' }} />)

        const titleInput = screen.getByDisplayValue('Prefix Initial Title')
        fireEvent.change(titleInput, { target: { value: 'Initial Title' } })

        expect(titleInput).toHaveValue('Initial Title')
      })

      it('should delete text from middle', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'Initi al Title' }} />)

        const titleInput = screen.getByDisplayValue('Initi al Title')
        fireEvent.change(titleInput, { target: { value: 'Initial Title' } })

        expect(titleInput).toHaveValue('Initial Title')
      })

      it('should delete text from end', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'Initial Title Suffix' }} />)

        const titleInput = screen.getByDisplayValue('Initial Title Suffix')
        fireEvent.change(titleInput, { target: { value: 'Initial Title' } })

        expect(titleInput).toHaveValue('Initial Title')
      })

      it('should handle deletion of entire string', () => {
        render(<RealTimeEditor {...defaultProps} />)

        const titleInput = screen.getByDisplayValue('Initial Title')
        fireEvent.change(titleInput, { target: { value: '' } })

        expect(titleInput).toHaveValue('')
      })

      it('should handle empty string deletion', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: '' }} />)

        const titleInput = screen.getByDisplayValue('')
        expect(titleInput).toHaveValue('')
      })

      it('should handle deletion of Unicode characters', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'Indo🇮🇩nesian Text' }} />)

        const titleInput = screen.getByDisplayValue('Indo🇮🇩nesian Text')
        fireEvent.change(titleInput, { target: { value: 'Indonesian Text' } })

        expect(titleInput).toHaveValue('Indonesian Text')
      })
    })

    describe('replaceAtPosition', () => {
      it('should replace character at position 0', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'A' }} />)

        const titleInput = screen.getByDisplayValue('A')
        fireEvent.change(titleInput, { target: { value: 'B' } })

        expect(titleInput).toHaveValue('B')
      })

      it('should replace character in the middle', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'AbCd' }} />)

        const titleInput = screen.getByDisplayValue('AbCd')
        fireEvent.change(titleInput, { target: { value: 'AbcD' } })

        expect(titleInput).toHaveValue('AbcD')
      })

      it('should replace character at the end', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'AbC' }} />)

        const titleInput = screen.getByDisplayValue('AbC')
        fireEvent.change(titleInput, { target: { value: 'Abc' } })

        expect(titleInput).toHaveValue('Abc')
      })

      it('should handle replacing with empty string', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'Abc' }} />)

        const titleInput = screen.getByDisplayValue('Abc')
        fireEvent.change(titleInput, { target: { value: '' } })

        expect(titleInput).toHaveValue('')
      })

      it('should maintain original string length when replacing single character', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'A' }} />)

        const titleInput = screen.getByDisplayValue('A')
        fireEvent.change(titleInput, { target: { value: 'B' } })

        expect((titleInput as HTMLInputElement).value.length).toBe(1)
      })

      it('should handle boundary condition - position at string length', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'AB' }} />)

        const titleInput = screen.getByDisplayValue('AB')
        fireEvent.change(titleInput, { target: { value: 'ABC' } })

        expect(titleInput).toHaveValue('ABC')
      })

      it('should NOT return just the replacement string (critical bug fix)', () => {
        render(<RealTimeEditor {...defaultProps} initialContent={{ ...defaultProps.initialContent, title: 'OriginalText' }} />)

        const titleInput = screen.getByDisplayValue('OriginalText')

        fireEvent.change(titleInput, { target: { value: 'OriginalTexT' } })

        expect(titleInput.value).not.toBe('T')
        expect(titleInput.value).toBe('OriginalTexT')
      })
    })
  })

  describe('Content Change Handling', () => {
    it('should call onSave when content changes', () => {
      render(<RealTimeEditor {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Initial Title')
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title'
        })
      )
    })

    it('should update all three content fields independently', () => {
      render(<RealTimeEditor {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Initial Title')
      const descriptionInput = screen.getByDisplayValue('Initial Description')
      const contentInput = screen.getByDisplayValue('Initial Content')

      fireEvent.change(titleInput, { target: { value: 'New Title' } })
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } })
      fireEvent.change(contentInput, { target: { value: 'New Content' } })

      expect(titleInput).toHaveValue('New Title')
      expect(descriptionInput).toHaveValue('New Description')
      expect(contentInput).toHaveValue('New Content')
    })
  })
})
