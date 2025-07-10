const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: [process.env.BROKER_ID]
});
  
const producer = kafka.producer();

const topics = {
  main: 'main-topic',
  retry2s: 'retry-topic-2s',
  retry4s: 'retry-topic-4s',
  retry6s: 'retry-topic-6s',
  dlq: 'dlq-topic',
  success: 'success-topic'
};

const createTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();
  const existingTopics = await admin.listTopics();
  const topicNames = Object.values(topics);

  const topicsToCreate = topicNames.filter(topic => !existingTopics.includes(topic));

  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate.map(topic => ({ topic, numPartitions: 1, replicationFactor: 1 }))
    });
  }

  await admin.disconnect();
};

module.exports = { kafka, producer, topics, createTopics };
