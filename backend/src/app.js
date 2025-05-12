import express from "express";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes.js";

import { PORT as configPort } from "./config/index.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/notes", noteRoutes);

app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res
    .status(404)
    .json({
      message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.`,
    });
});

app.use((err, req, res, next) => {
  logger.error("Zentraler Fehlerhandler:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({ message: "Interner Serverfehler." });
});

export default app;
export { configPort as PORT };
