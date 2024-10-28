// import si from 'systeminformation';
import { WebSocket, WebSocketServer } from 'ws';
import { httpServer } from './http_server';
import { IncomingMessage } from 'http';
import { handleRequest } from './utils/requestHandler';
import 'dotenv/config';

const PORT: number = Number(process.env.PORT) || 8181;

httpServer.listen(PORT, () => {
  console.log(`HTTP server is running on PORT ${PORT}`);
});

const clients = new Map<string, WebSocket>();
let clientsIdCounter = 0;
const PORT_WS: number = Number(process.env.PORT_WS) || 3000;

const ws = new WebSocketServer({ port: PORT_WS });

ws.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const userId = (clientsIdCounter++).toString();
  clients.set(userId, ws);

  console.log(`User connected : ${userId}`);

  ws.on('message', (msg: string) => {
    // console.log(`Request data ${msg}`);
    // const { type, data, id } = JSON.parse(msg);
    // console.log(`type ${type}`);
    // console.log(`data ${data}`, typeof data);

    handleRequest(ws, msg, userId);
  });
  // setInterval(async () => {
  //   const cpuTemp = JSON.stringify(await si.currentLoad());
  //   ws.send(cpuTemp);
  // }, 100000);

  ws.on('close', () => {
    console.log(`User disconnected: ${userId}`);
    clients.delete(userId);
  });
});

console.log(`WS server start on port ${PORT_WS}`);
