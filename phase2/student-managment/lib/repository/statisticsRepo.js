import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class StatisticsRepo {
  constructor() {
    this.prisma = new PrismaClient();
  }

// 1. total number of students
 async  getTotalStudents() {
  return await prisma.student.count();
}

// 2. total courses per category
 async  getCourseCountByCategory() {
  return await prisma.course.groupBy({
    by: ['category'],
    _count: true,
  });
}

// 3. top 3 courses with enrollment count
 async  getTop3CoursesByEnrollment() {
  return await prisma.course.findMany({
    take: 3,
    orderBy: {
      classes: {
        _count: 'desc',
      },
    },
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

  return withCounts.sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 3);
}

// 4. how mnay failes (<2)
 async  getFailureCountPerCourse() {
  return await prisma.course.findMany({
    include: {
      classes: {
        include: {
          enrollments: {
            where: {
              grade: { lt: 2.0 },
            },
          },
        },
      },
    },
    select: {
      courseId: true
    }
  });

  const courseCounts = {};

  for (const c of completed) {
    courseCounts[c.courseId] = (courseCounts[c.courseId] || 0) + 1;
  }

  const allCourses = await prisma.course.findMany({
    select: {
      id: true,
      name: true
    }
  });

  return allCourses.map(course => ({
    courseId: course.id,
    courseName: course.name,
    failCount: courseCounts[course.id] || 0
  }));
}

// 5. how many pass (>= 2.0)
 async  getPassCountPerCourse() {
  return await prisma.course.findMany({
    include: {
      classes: {
        include: {
          enrollments: {
            where: {
              grade: { gte: 2.0 },
            },
          },
        },
      },
    },
    select: {
      courseId: true
    }
  });

  const courseCounts = {};

  for (const c of completed) {
    courseCounts[c.courseId] = (courseCounts[c.courseId] || 0) + 1;
  }

  const allCourses = await prisma.course.findMany({
    select: {
      id: true,
      name: true
    }
  });

  return allCourses.map(course => ({
    courseId: course.id,
    courseName: course.name,
    passCount: courseCounts[course.id] || 0
  }));
}



// 6. class count for instructor
 async  getClassCountPerInstructor() {
  return await prisma.instructor.findMany({
    select: {
      name: true,
      _count: {
        select: { classes: true },
      },
    },
  });
}

// 7.how many students per class
 async  getStudentCountPerClass() {
  return await prisma.class.findMany({
    select: {
      id: true,
      _count: {
        select: { enrollments: true },
      },
    },
  });
}

// 8. top 5 highest GPA students
 async  getTop5StudentsByGPA() {
  return await prisma.student.findMany({
    take: 5,
    orderBy: {
      completedCourses: {
        _avg: {
          grade: 'desc',
        },
      },
    },
    include: {
      completedCourses: true,
    },
  });

  const withGPA = students.map((s) => {
    const grades = s.completedCourses.map((c) => c.grade).filter((g) => g !== null);
    const avg = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
    return { id: s.id, name: s.name, gpa: avg };
  });

  return withGPA.sort((a, b) => b.gpa - a.gpa).slice(0, 5);
}


// 9. courses with most failures
 async  getCoursesWithMostFailures() {
  return await prisma.course.findMany({
    include: {
      classes: {
        include: {
          enrollments: {
            where: {
              grade: { lt: 2.0 },
            },
          },
        },
      },
    },
  });
}

// 10. course status (ative vs cancelled)
 async  getCourseStatusCounts() {
  return await prisma.course.groupBy({
    by: ['status'],
    _count: true,
  });
}
}

export default new StatisticsRepo();
