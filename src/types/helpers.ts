
import { Game } from '../models/game';
import { players } from '../models/player';
import { Message, ShipData } from './types';
import { WebSocket } from 'ws';

export const sendMessage = (ws: WebSocket, message: Message) => {
  ws.send(JSON.stringify({ ...message, data: JSON.stringify(message.data) }));
};

export const sendError = (ws: WebSocket, errorText: string) => {
  sendMessage(ws, { type: 'error', data: { errorText }, id: 0 });
};

export const broadcastMessage = (message: Message) => {
  for (const player of players.values()) {
    console.log('broadcastMessage', message, player.name);

    player.ws?.send(
      JSON.stringify({ ...message, data: JSON.stringify(message.data) })
    );
  }
};

export const broadcastGameMessage = (game: Game, message: Message) => {
  for (const clientId in game.players) {
    const player = players.get(clientId);
    if (player) {
      console.log('broadcastGameMessage', message, player.name);
      player.ws?.send(
        JSON.stringify({ ...message, data: JSON.stringify(message.data) })
      );
    }
  }
};

export const isShipSunk = (
  ship: ShipData,
  shotsReceived: { x: number; y: number }[]
): boolean => {
  const shipCells = getShipCells(ship);
  return shipCells.every((cell) => {
    shotsReceived.some((shot) => shot.x === cell.x && shot.y === cell.y);
  });
};

export const getShipCells = (ship: ShipData): { x: number; y: number }[] => {
  const cells = [];

  for (let i = 0; i < ship.length; i++) {
    const x = ship.direction ? ship.position.x : ship.position.x + 1;
    const y = ship.direction ? ship.position.y : ship.position.y + 1;

    cells.push({ x, y });
  }

  return cells;
};

export const shipContainsCoordinate = (
  ship: ShipData,
  x: number,
  y: number
): boolean => {
  const cells = getShipCells(ship);
  return cells.some((cell) => cell.x === x && cell.y === y);
};

export const isPlayerDefeated = (playerData: any): boolean => {
  for (const ship of playerData.ships) {
    if (!isShipSunk(ship, playerData.shotsReceived)) {
      return false;
    }
  }
  return true;
};

export const updatePlayerWin = (clientId: string) => {
  const player = players.get(clientId);

  if (player) {
    player.wins += 1;
    sendUpdateWinners();
  }
};

export const sendUpdateWinners = () => {
  const winnerList = Array.from(players.values())
    .filter((p) => !p.name.startsWith('Bot'))
    .sort((a, b) => b.wins - a.wins)
    .map((p) => ({ name: p.name, wins: p.wins }));

  const message: Message = {
    type: 'update_winners',
    data: winnerList,
    id: 0,
  };

  broadcastMessage(message);
};

const getSurroundingCells = (x: number, y: number) => {
  return [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
};

export const getSurroundingCellsForShip = (ship: ShipData) => {
  const surroundingCells = [];
  for (const coord of getShipCells(ship)) {
    surroundingCells.push(...getSurroundingCells(coord.x, coord.y));
  }
  return surroundingCells;
};

export function getRandomCoordinate() {
  return Math.floor(Math.random() * 10);
}
