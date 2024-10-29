import KafkaConfig from "../configs/kafka.config.js";
import { TOPIC_NAME } from "../constants/values.contants.js";
import { fetchData } from "../apis/fetchData.js";

const kafka = new KafkaConfig();

const startKafkaProducer = async () => {
    try {
        await kafka.initProducer();

        // Gọi fetchData định kỳ mỗi 5 giây và gửi dữ liệu vào Kafka
        setInterval(async () => {
            try {
                const stockData = await fetchData();
                if (stockData) {
                    const message = {
                        value: JSON.stringify(stockData),
                    };
                    await kafka.produce(TOPIC_NAME, [message]);
                    console.log("Sent data to Kafka:", stockData);
                } else {
                    console.log("No data fetched from API");
                }
            } catch (error) {
                console.error("Error fetching or sending data:", error);
            }
        }, 5000); // Thời gian gọi API có thể điều chỉnh tùy theo nhu cầu
    } catch (error) {
        console.error("Error starting Kafka Producer:", error);
    }
};


export default startKafkaProducer;
