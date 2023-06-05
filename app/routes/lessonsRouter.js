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
    console.log(dbResponse.rows);
    res.json(response);
  } catch(e) {
    next(new ApiError(400, e.message));
  }

});

lessonsRouter.post('/lessons', async (req, res, next) => {
  try {
    const {teacherIds, title, days, firstDate, lessonsCount, lastDate} = req.body;
    let counter = 0;
    const generatedLessons = [];
    let lessonsCountCondition = false;

    // lessonsCount case
    if (lessonsCount && firstDate) {
      lessonsCountCondition = true;
      let currentDate = new Date(firstDate);
      console.log(Number(currentDate))
      let currentDay;

      while(counter < 300) {
        // проверка ограничения в год
        if (Number(currentDate) - Number(new Date(firstDate)) > 31536000000) {
          break;
        }
        currentDay = currentDate.getDay();
        console.log(currentDate.toUTCString())
        // создание занятия, если удовлетворяет условию по дням недели
        if (days.includes(currentDay)) {
          generatedLessons.push(currentDate.toUTCString());
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
        console.log(currentDate.toUTCString());
        // проверка условия по дням недели
        if (days.includes(currentDay)) {
          generatedLessons.push(currentDate.toUTCString());
          counter++;
        }
        // проверка на количество созданных занятий
        if (generatedLessons.length === lessonsCount) {
          break;
        }
        currentDate = new Date(Number(currentDate) + 86400000);
      }
    }

    console.log(generatedLessons);

    // const query = {
    //   // give the query a unique name
    //   name: `create-lessons-${Math.floor(Math.random() * 1000)}`,
    //   text: `
    //   DO $$
    //     DECLARE lesson_id_var integer = 0;
    //   BEGIN
    //     INSERT INTO lessons (date, title, status)
    //     VALUES ('2020-01-01', 'Custom', 1)
    //     RETURNING id into lesson_id_var;
        
    //     INSERT INTO lesson_teachers (lesson_id, teacher_id)
    //     VALUES (lesson_id_var, 1);
    //   END $$;`
    // };
    // const dbResponse = await pgClient.query(query)
    // const response = {
    //   text: dbResponse,
    // }

    response = {
      generatedLessonsCount: generatedLessons.length,
      generatedLessons,
    };

    res.json(response);
  } catch(err) {
    next(err);
  }
})

module.exports = lessonsRouter;