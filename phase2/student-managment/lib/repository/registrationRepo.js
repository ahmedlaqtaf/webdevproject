import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class RegistrationRepo {
  constructor() {
    this.prisma = new PrismaClient();
  }
  async findAll() {
    return this.prisma.registration.findMany();
  }

  async findById(id) {
    return this.prisma.registration.findUnique({ where: { id: Number(id) } });
  }

  async create(registrationData) {
    return this.prisma.registration.create({ data: registrationData });
  }

  async update(id, registrationData) {
    return this.prisma.registration.update({
      where: { id: Number(id) },
      data: registrationData,
    });
  }

  async delete(id) {
    return this.prisma.registration.delete({ where: { id: Number(id) } });
  }

  async getRegistrationsByStudentId(studentId) {
    return this.prisma.registration.findMany({
      where: { studentId: Number(studentId) },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });
  }
async  registerStudentToClass(studentId, classId) {
  const classData = await this.prisma.class.findUnique({
    where: { id: classId },
    include: {
      enrollments: true,
      course: {
        include: {
          prerequisites: true,
        },
      },
    }});



    console.log('classData:', classData); //debugging 

  if (!classData) throw new Error('Class not found');
  const alreadyEnrolled = await this.prisma.enrollment.findFirst({
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
    return await this.prisma.enrollment.create({
      data: {
        student: { connect: { id: studentId } },
        class: { connect: { id: classId } },
        status: 'pending',
      },
    });
  }
}

export default new RegistrationRepo();
