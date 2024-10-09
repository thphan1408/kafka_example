import KafkaConfig from "../configs/kafka.config.js";
import { TOPIC_NAME } from "../constants/values.contants.js";

const kafkaConfig = new KafkaConfig(); // Khởi tạo KafkaConfig bên ngoài hàm

const sendMessageToKafka = async (req, res) => {
    try {
        const { message } = req.body;

        const messages = [
            {
                key: 'key1',
                value: message,
            },
        ];

        // Chờ cho tin nhắn được gửi thành công
        await kafkaConfig.produce(TOPIC_NAME, messages);

        res.status(200).json({ message: "Message sent to Kafka" });
    } catch (error) {
        console.error("Error sending message to Kafka:", error);
        res.status(500).json({ error: "Failed to send message to Kafka" });
    }
}

const controller = {
    sendMessageToKafka,
};

export default controller;
