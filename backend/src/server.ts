import http from "http";
import { createApp } from "./app";
import { env } from "./lib/env";

const app = createApp();
const server = http.createServer(app);

const PORT = env.NODE_ENV === "production" ? env.PORT ?? 8080 : env.PORT ?? 4000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Gravitas API listening on port ${PORT}`);
});

