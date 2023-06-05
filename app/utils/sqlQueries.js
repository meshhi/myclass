const sqlQueries = {
  lessons: `select l.id as "lesson_id", 
  l."date"::varchar as "lesson_date",
  l.title as "lesson_title",
  l.status as "lesson_status",
  array_agg(distinct t.id) as "teachers_id",
  COUNT(distinct s.id) as "students_count",
  array_to_json(array_agg(distinct jsonb_build_object('teacher_name', t."name",'teacher_id',t.id))) as "teachers_arr",
  array_to_json(array_agg(distinct jsonb_build_object('student_name', s."name",'student_id',s.id,'student_visited',ls.visit::integer))) as "students_arr"
  from lessons l
  inner join lesson_teachers lt on (l.id = lt.lesson_id)
  inner join teachers t on (lt.teacher_id = t.id)
  inner join lesson_students ls on (l.id = ls.lesson_id)
  inner join students s on (ls.student_id = s.id)
  group by l.id, l."date", l.title, l.status`
}

module.exports = sqlQueries;