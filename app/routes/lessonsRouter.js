const { Router } = require("express");
const pgClient = require("../db/db.js");
const ApiError = require("../utils/apiError.js");
const generateSqlRequest = require("../utils/lessonsHandler/generateSql.js");
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
    const query = generateSqlRequest(date, status, teacherIds, studentsCount, page, lessonsPerPage);
    console.log(query.text);
    const dbResponse = await pgClient.query(query)
    const response = {};
    if (dbResponse.rows?.length) {
      dbResponse.rows.forEach(lesson => {
        const visits = lesson.students_arr.reduce((acc, student) => {
          if(student.student_visited) {
            acc++;
          }
          return acc;
        }, 0);
        lesson.visitCount = visits;
        delete lesson.teachers_id;
        delete lesson.students_count;
      });
      response.lessons = dbResponse.rows.map(lesson => ({
        id: lesson.lesson_id,
        date: lesson.lesson_date,
        title: lesson.lesson_title,
        status: lesson.lesson_status,
        visitCount: lesson.visitCount,
        students: lesson.students_arr.map(student => ({
          id: student.student_id,
          name: student.student_name,
          visit: Boolean(student.student_visited)
        })),
        teachers: lesson.teachers_arr.map(teacher => ({
          id: teacher.teacher_id,
          name: teacher.teacher_name,
        })),
      }));
    }
    console.log(dbResponse.rows);
    res.json(response);
  } catch(e) {
    res.status(400);
    res.json({
      error: e.message
    });
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