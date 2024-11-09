import uWS, { SHARED_COMPRESSOR } from 'uWebSockets.js';
const port = 9001;

var users = 0;
var clients = {}; // Store clients by their IDs

uWS.App().ws('/*', {
  idleTimeout: 0,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: SHARED_COMPRESSOR,

  open: ws => {
    users += 1;
    ws.id = users;
    clients[ws.id] = { group: null }; // Initialize a client entry with no group
    console.log("opened #" + ws.id);
  },

  close: ws => {
    // Clean up when a client disconnects
    delete clients[ws.id];
    users -= 1;
    console.log("closed #" + ws.id);
  },

  message: (ws, message, isBinary) => {
    // Handle incoming messages (assume JSON format)
    console.log(isBinary, message);
    if (isBinary) {
      // If the message is binary, convert it to a string
      const textMessage = Buffer.from(message).toString('utf-8'); // Convert binary to UTF-8 string

      try {
        const msg = JSON.parse(textMessage);

        if (msg.action === 'join_group') {
          // Extract and store the group ID when the client joins a group
          clients[ws.id].group = msg.group;
          console.log(`Client #${ws.id} joined group: ${msg.group}`);
        }

        // Handle other actions here as needed
      } catch (err) {
        // console.error('Error parsing binary message:', err);
      }
    } else {
      // Handle text messages (assume JSON format)
      try {
        const msg = JSON.parse(message);

        if (msg.action === 'join_group') {
          // Extract and store the group ID when the client joins a group
          clients[ws.id].group = msg.group;
          console.log(`Client #${ws.id} joined group: ${msg.group}`);
        }

        // Handle other actions here as needed
      } catch (err) {
        // console.error('Error parsing message:', err);
      }
    }
  }
}).get('/*', (res, req) => {
  // Handle HTTP requests (example)
  res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');
}).listen(9001, (listenSocket) => {
  if (listenSocket) {
    console.log('Listening to port 9001');
  }
});