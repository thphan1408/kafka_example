'use client'

import { Stock } from '@/types'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: 'buy',
    header: 'Buy',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'sell',
    header: 'Sell',
  },
  {
    accessorKey: 'total',
    header: 'Total',
  },
  {
    accessorKey: 'waitbuy',
    header: 'Wait Buy',
  },
  {
    accessorKey: 'waitsell',
    header: 'Wait Sell',
  },
]
