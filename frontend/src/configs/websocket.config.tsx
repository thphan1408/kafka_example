import { Stock } from '@/types'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

const useStockRealtime = (): Stock[] => {
  const [stockData, setStockData] = useState<Stock[]>([])

  useEffect(() => {
    const socket = io('http://localhost:5000') // Kết nối tới WebSocket server

    socket.on('stockData', (data: Stock[]) => {
      if (JSON.stringify(data) !== JSON.stringify(stockData)) {
        setStockData(data) // Cập nhật state nếu dữ liệu thay đổi
      }
    })

    return () => {
      socket.off('stockData')
      socket.disconnect()
    }
  }, [stockData]) // Thêm `stockData` vào dependencies của useEffect nếu cần so sánh.

  // **Trả về stockData**
  return stockData
}

export default useStockRealtime
