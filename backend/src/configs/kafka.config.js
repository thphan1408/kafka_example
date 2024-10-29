import { Kafka } from "kafkajs";

class KafkaConfig {
    constructor() {
        this.Kafka = new Kafka({
            clientId: "KafkaAPI",
            brokers: ["localhost:9092"],
        })

        this.producer = this.Kafka.producer();
        this.consumer = this.Kafka.consumer({ groupId: "stock-group" });
    }

    async initProducer() {
        try {
            await this.producer.connect();
            console.log("Kafka Producer connected");
        } catch (error) {
            console.error("Error connecting Kafka Producer:", error);
        }
    }

    async initConsumer(topic, callback) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic: topic, fromBeginning: false });

            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const value = message.value.toString();
                    callback(value);
                },
            });

            console.log("Kafka Consumer connected and listening");
        } catch (error) {
            console.error("Error connecting Kafka Consumer:", error);
        }
    }

    async produce(topic, messages) {
        try {
            await this.producer.send({
                topic: topic,
                messages: messages,
            });
            console.log("Message sent to Kafka:", messages);
        } catch (error) {
            console.error("Error sending message to Kafka:", error);
        }
    }


}

export default KafkaConfig