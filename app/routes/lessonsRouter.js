const { Router } = require("express");
const pgClient = require("../db/db.js");
const ApiError = require("../utils/apiError.js");
const rootHandler = require("../utils/lessonsHandler/rootHandler.js");

const lessonsRouter = new Router();

/**
 * @openapi
 * /:
 *   get:
 *    description: Get lessons list.
 *    tags: [Lessons]
 *    parameters:
 *      - in: query
 *        name: date
 *        schema:
 *           type: string
 *        description: Date.
 *      - in: query
 *        name: status
 *        schema:
 *           type: string
 *        description: status.
 *      - in: query
 *        name: teacherIds
 *        schema:
 *           type: string
 *        description: teacherIds.
 *      - in: query
 *        name: studentsCount
 *        schema:
 *           type: string
 *        description: studentsCount.
 *      - in: query
 *        name: page
 *        schema:
 *           type: string
 *        description: page.
 *      - in: query
 *        name: lessonsPerPage
 *        schema:
 *           type: string
 *        description: lessonsPerPage.
 *    responses:
 *       200:
 *         description: Returns lesson list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Lessons not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/ApiError"
 */
lessonsRouter.get('/', async (req, res, next) => {
  const {date, status, teacherIds, studentsCount, page, lessonsPerPage} = req.query;
  const dateToSQL = rootHandler.dateToSQL(date);
  console.log(dateToSQL);
  const statusToSQL = rootHandler.statusToSQL(status);
  console.log(statusToSQL);
  const teacherIdsToSQL = rootHandler.teacherIdsToSQL(teacherIds);
  console.log(teacherIdsToSQL);
  const studentsCountToSQL = rootHandler.studentsCountToSQL(studentsCount);
  console.log(studentsCountToSQL);
  const offset = page * lessonsPerPage - lessonsPerPage;

  const query = {
    // give the query a unique name
    name: 'get-lessons',
    text: 'SELECT * FROM lessons',
  }

  const dbResponse = await pgClient.query(query)
  res.send('OKKK')
});

lessonsRouter.post('/2', async (req, res, next) => {
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

module.exports = lessonsRouter;