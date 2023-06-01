import { Router } from "express";
import classRouter from "./classRouter.js";

const rootRouter = new Router();

rootRouter.use('/class', classRouter);

export default rootRouter;