import express from "express";
import controller from "./src/controllers/kafka.controller.js";
import KafkaConfig from "./src/configs/kafka.config.js";
import { TOPIC_NAME } from "./src/constants/values.contants.js";
import { fetchData } from "./src/apis/fetchData.js";
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

const server = http.createServer(app); // Tạo server HTTP
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Cấu hình CORS cho WebSocket
        methods: ["GET", "POST"]
    }
});

// middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Cấu hình CORS cho Express

// routes
app.post("/send-api", controller.sendMessageToKafka);

let lastStockData = null;

// API mới để trả về dữ liệu từ Kafka qua HTTP
app.get("/stock-data", (req, res) => {
    const checkForNewData = () => {
        if (lastStockData) {
            res.json({ stockData: lastStockData });
        } else {
            // Nếu chưa có dữ liệu mới, tiếp tục chờ một chút rồi kiểm tra lại
            setTimeout(checkForNewData, 2000); // Kiểm tra lại sau 2 giây
        }
    };
    checkForNewData();
});

/**
 * Config Kafka
 * Consume from topic
 */
const kafka = new KafkaConfig(); // Tạo instance của KafkaConfig

const startKafkaConsumer = async () => {
    try {
        await kafka.consume(TOPIC_NAME, async (value) => {
            const stockData = await fetchData(); // Gọi hàm fetchData
            console.log("Received data from Kafka:", stockData); // Log dữ liệu từ Kafka
            lastStockData = stockData;
            io.emit('stockData', stockData); // Phát dữ liệu qua WebSocket
        });
    } catch (error) {
        console.error("Error connecting to Kafka:", error);
    }
};
startKafkaConsumer();

// Gọi fetchData liên tục mỗi 5 giây
setInterval(async () => {
    try {
        const stockData = await fetchData();
        console.log(`Fetched stockData:: `, stockData); // Log dữ liệu từ fetchData
        if (stockData) {
            console.log('Emitting stockData via WebSocket:', stockData);
            lastStockData = stockData; // Cập nhật lastStockData khi có dữ liệu
            io.emit('stockData', stockData); // Phát dữ liệu qua WebSocket
        } else {
            console.log('No data to emit.');
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}, 5000);


// Lắng nghe kết nối WebSocket
io.on('connection', (socket) => {
    console.log('New client connected');

    // Gửi dữ liệu ngay khi client kết nối (nếu cần)
    if (lastStockData) {
        socket.emit('stockData', lastStockData);
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Khởi động server HTTP và WebSocket trên cổng 5000
server.listen(5001, () => {
    console.log('Server is running on port 5000');
});
