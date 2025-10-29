const { io } = require('socket.io-client');

const API = process.env.API || 'http://localhost:5000';
const socket = io(API, { transports: ['websocket', 'polling'] });

let count = 0;
socket.on('connect', () => {
  console.log('connected', socket.id);
});

socket.on('metrics', (m) => {
  console.log('metrics event:', m);
  count++;
  if (count >= 3) {
    console.log('received 3 metrics, disconnecting');
    socket.disconnect();
    process.exit(0);
  }
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err.message);
  process.exit(1);
});
