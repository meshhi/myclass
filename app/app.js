import express from "express";
import dotenv from "dotenv";
import rootRouter from "./routes/rootRouter.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
dotenv.config();

const start = async () => {
  const app = express();
  const port = process.env.APP_PORT || 3999
  app.use(express.json());
  app.use('/api', rootRouter);
  app.use(errorMiddleware);

  app.listen(port, () => console.log("Listening on port " + port));
}

start();