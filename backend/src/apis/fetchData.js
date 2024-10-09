import axios from "axios";
import { sortStocks } from "../utils/sortStock.js";
import { paginateStocks } from "../utils/paginateStock.js";

const fetchData = async (page = 1, limit = 10, sortOrder = 'asc') => {
    // Gọi API với dữ liệu từ Kafka
    try {
        const apiResponse = await axios.post(
            "https://stocktraders.vn/service/data/getStockWaveReal",
            {
                StockWaveRealRequest: {
                    account: "StockTraders",
                },
            }
        );

        const stocks = apiResponse.data.StockWaveRealReply.waveDataReal; // Lấy dữ liệu cần thiết
        const sortedStocks = sortStocks([stocks], sortOrder); // Sắp xếp dữ liệu
        const paginatedStocks = paginateStocks(sortedStocks, page, limit); // Phân trang dữ liệu

        return paginatedStocks; // Trả về dữ liệu đã sắp xếp và phân trang
    } catch (error) {
        console.error("Error calling API:", error);
    }
}

export {
    fetchData
}