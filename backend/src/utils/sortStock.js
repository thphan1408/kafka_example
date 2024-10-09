const sortStocks = (stocks, order = 'asc') => {
    return stocks.sort((a, b) => {
        if (order === 'asc') {
            return a.waveDataReal.total - b.waveDataReal.total; // Sắp xếp tăng dần theo tổng
        } else {
            return b.waveDataReal.total - a.waveDataReal.total; // Sắp xếp giảm dần theo tổng
        }
    });
};

export {
    sortStocks
}