import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getStudentLearningPath(studentId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      class: {
        include: {
          course: true,
        },
      },
    },
  });

  const completed = [];
  const inProgress = [];
  const pending = [];

  for (const e of enrollments) {
    const course = e.class.course;
    if (e.grade !== null) {
      completed.push({ course, grade: e.grade });
    } else if (e.status === 'approved') {
      inProgress.push(course);
    } else {
      pending.push(course);
    }
  }

  return {
    completed,
    inProgress,
    pending,
  };
}