import express from "express";
import dotenv from "dotenv";
import rootRouter from "./routes/rootRouter.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import pgClient from "./db/db.js";
dotenv.config();

const start = async () => {
  try {
    const app = express();
    const port = process.env.APP_PORT || 3999
  
    await pgClient.connect();
    
    app.use(express.json());
    app.use('/api', rootRouter);
    app.use(errorMiddleware);
  
    app.listen(port, () => console.log("Listening on port " + port));
  } catch (err) {
    console.log('Error occured while start app!')
    console.log(err)
  }
}

start();