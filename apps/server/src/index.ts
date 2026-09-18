import { createServer } from "node:http";
import { createHttpApp } from "./http.js";
import { attachWebSocketServer } from "./websocket.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = createHttpApp();
const httpServer = createServer(app);

attachWebSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Jaipur server listening on http://localhost:${PORT}`);
});
