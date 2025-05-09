import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class StatisticsRepo {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // 1. total number of students
  async getTotalStudents() {
    return await this.prisma.student.count();
  }

  // 2. total courses per category
  async getCourseCountByCategory() {
    return await this.prisma.course.groupBy({
      by: ['category'],
      _count: true,
    });
  }

  // 3. top 3 courses with enrollment count
  async getTop3CoursesByEnrollment() {
    const courses = await this.prisma.course.findMany({
      include: {
        classes: {
          include: {
            enrollments: true,
          },
        },
      },
    });


    const withCounts = courses.map(course => {
      let count = 0;
      course.classes.forEach(cls => {
        count += cls.enrollments.length;
      });
      return { id: course.id, name: course.name, enrollmentCount: count };
    });

    return withCounts
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 3);
  }

  // 4. how many failed (<2.0)
  async getFailureCountPerCourse() {
    const courses = await this.prisma.course.findMany({
      include: {
        classes: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    const result = courses.map(course => {
      let failCount = 0;
      course.classes.forEach(cls => {
        cls.enrollments.forEach(enroll => {
          if (enroll.grade !== null && enroll.grade < 2.0) {
            failCount++;
          }
        });
      });
      return {
        courseId: course.id,
        courseName: course.name,
        failCount,
      };
    });

    return result;
  }

  // 5. how many passed (>= 2.0)
  async getPassCountPerCourse() {
    const results = await this.prisma.course.findMany({
      select: {
        id: true,
        name: true,
        completedCourses: {
          where: {
            grade: {
              gte: 2.0,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    return results.map(course => ({
      courseId: course.id,
      courseName: course.name,
      passCount: course.completedCourses.length,
    }));
  }


  // 6. class count for instructor
  async getClassCountPerInstructor() {
    return await this.prisma.instructor.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { classes: true },
        },
      },
    });
  }

  // 7. how many students per class
  async getStudentCountPerClass() {
    return await this.prisma.class.findMany({
      select: {
        id: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  // 8. top 5 highest GPA students
  async getTop5StudentsByGPA() {
    const students = await this.prisma.student.findMany({
      include: {
        completedCourses: true,
      },
    });

    const withGPA = students.map((s) => {
      const grades = s.completedCourses
        .map((c) => c.grade)
        .filter((g) => g !== null);
      const avg =
        grades.length > 0 ?
          grades.reduce((a, b) => a + b, 0) / grades.length :
          0;
      return { id: s.id, name: s.name, gpa: avg };
    });

    return withGPA.sort((a, b) => b.gpa - a.gpa).slice(0, 5);
  }

  // 9. courses with most failures
  async getCoursesWithMostFailures() {
    const courses = await this.prisma.course.findMany({
      include: {
        classes: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    const withFailCounts = courses.map(course => {
      let failCount = 0;
      course.classes.forEach(cls => {
        cls.enrollments.forEach(enroll => {
          if (enroll.grade !== null && enroll.grade < 2.0) {
            failCount++;
          }
        });
      });
      return {
        id: course.id,
        name: course.name,
        failCount,
      };
    });

    return withFailCounts.sort((a, b) => b.failCount - a.failCount);
  }

  // 10. course status (active vs cancelled)
  async getCourseStatusCounts() {
    return await this.prisma.course.groupBy({
      by: ['status'],
      _count: true,
    });
  }
}

export default new StatisticsRepo();