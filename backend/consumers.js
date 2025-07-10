const { kafka, producer, topics } = require('./kafka');

const createConsumer = async (topic, groupId, handleMessage) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await handleMessage(message);
    },
  });
};

const startConsumers = async (messages) => {
  const moveMessage = (message, from, to) => {
    const msg = JSON.parse(message.value.toString());
    messages[from] = messages[from].filter(m => m.id !== msg.id);
    messages[to].push(msg);
  };

  // Main topic consumer
  await createConsumer(topics.main, 'main-group', async (message) => {
    console.log(`Received message on main topic: ${message.value.toString()}`);
    const parsedMessage = JSON.parse(message.value.toString());
    if (parsedMessage.shouldFail) {
      console.log('Message failed, sending to retry-2s');
      moveMessage(message, 'main', 'retry2s');
      await producer.send({ topic: topics.retry2s, messages: [message] });
    } else {
      console.log('Message succeeded, sending to success');
      moveMessage(message, 'main', 'success');
      await producer.send({ topic: topics.success, messages: [message] });
    }
  });

  // Retry 2s topic consumer
  await createConsumer(topics.retry2s, 'retry-2s-group', async (message) => {
    console.log(`Received message on retry-2s topic: ${message.value.toString()}`);
    setTimeout(async () => {
      const parsedMessage = JSON.parse(message.value.toString());
      if (parsedMessage.shouldFail) {
        console.log('Message failed, sending to retry-4s');
        moveMessage(message, 'retry2s', 'retry4s');
        await producer.send({ topic: topics.retry4s, messages: [message] });
      } else {
        console.log('Message succeeded, sending to success');
        moveMessage(message, 'retry2s', 'success');
        await producer.send({ topic: topics.success, messages: [message] });
      }
    }, 2000);
  });

  // Retry 4s topic consumer
  await createConsumer(topics.retry4s, 'retry-4s-group', async (message) => {
    console.log(`Received message on retry-4s topic: ${message.value.toString()}`);
    setTimeout(async () => {
      const parsedMessage = JSON.parse(message.value.toString());
      if (parsedMessage.shouldFail) {
        console.log('Message failed, sending to retry-6s');
        moveMessage(message, 'retry4s', 'retry6s');
        await producer.send({ topic: topics.retry6s, messages: [message] });
      } else {
        console.log('Message succeeded, sending to success');
        moveMessage(message, 'retry4s', 'success');
        await producer.send({ topic: topics.success, messages: [message] });
      }
    }, 4000);
  });

  // Retry 6s topic consumer
  await createConsumer(topics.retry6s, 'retry-6s-group', async (message) => {
    console.log(`Received message on retry-6s topic: ${message.value.toString()}`);
    setTimeout(async () => {
      const parsedMessage = JSON.parse(message.value.toString());
      if (parsedMessage.shouldFail) {
        console.log('Message failed, sending to dlq');
        moveMessage(message, 'retry6s', 'dlq');
        await producer.send({ topic: topics.dlq, messages: [message] });
      } else {
        console.log('Message succeeded, sending to success');
        moveMessage(message, 'retry6s', 'success');
        await producer.send({ topic: topics.success, messages: [message] });
      }
    }, 6000);
  });

  // DLQ and Success consumers
  await createConsumer(topics.dlq, 'dlq-group', async (message) => {
    console.log(`Received message on DLQ topic: ${message.value.toString()}`);
  });

  await createConsumer(topics.success, 'success-group', async (message) => {
    console.log(`Received message on Success topic: ${message.value.toString()}`);
  });
};

module.exports = { startConsumers };
