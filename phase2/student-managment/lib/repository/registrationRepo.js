import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function registerStudentToClass(studentId, classId) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      enrollments: true,
      course: {
        include: {
          prerequisites: true,
        },
      },
    },
  });


  console.log('classData:', classData); //debugging 

  if (!classData) throw new Error('Class not found');
  const alreadyEnrolled = await prisma.enrollment.findFirst({
    where: {
      studentId,
      classId,
    },
  });

  if (alreadyEnrolled) throw new Error('Student already registered');

  // check if class has space
  if (classData.enrollments.length >= classData.capacity) {
    throw new Error('Class is full');
  }

  // check if student completed prerequest
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { completedCourses: true },
  });

  const completed = student.completedCourses.map(c => c.courseId);
  const required = classData.course.prerequisites.map(p => p.id);

  const missing = required.filter(prereq => !completed.includes(prereq));
  if (missing.length > 0) {
    throw new Error('Missing prerequisites: ' + missing.join(', '));
  }

  // register the student
  return await prisma.enrollment.create({
    data: {
      student: { connect: { id: studentId } },
      class: { connect: { id: classId } },
      status: 'pending',
    },
  });
}