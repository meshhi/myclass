const { Router } = require("express");
const pgClient = require("../db/db.js");
const ApiError = require("../utils/apiError.js");
const generateSqlRequestGetLessons = require("../utils/getLessonsHandler/generateSql.js");
const generateSqlRequestCreateLessons = require("../utils/createLessonsHandler/generateSql.js");
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
    const query = generateSqlRequestGetLessons(date, status, teacherIds, studentsCount, page, lessonsPerPage);
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
    const {teacherIds, title, days, firstDate = new Date(), lessonsCount = 300, lastDate = new Date(Number(new Date()) + 86400000)} = req.body;
    if (!teacherIds) {
      throw new ApiError(400, 'Missing required parameter teacherIds');
    }
    if (!title) {
      throw new ApiError(400, 'Missing required parameter title');
    }
    if (!days) {
      throw new ApiError(400, 'Missing required parameter days');
    }
    let counter = 0;
    const generatedLessons = [];
    let lessonsCountCondition = false;

    // lessonsCount case
    if (lessonsCount && firstDate) {
      lessonsCountCondition = true;
      let currentDate = new Date(firstDate);
      let currentDay;

      while(counter < 300) {
        // проверка ограничения в год
        if (Number(currentDate) - Number(new Date(firstDate)) > 31536000000) {
          break;
        }
        currentDay = currentDate.getDay();
        // создание занятия, если удовлетворяет условию по дням недели
        if (days.includes(currentDay)) {
          generatedLessons.push(currentDate.toDateString());
          counter++;
        }
        // проверка условия по количеству создаваемых занятий
        if (generatedLessons.length === lessonsCount) {
          break;
        }
        currentDate = new Date(Number(currentDate) + 86400000);
      }
    }

    // first-endDate case
    if (firstDate && lastDate && !lessonsCountCondition) {
      let currentDate = new Date(firstDate);
      let lastDateTemp = new Date(lastDate);
      let currentDay;

      while(counter < 300) {
        // проверка выхода за предельную дату
        if (Number(currentDate) > Number(lastDateTemp)) {
          break;
        }
        // проверка выхода за границу года
        if (Number(currentDate) - Number(new Date(firstDate)) > 31536000000) {
          break;
        }
        currentDay = currentDate.getDay();
        // проверка условия по дням недели
        if (days.includes(currentDay)) {
          generatedLessons.push(currentDate.toDateString());
          counter++;
        }
        // проверка на количество созданных занятий
        if (generatedLessons.length === lessonsCount) {
          break;
        }
        currentDate = new Date(Number(currentDate) + 86400000);
      }
    }
    counter = 0;
    let dbResponse;
    const createdLessonIds = [];
    for (let lessonDate of generatedLessons) {
      if (!teacherIds.length) {
        throw new ApiError(500, 'No teacherIds specified');
      }
      let teacherIdsToSql = 'VALUES ';
      for (let teacherId of teacherIds) {
        teacherIdsToSql += `(lesson_id_var, ${teacherId}),`
      }
      teacherIdsToSql = teacherIdsToSql.slice(0, teacherIdsToSql.length - 1);
      let query = {
        // give the query a unique name
        name: `save-procedure-${counter++}`,
        text: `
        CREATE OR REPLACE FUNCTION create_lessons() 
          RETURNS integer 
          LANGUAGE plpgsql
        AS $$
          DECLARE lesson_id_var integer = 0;
          BEGIN
            INSERT INTO lessons (date, title, status)
            VALUES ('${lessonDate}', '${title}', 0)
            RETURNING id into lesson_id_var;
            
            INSERT INTO lesson_teachers (lesson_id, teacher_id)
            ${teacherIdsToSql};

            RETURN lesson_id_var;
          END 
        $$ ;
        `
      };
      const savedProcedure = await pgClient.query(query);
      query = {
        name: `call-procedure-${counter}`,
        text: `SELECT create_lessons() as "lesson_id";`,
      }
      dbResponse = await pgClient.query(query);
      createdLessonIds.push(dbResponse.rows[0].lesson_id);
    }

    return res.json(createdLessonIds);
  } catch(err) {
    next(new ApiError(400, err.message));
  }
})

module.exports = lessonsRouter;