// src/socket.js
import { io } from 'socket.io-client';

// Read from environment variable, fallback to localhost in dev
const API_URL = 'https://simple-chat-ff9i.onrender.com'|| 'http://localhost:5000/api/auth';

const socket = io(API_URL, {
  transports: ['websocket'],
});

export default socket;
