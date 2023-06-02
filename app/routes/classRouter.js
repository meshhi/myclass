const { Router } = require("express");
const pgClient = require("../db/db.js");
const ApiError = require("../utils/apiError.js");

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

module.exports = classRouter;