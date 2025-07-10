import React, { useState, useEffect } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, List, ListItem, ListItemText, Switch, FormControlLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [message, setMessage] = useState('');
  const [queues, setQueues] = useState({ main: [], retry2s: [], retry4s: [], retry6s: [], dlq: [], success: [] });
  const [simulateFailure, setSimulateFailure] = useState(true);

  const sendMessage = async () => {
    if (!message) return;
    await fetch('http://localhost:3001/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    setMessage('');
  };

  const toggleSimulateFailure = async (event) => {
    const enable = event.target.checked;
    await fetch('http://localhost:3001/simulate-failure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable })
    });
    setSimulateFailure(enable);
  };

  useEffect(() => {
    // Fetch initial simulateFailure state
    fetch('http://localhost:3001/simulate-failure')
      .then(res => res.json())
      .then(data => setSimulateFailure(data.simulateFailure));

    const interval = setInterval(() => {
      fetch('http://localhost:3001/messages')
        .then(res => res.json())
        .then(data => setQueues(data));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getQueueColor = (queueName) => {
    switch (queueName) {
      case 'dlq':
        return 'error.main';
      case 'success':
        return 'success.main';
      default:
        return 'primary.main';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        DLQ Simulator
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, alignItems: 'center' }}>
        <TextField
          label="Message Content"
          variant="outlined"
          value={message}
          onChange={e => setMessage(e.target.value)}
          sx={{ mr: 2, width: '300px' }}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send Message
        </Button>
        <FormControlLabel
          control={<Switch checked={simulateFailure} onChange={toggleSimulateFailure} />}
          label="Simulate Failure (All messages fail until DLQ)"
          sx={{ ml: 4 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {Object.keys(queues).map(queueName => (
          <Paper
            key={queueName}
            elevation={3}
            sx={{
              p: 2,
              m: 1,
              minWidth: '200px',
              flexGrow: 1,
              borderColor: getQueueColor(queueName),
              borderWidth: 2,
              borderStyle: 'solid',
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom color={getQueueColor(queueName)}>
              {queueName.toUpperCase()}
            </Typography>
            <List>
              <AnimatePresence>
                {queues[queueName].map(msg => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem disablePadding>
                      <ListItemText primary={msg.content} />
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default App;
