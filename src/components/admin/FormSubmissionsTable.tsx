import React, { memo } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import TableCard from '@/components/ui/TableCard'
import { formatAsPercentage } from '@/utils/formatPercentage'
import type { FormSubmissionMetrics } from '@/types/analytics'

interface FormSubmissionsTableProps {
  data: FormSubmissionMetrics[]
}

const FormSubmissionRow = memo(({ form, index }: { form: FormSubmissionMetrics; index: number }) => {
  return (
    <tr key={index}>
      <td>
        <span className="badge bg-primary">{form.formType}</span>
      </td>
      <td>{form.totalSubmissions}</td>
      <td><StatusBadge type="success">{form.successfulSubmissions}</StatusBadge></td>
      <td><StatusBadge type="danger">{form.failedSubmissions}</StatusBadge></td>
      <td>{formatAsPercentage(form.successfulSubmissions, form.totalSubmissions)}</td>
      <td>{form.avgCompletionTime}s</td>
    </tr>
  )
})

FormSubmissionRow.displayName = 'FormSubmissionRow'

const FormSubmissionsTable = ({ data }: FormSubmissionsTableProps) => {
  return (
    <TableCard title="Form Submissions Breakdown">
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">Form Type</th>
            <th scope="col">Total</th>
            <th scope="col">Successful</th>
            <th scope="col">Failed</th>
            <th scope="col">Success Rate</th>
            <th scope="col">Avg Completion Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((form, index) => (
            <FormSubmissionRow key={index} form={form} index={index} />
          ))}
        </tbody>
      </table>
    </TableCard>
  )
}

export default memo(FormSubmissionsTable)
