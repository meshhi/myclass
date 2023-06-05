class SqlHandler {
  dateToSQL(date) {
    let result = '';
    const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/g;
    if (!date) {
      return result;
    }
    if (date[date.length - 1] === ',') {
      date = date.slice(0, date.length - 1);
    }
    if (date.includes(',')) {
      const dateStart = date.split(',')[0];
      const dateEnd = date.split(',')[1];
      if (dateStart.match(regex) && dateEnd.match(regex)){
        result += "lesson_date BETWEEN '" + dateStart + "' AND '" + dateEnd + "'";
      }
    } else {
      if (date.match(regex)) {
        result += "lesson_date = '" + date + "'";
      }
    }
    return result;
  }

  statusToSQL(status) {
    let result = '';
    if (!status) {
      return result;
    } else {
      result += "lesson_status = " + status;
    }
    return result;
  }

  teacherIdsToSQL(teacherIds) {
    let result = '';
    const regex = /^([0-9],?)+$/g;
    if (!teacherIds) {
      return result;
    } else {
      if (teacherIds.match(regex)) {
        if (teacherIds[teacherIds.length - 1] === ',') {
          teacherIds = teacherIds.slice(0, teacherIds.length - 1);
        }
        result += '(';
        const teacherIdsToArray = teacherIds.split(',');
        teacherIdsToArray.forEach((id, index) => {
          result += `${id} = any("teachers_id")`
          if (index !== teacherIdsToArray.length - 1) {
            result += " OR ";
          } else {
            result += ")";
          }
        });
      }
    }
    return result;
  }

  studentsCountToSQL(studentsCount) {
    let result = '';
    const regex = /^([0-9],?){1,2}$/g;
    if (!studentsCount) {
      return result;
    } else {
      if (studentsCount.match(regex)) {
        if (studentsCount[studentsCount.length - 1] === ',') {
          studentsCount = studentsCount.slice(0, studentsCount.length - 1);
        }
        const studentsCountList = studentsCount.split(',');
        if (studentsCountList.length === 1) {
          result += "students_count = " + studentsCountList[0];
        } else if (studentsCountList.length === 2) {
          result += `students_count >= ${studentsCountList[0]} and students_count <= ${studentsCountList[1]}`;
        } else {
          return result;
        }
      };
    }
    return result;
  }
}

module.exports = new SqlHandler();