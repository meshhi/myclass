const { Router } = require("express");
const pgClient = require("../db/db.js");
const ApiError = require("../utils/apiError.js");
const rootHandler = require("../utils/lessonsHandler/rootHandler.js");
const sqlQueries = require("../utils/sqlQueries.js");

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
  try {
    const {date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5} = req.query;
    const dateToSQL = rootHandler.dateToSQL(date);
    console.log(dateToSQL);
    const statusToSQL = rootHandler.statusToSQL(status);
    console.log(statusToSQL);
    const teacherIdsToSQL = rootHandler.teacherIdsToSQL(teacherIds);
    console.log(teacherIdsToSQL);
    const studentsCountToSQL = rootHandler.studentsCountToSQL(studentsCount);
    console.log(studentsCountToSQL);
    const offset = page * lessonsPerPage - lessonsPerPage;
    console.log(teacherIdsToSQL);
    const query = {
      // give the query a unique name
      name: 'get-lessons',
      text: `SELECT * FROM (${sqlQueries.lessons}) as "sub"
      WHERE 
      ${dateToSQL}
      AND 
      ${statusToSQL}
      AND
      ${studentsCountToSQL}
      AND
      (3 = any("teachers_id")
      OR
      4 = any("teachers_id"))
      OFFSET ${offset}
      LIMIT ${lessonsPerPage}
      `,
    }
    console.log(query.text);
    // 
    const dbResponse = await pgClient.query(query)
    console.log(dbResponse.rows);
    res.send('OKKK')
  } catch(e) {
    res.send(e.message)
  }

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