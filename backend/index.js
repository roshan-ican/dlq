const express = require('express');
const cors = require('cors');
const { producer, topics, createTopics } = require('./kafka');
const { startConsumers } = require('./consumers');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory store for messages
const messages = {
  main: [],
  retry2s: [],
  retry4s: [],
  retry6s: [],
  dlq: [],
  success: []
};

let simulateFailure = true; // Default to simulating failure

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    const messageObject = { id: Date.now().toString(), content: message, shouldFail: simulateFailure };
    messages.main.push(messageObject);
    await producer.send({
      topic: topics.main,
      messages: [
        { value: JSON.stringify(messageObject) },
      ],
    });
    res.status(200).send('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Error sending message');
  }
});

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/simulate-failure', (req, res) => {
  const { enable } = req.body;
  simulateFailure = enable;
  res.status(200).send({ simulateFailure });
});

app.get('/simulate-failure', (req, res) => {
  res.status(200).send({ simulateFailure });
});

const startServer = async () => {
  await createTopics();
  await producer.connect();
  await startConsumers(messages);
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
};

startServer();
