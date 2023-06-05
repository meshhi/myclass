class RootHandler {
  dateToSQL(date) {
    let result = '';
    const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/g;
    if (!date) {
      return result;
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
      result += "status = " + Boolean(status);
    }
    return result;
  }

  teacherIdsToSQL(teacherIds) {
    let result = '';
    const regex = /^([0-9],?)+$/g;
    if (!teacherIds) {
      return result;
    } else {
      teacherIds.match(regex) ? result += `teacherId IN (${teacherIds})` : null
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
        const studentsCountList = studentsCount.split(',');
        if (studentsCountList.length === 1) {
          result += "studentsCount = " + studentsCountList[0];
        } else if (studentsCountList.length === 2) {
          result += `studentsCount >= ${studentsCountList[0]} and studentsCount <= ${studentsCountList[1]}`;
        } else {
          return result;
        }
      };
    }
    return result;
  }
}

module.exports = new RootHandler();