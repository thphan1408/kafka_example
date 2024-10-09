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

    async produce(topic, messages) {
        try {
            await this.producer.connect()

            await this.producer.send({
                topic: topic,
                messages: messages,
            })
        } catch (error) {
            console.log(error)
        }
        finally {
            await this.producer.disconnect()
        }
    }

    async consume(topic, callback) {
        try {
            await this.consumer.connect()
            await this.consumer.subscribe({
                topic: topic,
                fromBeginning: true,
            })

            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const value = message.value.toString()
                    callback(value)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default KafkaConfig