// establish a socket connection
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000", {autoConnect: false});

// We can change the socket later, this is just for now

export default socket;