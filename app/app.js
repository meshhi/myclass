const express = require("express");
const dotenv = require("dotenv");
const rootRouter = require("./routes/rootRouter.js");
const errorMiddleware = require("./middleware/errorMiddleware.js");
const pgClient = require("./db/db.js");
const swaggerJSdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require('cors');
dotenv.config();


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
    const app = express();
    const port = process.env.APP_PORT || 3999
    await pgClient.connect();

    app.use(cors());
    app.use(express.json());
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/', rootRouter);
    app.use(errorMiddleware);
    
    app.listen(port, () => console.log("Listening on port " + port));
  } catch (err) {
    console.log('Error occured while start app!')
    console.log(err)
  }
}

start();