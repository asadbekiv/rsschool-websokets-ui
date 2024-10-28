import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';

const httpServer = http.createServer(function (
  req: IncomingMessage,
  res: ServerResponse
) {
  const __dirname: string = path.resolve(path.dirname(''));
  const file_path: string =
    __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(
    file_path,
    function (err: NodeJS.ErrnoException | null, data: Buffer) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    }
  );
});

export { httpServer };
