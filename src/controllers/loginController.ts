import { WebSocket, WebSocketServer } from 'ws';
import { Player, players } from '../models/player';
import { sendMessage } from '../types/helpers';

export const handleLogin = (ws: WebSocket, data: any, clientId: string) => {
  const { name, password } = JSON.parse(data);

  let player = Array.from(players.values()).find((p) => p.name === name);

  if (player) {
    if (!player.password === password) {
      sendMessage(ws, {
        type: 'reg',
        data: {
          name,
          index: clientId,
          error: true,
          errorText: 'Imvaild password',
        },
        id: 0,
      });
      return;
    }
    player.ws = ws;
    player.clientId = clientId;
  } else {
    player = new Player(name, password, clientId, ws);
    players.set(clientId, player);
  }

  sendMessage(ws, {
    type: 'reg',
    data: { name, index: clientId, error: false, errorText: '' },
    id: 0,
  });
};
