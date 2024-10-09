'use client'

import useStockRealtime from '@/configs/websocket.config'
import { DataTable } from './data-table'
import { columns } from './columns'

export default function Home() {
  const data = useStockRealtime() // Gọi hook để lấy dữ liệu realtime

  return (
    <div>
      <h1>Stock Wave Real</h1>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
