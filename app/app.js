const express = require("express");
const dotenv = require("dotenv");
const rootRouter = require("./routes/rootRouter.js");
const errorMiddleware = require("./middleware/errorMiddleware.js");
const pgClient = require("./db/db.js");
const swaggerJSdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require('cors');
dotenv.config();
const app = express();
const port = process.env.APP_PORT || 3999

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyClass API',
      version: '1.0.0',
    },
  },
  apis: ['./app/routes/*.js'], // files containing annotations as above
};
const swaggerSpec = swaggerJSdoc(swaggerOptions);

const start = async () => {
  try {
    await pgClient.connect();
    prom = new Promise((resolve, reject) => {
      app.use(cors());
      app.use(express.json());
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      app.use('/', rootRouter);
      app.use(errorMiddleware);
      
      app.listen(port, () => console.log("Listening on port " + port));
      resolve();
    });
  } catch (err) {
    console.log('Error occured while start app!')
    console.log(err)
  }
}

start();