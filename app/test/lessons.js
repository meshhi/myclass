const request = require('supertest')('http://127.0.0.1:3999');
const expect = require('chai').expect;
const assert = require('chai').assert;

describe("Get lessons list", () => {
  describe("Parameters check", () => {
    it("default lessons per page count not more than 5", async () => {
      const response = await request.get('/');
      assert(response.body.length <= 5, `Returned ${response.body.length} messages`)
    })

    it("10th page is empty on test data", async () => {
      const response = await request
        .get('/')
        .query({page: 10});
      assert(response.body.length === 0, `Returned ${response.body.length} messages`)
    })
  });

  describe("Date check", () => {
    it("lessons by 1 date", async () => {
      const testDate = '2019-05-15';
      const response = await request
        .get('/')
        .query({date: testDate});
        let result = true;
        response.body.forEach((lesson) => {
          if (lesson.date !== testDate) {
            result = false;
          }
        })
      assert(result === true, `Date of lessons not matched`)
    });

    it("lessons by 2 dates", async () => {
      let testDateStart = '2019-05-15';
      let testDateEnd = '2019-09-01';
      const testDate = `${testDateStart},${testDateEnd}`;
      const response = await request
        .get('/')
        .query({date: testDate});
        let result = true;
        response.body.forEach((lesson) => {
          if (!((new Date(lesson.date) >= new Date(testDateStart)) && (new Date(lesson.date) <= new Date(testDateEnd)))) {
            result = false;
          }
        })
      assert(result === true, `Date of lessons not matched`)
    });

    it("invalid date", async () => {
      const testDate = `sometxt`;
      const response = await request
        .get('/')
        .query({date: testDate});
      assert((response.status === 400) && (response.body.text === "Invalid date"), `Invalid date not processed`)
    });
  });

  describe("Status check", () => {
    it("status 1", async () => {
      const testStatus = 1;
      const response = await request
        .get('/')
        .query({status: testStatus});
        let result = true;
        response.body.forEach((lesson) => {
          if (lesson.status !== testStatus) {
            result = false;
          }
        })
      assert(result === true, `Status of lessons not matched`)
    });

    it("status 0", async () => {
      const testStatus = 0;
      const response = await request
        .get('/')
        .query({status: testStatus});
        let result = true;
        response.body.forEach((lesson) => {
          if (lesson.status !== testStatus) {
            result = false;
          }
        })
      assert(result === true, `Status of lessons not matched`)
    });

    it("invalid status", async () => {
      const testStatus = `sometxt`;
      const response = await request
        .get('/')
        .query({status: testStatus});
      assert((response.status === 400) && (response.body.text === "Invalid status"), `Invalid status not processed`)
    });
  });

  describe("TeacherIds check", () => {
    it("correct TeacherIds", async () => {
      const testTeacherIds = '1,2,3';
      const testTeacherIdsArray = testTeacherIds.split(',');
      const response = await request
        .get('/')
        .query({teacherIds: testTeacherIds});
        let result = true;
        response.body.forEach((lesson) => {
          let resultTeacher = false;
          lesson.teachers.forEach((teacher) => {
            if (testTeacherIdsArray.includes(String(teacher.id))) {
              resultTeacher = true;
            }
          });
          if (resultTeacher === false) {
            result = false;
          }
        })
      assert(result === true, `Teachers of lessons not valid!`)
    });

    it("invalid TeacherIds", async () => {
      const testTeacherIds = `sometxt`;
      const response = await request
        .get('/')
        .query({teacherIds: testTeacherIds});
      assert((response.status === 400) && (response.body.text === "Invalid teacherIds"), `Invalid teacherIds not processed`)
    });
  });

  describe("students check", () => {
    it("correct students count by 1 number", async () => {
      const testStudentsCount = '1';
      const response = await request
        .get('/')
        .query({studentsCount: testStudentsCount});
      let result = true;
      response.body.forEach((lesson) => {
        if (lesson.students.length !== Number(testStudentsCount)) {
          result = false;
        };
      })
      assert(result === true, `students recorded count not valid!`)
    });

    it("correct students count by 2 numbers", async () => {
      const testStudentsCountMin = 1;
      const testStudentsCountMax = 5;
      const testStudentsCount = `${testStudentsCountMin},${testStudentsCountMax}`;
      const response = await request
        .get('/')
        .query({studentsCount: testStudentsCount});
      let result = true;
      response.body.forEach((lesson) => {
        if ((lesson.students.length < Number(testStudentsCountMin)) || (lesson.students.length > Number(testStudentsCountMax))) {
          result = false;
        };
      })
      assert(result === true, `students recorded count not valid!`)
    });

    it("invalid students count", async () => {
      const testStudentsCount = `sometxt`;
      const response = await request
        .get('/')
        .query({studentsCount: testStudentsCount});
      assert((response.status === 400) && (response.body.text === "Invalid studentsCount"), `Invalid students count not processed`)
    });
  });
});


describe("Create lessons", () => {
  describe("Check created lessons count", () => {
    it("create 1 correct lesson", async () => {
      const lessonsCount = 9;
      const payload = {
        teacherIds: [1, 2],
        title: "Blue Ocean",
        days: [0, 1, 3, 6],
        firstDate: '2019-09-10',
        lessonsCount: lessonsCount,
        lastDate: '2019-12-31'
      }
      const response = await request
        .post('/lessons')
        .send(payload);
      assert(response.body.length === lessonsCount, `Returned ${response.body.length} created lessons`)
    })

    it("should create lessons only for year (count~50)", async () => {
      const lessonsCount = 700;
      const payload = {
        teacherIds: [1, 2],
        title: "Blue Ocean",
        days: [0],
        firstDate: '2019-09-10',
        lessonsCount: lessonsCount,
        lastDate: '2022-12-31'
      }
      const response = await request
        .post('/lessons')
        .send(payload);
      assert(((response.body.length > 50) && (response.body.length < 60)), `created ${response.body.length}lessons instead ~50`)
    })

    it("should create no more 300 lessons", async () => {
      const lessonsCount = 700;
      const payload = {
        teacherIds: [1, 2],
        title: "Blue Ocean",
        days: [0, 1, 2, 3, 4, 5, 6, 7],
        firstDate: '2019-09-10',
        lessonsCount: lessonsCount,
        lastDate: '2022-12-31'
      }
      const response = await request
        .post('/lessons')
        .send(payload);
      assert(response.body.length === 300, `created ${response.body.length}lessons instead 300`)
    })
  });

});