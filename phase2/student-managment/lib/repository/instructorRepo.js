import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function submitGrade(studentId, classId, grade) {
  return await prisma.enrollment.update({
    where: {
      studentId_classId: {
        studentId,
        classId,
      },
    },
    data: {
      grade,
    },
  });
}