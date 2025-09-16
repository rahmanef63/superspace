import { ChartAreaInteractive } from "../_components/chart-area-interactive"
import { DataTable } from "@/frontend/shared/components/data/DataTable"

import data from "./data.json"

export default function Page() {
  const columns = [
    { key: 'id' as const, header: 'ID' },
    { key: 'header' as const, header: 'Header' },
    { key: 'type' as const, header: 'Type' },
    { key: 'status' as const, header: 'Status' },
    { key: 'target' as const, header: 'Target' },
    { key: 'limit' as const, header: 'Limit' },
    { key: 'reviewer' as const, header: 'Reviewer' },
  ];

  return (
    <>
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} columns={columns} />
    </>
  )
}
