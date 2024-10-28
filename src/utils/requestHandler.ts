import { WebSocket, WebSocketServer } from 'ws';
import { handleLogin } from '../controllers/loginController';
import {
  handleCreateRoom,
  handleAddUserToRoom,
} from '../controllers/roomController';

import { Message } from '../types/types';
import { handleAddShips, handleAttack } from '../controllers/gameController';
import { sendError } from '../types/helpers';
import { handleSinglePlay } from '../controllers/botController';

export const handleRequest = (
  ws: WebSocket,
  message: string,
  clientId: string
) => {
  try {
    let msg: Message = JSON.parse(message);
    let { type, data } = msg;

    console.log(`DATA ${data}`);
    console.log(`TYPE ${type}`);
    console.log(`ID ${clientId}`);

    switch (type) {
      case 'reg':
        handleLogin(ws, data, clientId);
        break;

      case 'create_room':
        handleCreateRoom(ws, clientId);
        break;

      case 'add_user_to_room':
        handleAddUserToRoom(ws, data, clientId);
        break;

      case 'add_ships':
        handleAddShips(ws, data);
        break;

      case 'attack':
        handleAttack(ws, data);
        break;

      case 'single_play':
        handleSinglePlay(ws, clientId);
        break;

      default:
        sendError(ws, 'Unknown message type');
        console.error(`Unknown message type: ${type}`);
        break;
    }
  } catch (error) {
    console.error(error);
    sendError(ws, 'Invalid message format');
  }
};
