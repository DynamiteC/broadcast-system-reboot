import { Worker, isMainThread, parentPort } from 'worker_threads';
import WebSocket from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Number of concurrent clients per worker
const CLIENTS_PER_WORKER = 50; // Adjust this based on your system's capabilities
const TOTAL_CLIENTS = 10000;
const NUM_WORKERS = TOTAL_CLIENTS / CLIENTS_PER_WORKER; // Number of workers needed
const SERVER_URL = 'ws://localhost:9001'; // URL of your WebSocket server

// Function to simulate a WebSocket client
function simulateWebSocketClient(workerId, startId, numClients) {
  for (let i = 0; i < numClients; i++) {
    const clientId = startId + i;
    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
      console.log(`Worker ${workerId}: Client ${clientId} connected`);
      // Join a group (you can modify this part to match your app logic)
      const group = `group_${Math.floor(Math.random() * 50000)}`; // Randomly assign a group
      ws.send(JSON.stringify({ action: 'join_group', group }));

      // Send messages every 3 seconds
      setInterval(() => {
        ws.send(JSON.stringify({ action: 'send_message', message: `Message from client ${clientId}` }));
      }, 3000); // Fixed interval of 3 seconds
    });

    ws.on('message', (message) => {
      // Handle incoming messages (optional)
    });

    ws.on('close', () => {
      console.log(`Worker ${workerId}: Client ${clientId} disconnected`);
    });
  }
}

// Main thread: Spawn worker threads
if (isMainThread) {
  console.log(`Starting load test with ${TOTAL_CLIENTS} clients across ${NUM_WORKERS} workers...`);

  const workers = [];
  const filename = fileURLToPath(import.meta.url); // Get the current file path
  const directory = dirname(filename); // Get the directory name of the current file

  for (let i = 0; i < NUM_WORKERS; i++) {
    const workerStartId = i * CLIENTS_PER_WORKER;
    const worker = new Worker(new URL(directory + '/loadtest.js', import.meta.url)); // Use URL for worker thread

    worker.postMessage({ workerId: i, startId: workerStartId, numClients: CLIENTS_PER_WORKER });
    workers.push(worker);
  }

  // Handle messages from workers (optional, for logging)
  workers.forEach(worker => {
    worker.on('message', (message) => {
      console.log(message);
    });

    worker.on('error', (err) => {
      console.error('Worker error:', err);
    });

    worker.on('exit', (exitCode) => {
      if (exitCode !== 0) {
        console.error(`Worker stopped with exit code ${exitCode}`);
      }
    });
  });
} else {
  // Worker thread: Simulate WebSocket clients
  parentPort.on('message', (data) => {
    const { workerId, startId, numClients } = data;
    simulateWebSocketClient(workerId, startId, numClients);
  });
}
