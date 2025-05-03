import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. total number of students
export async function getTotalStudents() {
  return await prisma.student.count();
}

// 2. total courses per category
export async function getCourseCountByCategory() {
  return await prisma.course.groupBy({
    by: ['category'],
    _count: true,
  });
}

// 3. top 3 courses with enrollment count
export async function getTop3CoursesByEnrollment() {
  return await prisma.course.findMany({
    take: 3,
    orderBy: {
      classes: {
        _count: 'desc',
      },
    },
    include: {
      classes: {
        select: {
          enrollments: true,
        },
      },
    },
  });
}

// 4. how mnay failes (<2)
export async function getFailureCountPerCourse() {
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

// 5. how many pass (>= 2.0)
export async function getPassCountPerCourse() {
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
  });
}

// 6. class count for instructor
export async function getClassCountPerInstructor() {
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
export async function getStudentCountPerClass() {
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
export async function getTop5StudentsByGPA() {
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
}

// 9. courses with most failures
export async function getCoursesWithMostFailures() {
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
export async function getCourseStatusCounts() {
  return await prisma.course.groupBy({
    by: ['status'],
    _count: true,
  });
}