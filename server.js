import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';  // Use named import for WebSocketServer

// Create an Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello! This is an Express API with WebSocket support.');
});

// Example POST route
app.post('/api/data', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  res.json({ message: 'Data received successfully', receivedData: data });
});

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocketServer({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send a welcome message when a client connects
  ws.send('Welcome to the WebSocket server!');

  // Handle incoming messages from the client
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Echo the message back to the client
    ws.send(`You sent: ${message}`);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
