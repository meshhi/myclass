const { Router } = require("express");
const pgClient = require("../db/db.js");
const ApiError = require("../utils/apiError.js");
const generateSqlRequestGetLessons = require("../utils/getLessonsHandler/generateSql.js");
const lessonsRouter = new Router();
const generateLessonsDate = require("../utils/createLessonsHandler/generateLessonsDates.js");
const writeLessonsToDb = require("../utils/createLessonsHandler/writeLessonsToDb.js");
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
 *           type: integer
 *        description: studentsCount.
 *      - in: query
 *        name: page
 *        schema:
 *           type: integer
 *        description: page.
 *      - in: query
 *        name: lessonsPerPage
 *        schema:
 *           type: integer
 *        description: lessonsPerPage.
 *    responses:
 *       200:
 *         description: Returns lesson list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error
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
    const validator = {
      date: true,
      status: true,
      teacherIds: true,
      studentsCount: true
    };
    const query = generateSqlRequestGetLessons(validator, date, status, teacherIds, studentsCount, page, lessonsPerPage);
    if (!validator.date) {
      throw new Error('Invalid date');
    }
    if (!validator.status) {
      throw new Error('Invalid status');
    }
    if (!validator.teacherIds) {
      throw new Error('Invalid teacherIds');
    }
    if (!validator.studentsCount) {
      throw new Error('Invalid studentsCount');
    }
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
        students: lesson.students_arr.map(student => {
          if (student.student_id) {
            return 
            ({
              id: student.student_id,
              name: student.student_name,
              visit: Boolean(student.student_visited)
            })
          }
        }),
        teachers: lesson.teachers_arr.map(teacher => {
          if (teacher.teacher_id) {
            return {
              id: teacher.teacher_id,
              name: teacher.teacher_name,
            }
          }
        }),
      }));
    }
    response.lessons.forEach(lesson => {
      if (!lesson.students[0]) {
        lesson.students = [];
      }
    });
    response.lessons.forEach(lesson => {
      if (!lesson.teachers[0]) {
        lesson.teachers = [];
      }
    });
    res.json(response.lessons);
  } catch(e) {
    next(new ApiError(400, e.message));
  }

});

/**
 * @openapi
 * /lessons:
 *   post:
 *    description: Create lessons.
 *    tags: [Lessons]
 *    parameters:
 *      - in: body
 *        name: teacherIds
 *        schema:
 *           type: array
 *        description: teacherIds
 *      - in: body
 *        name: title
 *        schema:
 *           type: string
 *        description: Lesson`s title
 *      - in: body
 *        name: days
 *        schema:
 *           type: array
 *        description: Days
 *      - in: body
 *        name: firstDate
 *        schema:
 *           type: string
 *        description: firstDate
 *      - in: body
 *        name: lessonsCount
 *        schema:
 *           type: integer
 *        description: lessonsCount
 *        example: 10
 *      - in: body
 *        name: lastDate
 *        schema:
 *           type: string
 *        description: lastDate.
 *    responses:
 *       201:
 *         description: Lessons successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
lessonsRouter.post('/lessons', async (req, res, next) => {
  try {
    const {teacherIds, title, days, firstDate, lessonsCount, lastDate} = req.body;
    const validate = (teacherIds, title, days, firstDate, lessonsCount, lastDate) => {
      if (!teacherIds) {
        throw new ApiError(400, 'Missing required parameter teacherIds');
      }
      if (!title) {
        throw new ApiError(400, 'Missing required parameter title');
      }
      if (!days) {
        throw new ApiError(400, 'Missing required parameter days');
      }      
      if (!firstDate) {
        throw new ApiError(400, 'Missing required parameter firstDate');
      }
      if (!days) {
        throw new ApiError(400, 'Missing required parameter days');
      }
      if (!(lessonsCount || lastDate)) {
        throw new ApiError(400, 'Missing required parameters lessonsCount or lastDate');
      }
      let regex = /^\[([0-9] ,?)+\]$/g;
      if (Array.isArray(teacherIds)) {
        teacherIds.forEach(id => {
          if (typeof id !== 'number') {
            throw new ApiError(400, 'Invalid teacherIds');
          };
        });
      } else {
        throw new ApiError(400, 'Invalid teacherIds');
      }

      if (Array.isArray(days)) {
        days.forEach(id => {
          if (typeof id !== 'number') {
            throw new ApiError(400, 'Invalid days');
          };
        });
      } else {
        throw new ApiError(400, 'Invalid days');
      }

      regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/g;
      if (!firstDate.match(regex)) {
        throw new ApiError(400, 'Invalid first date');
      }
      if (lastDate) {
        if (!lastDate.match(regex)) {
          throw new ApiError(400, 'Invalid last date');
        }
      }
      regex = /^([0-9])+$/
      if (lessonsCount) {
        if (!lessonsCount.match(regex)) {
          throw new ApiError(400, 'Invalid lessonsCount');
        }
      }
    }
    validate(teacherIds, title, days, firstDate, lessonsCount, lastDate);
    const generatedLessons = generateLessonsDate(lessonsCount, firstDate, lastDate, days);
    const createdLessonIds = await writeLessonsToDb(generatedLessons, teacherIds, title);
    
    return res.json(createdLessonIds);
  } catch(err) {
    next(new ApiError(400, err.message));
  }
})

module.exports = lessonsRouter;