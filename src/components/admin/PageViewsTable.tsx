import React, { memo } from 'react'
import TableCard from '@/components/ui/TableCard'
import { formatAsPercentage } from '@/utils/formatPercentage'
import type { PageViewMetrics } from '@/types/analytics'

interface PageViewsTableProps {
  data: PageViewMetrics[]
}

const PageViewRow = memo(({ page, index }: { page: PageViewMetrics; index: number }) => {
  return (
    <tr key={index}>
      <td>
        <a href={page.pagePath} className="text-decoration-none">
          {page.pageTitle}
        </a>
      </td>
      <td>{page.totalViews}</td>
      <td>{page.uniqueViews}</td>
      <td>{page.avgTimeOnPage}s</td>
      <td>{formatAsPercentage(page.bounceRate * 100, 100)}</td>
    </tr>
  )
})

PageViewRow.displayName = 'PageViewRow'

const PageViewsTable = ({ data }: PageViewsTableProps) => {
  return (
    <TableCard title="Page Views Breakdown">
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">Page</th>
            <th scope="col">Total Views</th>
            <th scope="col">Unique Views</th>
            <th scope="col">Avg Time on Page</th>
            <th scope="col">Bounce Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((page, index) => (
            <PageViewRow key={index} page={page} index={index} />
          ))}
        </tbody>
      </table>
    </TableCard>
  )
}

export default memo(PageViewsTable)
