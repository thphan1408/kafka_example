### What should be done after cloning the source?

    I integrated Kafka and Zookeeper directly into Docker, so there is no need to install the Kafka and Zookeeper packages.

    BACKEND:
        Open cmd run command: cd backend
        Use 'npm install' to install dependecies (I'm using node 22.2.0)
        Open cmd run command: docker-compose up -d
        Use 'npm run start' to run project with kafka real-time

    FRONTEND:
        Open cmd run command: cd frontend
        Use 'npm install' to install dependecies (I'm using node 22.2.0)
        Use 'npm run dev' to run project and enjoy

    EXPLANATION:
        Apache Kafka help we build real-time data pipelines
        Producer to publish messages (events) to a Kafka topic
        Consumer to subscribe to a topic and processes the incoming messages
        Socket IO to enable realtime tasks for framework nextjs

==> THANKS FOR WATCHING
