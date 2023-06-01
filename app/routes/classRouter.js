import { Router } from "express";
import pgClient from "../db/db.js";
import ApiError from "../utils/apiError.js";

const classRouter = new Router();

classRouter.post('/', async (req, res, next) => {
  try {
    const {id} = req.body;
    
    const response = {
      text: "success",
    }
    if (!id) {
      throw new ApiError(404, 'custom err');
    }
    res.json(response);
  } catch(err) {
    next(err);
  }
})

export default classRouter;