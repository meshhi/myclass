const { Router } = require("express");
const classRouter = require("./classRouter.js");

const rootRouter = new Router();

rootRouter.use('/class', classRouter);

module.exports = rootRouter;