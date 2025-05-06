import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class AdminRepo {
    constructor() {
        this.prisma = new PrismaClient();
    }

  }
export async function getUnvalidatedClasses() {
  return await prisma.class.findMany({
    where: {
      isValidated: false,
    },
    include: {
      course: true,
      instructor: true,
      enrollments: true,
    },
  });
}

export async function validateClass(classId) {
  // mark class as validated
  await prisma.class.update({
    where: { id: classId },
    data: { isValidated: true },
  });

  await prisma.enrollment.updateMany({
    where: {
      classId,
      status: 'pending',
    },
    data: {
      status: 'approved',
    },
  });

  return { success: true };
}

export async function cancelClass(classId) {
  await prisma.class.update({
    where: { id: classId },
    data: { isValidated: false },
  });

  await prisma.enrollment.deleteMany({
    where: {
      classId,
      status: 'pending',
    },
  });

  return { success: true, cancelled: classId };
}