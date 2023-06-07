const SqlHandler = require("./SqlHandler.js");
const sqlQueries = require("../sqlBaseQueries.js");
const { v4 } = require("uuid");

module.exports = function(validator, date, status, teacherIds, studentsCount, page, lessonsPerPage) {
  const dateToSQL = SqlHandler.dateToSQL(date, validator);
  const statusToSQL = SqlHandler.statusToSQL(status, validator);
  const teacherIdsToSQL = SqlHandler.teacherIdsToSQL(teacherIds, validator);
  const studentsCountToSQL = SqlHandler.studentsCountToSQL(studentsCount, validator);
  const offset = page * lessonsPerPage - lessonsPerPage;
  let filterString = '';
  const filterArray = [];
  if (dateToSQL || statusToSQL || teacherIdsToSQL || studentsCountToSQL) {
    filterString = filterString += ' WHERE ';
    dateToSQL ? filterArray.push(dateToSQL) : null;
    statusToSQL ? filterArray.push(statusToSQL) : null;
    teacherIdsToSQL ? filterArray.push(teacherIdsToSQL) : null;
    studentsCountToSQL ? filterArray.push(studentsCountToSQL) : null;
  };
  if (filterArray.length) {
    filterString += filterArray.join(' AND ');
  };
  const query = {
    // give the query a unique name
    name: `get-lessons-${v4()}`,
    text: `SELECT * FROM (${sqlQueries.lessons}) as "sub"`
  };
  filterString.trim();
  if (filterString.length) {
    query.text += filterString;
  };
  query.text += `
    OFFSET ${offset}
    LIMIT ${lessonsPerPage}
  `;
  console.log(query.text);

  return query;
};