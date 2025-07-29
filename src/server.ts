// src/server.ts
import app from "./app";
import config from "./config";

const port = 8000;

app.listen(port, () => {
  console.log(`🚀 API server listening on http://localhost:${port}/api/v1`);
});
