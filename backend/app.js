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

/**
 * Config Kafka
 * Consume from topic
 */
const kafka = new KafkaConfig(); // Tạo instance của KafkaConfig

const startKafkaConsumer = async () => {
    try {
        await kafka.consume(TOPIC_NAME, async (value) => {
            const stockData = await fetchData(); // Gọi hàm fetchData
            io.emit('stockData', stockData); // Phát dữ liệu qua WebSocket
        });
    } catch (error) {
        console.error("Error connecting to Kafka:", error);
    }
};
startKafkaConsumer();

let lastStockData = null;

// Gọi fetchData liên tục mỗi 5 giây
setInterval(async () => {
    try {
        const stockData = await fetchData();
        console.log(`stockData:: `, stockData)
        // Kiểm tra dữ liệu trước khi phát qua WebSocket
        if (stockData) {
            console.log('Emitting stockData via WebSocket:', stockData);
            io.emit('stockData', stockData); // Phát dữ liệu qua WebSocket
        } else {
            console.log('No data to emit.');
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}, 5000);

// // Lắng nghe kết nối WebSocket
// io.on('connection', (socket) => {
//     console.log('New client connected');

//     // Gửi dữ liệu ngay khi client kết nối (nếu cần)
//     socket.emit('stockData', { message: 'Initial stock data' });

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

// Khởi động server HTTP và WebSocket trên cổng 5000
server.listen(5000, () => {
    console.log('Server is running on port 5000');
});
