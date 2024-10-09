const paginateStocks = (stocks, page = 1, limit = 10) => {
    const start = (page - 1) * limit; // Tính toán vị trí bắt đầu
    return stocks.slice(start, start + limit); // Lấy dữ liệu theo trang
};

export {
    paginateStocks
}