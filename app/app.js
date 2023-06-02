const express = require("express");
const dotenv = require("dotenv");
const rootRouter = require("./routes/rootRouter.js");
const errorMiddleware = require("./middleware/errorMiddleware.js");
const pgClient = require("./db/db.js");
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