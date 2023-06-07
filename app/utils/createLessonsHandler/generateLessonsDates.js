module.exports = function(lessonsCount, firstDate, lastDate, days) {
  const generatedLessons = [];
  let counter = 0;
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

  return generatedLessons;
}