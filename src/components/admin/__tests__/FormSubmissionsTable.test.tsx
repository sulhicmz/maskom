import React from 'react'
import { render, screen } from '@testing-library/react'
import FormSubmissionsTable from '../FormSubmissionsTable'

const mockFormSubmissionData = [
  {
    formType: 'contact',
    totalSubmissions: 100,
    successfulSubmissions: 95,
    failedSubmissions: 5,
    avgCompletionTime: 2.5
  },
  {
    formType: 'login',
    totalSubmissions: 50,
    successfulSubmissions: 45,
    failedSubmissions: 5,
    avgCompletionTime: 1.8
  }
]

describe('FormSubmissionsTable', () => {
  it('renders table title', () => {
    render(<FormSubmissionsTable data={mockFormSubmissionData} />)
    expect(screen.getByText('Form Submissions Breakdown')).toBeInTheDocument()
  })

  it('renders all table headers', () => {
    render(<FormSubmissionsTable data={mockFormSubmissionData} />)
    expect(screen.getByText('Form Type')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Successful')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg Completion Time')).toBeInTheDocument()
  })

  it('renders form submission data', () => {
    render(<FormSubmissionsTable data={mockFormSubmissionData} />)
    expect(screen.getByText('contact')).toBeInTheDocument()
    expect(screen.getByText('login')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('renders success rate as percentage', () => {
    render(<FormSubmissionsTable data={mockFormSubmissionData} />)
    expect(screen.getByText('95.0%')).toBeInTheDocument()
  })

  it('renders avg completion time with seconds', () => {
    render(<FormSubmissionsTable data={mockFormSubmissionData} />)
    expect(screen.getByText('2.5s')).toBeInTheDocument()
  })

  it('handles empty data array', () => {
    render(<FormSubmissionsTable data={[]} />)
    expect(screen.getByText('Form Submissions Breakdown')).toBeInTheDocument()
  })

  it('renders badges for form types', () => {
    render(<FormSubmissionsTable data={mockFormSubmissionData} />)
    const badges = screen.getAllByRole('status')
    expect(badges.length).toBeGreaterThan(0)
  })
})
