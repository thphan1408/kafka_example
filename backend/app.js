import express from "express";
import KafkaConfig from "./src/configs/kafka.config.js";
import { TOPIC_NAME } from "./src/constants/values.contants.js";
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import EventEmitter from 'events';
import startKafkaProducer from "./src/controllers/kafka.controller.js";

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
// app.post("/send-api", controller.sendMessageToKafka);

let lastStockData = null;

// EventEmitter để lắng nghe sự kiện từ Kafka
class KafkaEmitter extends EventEmitter { }
const kafkaEmitter = new KafkaEmitter();

/**
 * Config Kafka
 * Consume from topic
 */
const kafka = new KafkaConfig(); // Tạo instance của KafkaConfig

const startKafkaConsumer = async () => {
    try {
        await kafka.initConsumer(TOPIC_NAME, (value) => {
            const stockData = JSON.parse(value);
            console.log("Received data from Kafka:", stockData);
            lastStockData = stockData;
            io.emit('stockData', stockData); // Phát dữ liệu qua WebSocket

            kafkaEmitter.emit('newStockData', stockData); // Phát sự kiện khi có dữ liệu mới
        });
    } catch (error) {
        console.error("Error starting Kafka Consumer:", error);
    }
};

// API mới để trả về dữ liệu từ Kafka qua HTTP
// app.post("/stock-data", (req, res) => {
//     const { buy, date, sell, total, waitbuy, waitsell } = req.body;
//     // Kiểm tra các trường không được undefined, null hoặc rỗng
//     if (
//         buy == null || buy === '' ||
//         date == null || date === '' ||
//         sell == null || sell === '' ||
//         total == null || total === '' ||
//         waitbuy == null || waitbuy === '' ||
//         waitsell == null || waitsell === ''
//     ) {
//         return res.status(400).json({ error: "Các trường không được phép là undefined, null hoặc rỗng." });
//     }

//     // Thiết lập timeout để tránh request treo mãi
//     const timeout = setTimeout(() => {
//         res.status(504).json({ error: "Timeout waiting for data from Kafka." });
//     }, 10000); // Timeout sau 10 giây

//     // Hàm callback khi nhận được dữ liệu từ Kafka
//     const onDataReceived = (stockData) => {
//         clearTimeout(timeout);
//         res.json({ stockData });
//     };

//     // Đăng ký lắng nghe sự kiện dữ liệu mới từ Kafka
//     kafkaEmitter.once('newStockData', onDataReceived);

//     // Xử lý khi request bị hủy
//     req.on('close', () => {
//         clearTimeout(timeout);
//         kafkaEmitter.removeListener('newStockData', onDataReceived);
//     });
// });

app.post("/update-stock-data", async (req, res) => {
    const { buy, date, sell, total, waitbuy, waitsell } = req.body;
    console.log("Received stock data:", req.body);

    // Kiểm tra các trường không được undefined, null hoặc rỗng
    if (
        buy == null || buy === '' ||
        date == null || date === '' ||
        sell == null || sell === '' ||
        total == null || total === '' ||
        waitbuy == null || waitbuy === '' ||
        waitsell == null || waitsell === ''
    ) {
        return res.status(400).json({ error: "Các trường không được phép là undefined, null hoặc rỗng." });
    }

    // Cập nhật dữ liệu stock mới nhất
    lastStockData = { buy, date, sell, total, waitbuy, waitsell };

    try {
        // Gửi dữ liệu lên Kafka
        const message = {
            value: JSON.stringify(lastStockData),
        };
        await kafka.produce(TOPIC_NAME, [message]);
        console.log("Sent data to Kafka:", lastStockData);

        // Phát dữ liệu qua WebSocket tới các client
        io.emit('stockData', lastStockData);

        console.log("Data sent to frontend via WebSocket:", lastStockData);
        res.status(200).json({ message: "Stock data updated successfully" });
    } catch (error) {
        console.error("Error sending data to Kafka:", error);
        res.status(500).json({ error: "Failed to send data to Kafka" });
    }
});

// Lắng nghe kết nối WebSocket
// io.on('connection', (socket) => {
//     console.log('New client connected');

//     // Gửi dữ liệu ngay khi client kết nối (nếu cần)
//     if (lastStockData) {
//         socket.emit('stockData', lastStockData);
//     }

//     // Lắng nghe sự kiện 'requestStockData' từ client
//     socket.on('requestStockData', (requestData) => {
//         console.log('Received request from client:', requestData);

//         const { buy, date, sell, total, waitbuy, waitsell } = requestData;

//         // Kiểm tra các trường không được undefined, null hoặc rỗng
//         if (
//             buy == null || buy === '' ||
//             date == null || date === '' ||
//             sell == null || sell === '' ||
//             total == null || total === '' ||
//             waitbuy == null || waitbuy === '' ||
//             waitsell == null || waitsell === ''
//         ) {
//             socket.emit('error', { error: "Các trường không được phép là undefined, null hoặc rỗng." });
//             return;
//         }

//         // Khi nhận được yêu cầu từ client, server sẽ chờ dữ liệu mới từ Kafka
//         const timeout = setTimeout(() => {
//             socket.emit('error', { error: "Timeout waiting for data from Kafka." });
//         }, 10000); // Timeout sau 10 giây

//         const onDataReceived = (stockData) => {
//             clearTimeout(timeout);
//             socket.emit('stockData', stockData);
//         };

//         // Đăng ký lắng nghe sự kiện dữ liệu mới từ Kafka
//         kafkaEmitter.once('newStockData', onDataReceived);

//         // Xử lý khi socket bị ngắt kết nối
//         socket.on('disconnect', () => {
//             clearTimeout(timeout);
//             kafkaEmitter.removeListener('newStockData', onDataReceived);
//             console.log('Client disconnected');
//         });
//     });

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

startKafkaProducer();

startKafkaConsumer();


// Khởi động server HTTP và WebSocket trên cổng 5001
server.listen(5001, () => {
    console.log('Server is running on port 5001');
});
