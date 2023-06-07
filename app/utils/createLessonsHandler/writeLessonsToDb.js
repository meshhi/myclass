const pgClient = require('../../db/db.js');
const { v4 } = require("uuid");

module.exports = async function(generatedLessons, teacherIds, title) {
  try {
    let counter = 0;
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
        name: `save-procedure-${v4()}`,
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
        name: `call-procedure-${v4()}`,
        text: `SELECT create_lessons() as "lesson_id";`,
      }
      dbResponse = await pgClient.query(query);
      createdLessonIds.push(dbResponse.rows[0].lesson_id);
    }
  
    return createdLessonIds;
  } catch(err) {
    throw new Error(err.message);
  }
}