import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class StudentRepo {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll() {
        return this.prisma.student.findMany();
    }

    async findById(id) {
        return this.prisma.student.findUnique({
            where: { id: Number(id)}
        })
    }

    async create(studentData) {
        return this.prisma.student.create({
            data: studentData
        })
    }

    async update(id, studentData) {
        return this.prisma.student.update({
            where: { id: Number(id)},
            data: studentData
        })
    }

    async delete(id) {
        return this.prisma.student.delete({
            where: { id: Number(id)}
        })
    }

    async getTotalStudents() {
        return this.prisma.student.count();
    }

    async getAverageStudentsGPA() {
        const result = await this.prisma.student.aggregate({
            _avg: {
                gpa: true
            }
        });
        return result._avg.gpa || 0;
    }

    async getAverageStudentsCoursesCount() {
        const result = await this.prisma.student.aggregate({
            _avg: {
                completedCourses: true
            }
        });
        return result._avg.completedCourses || 0;
    }
    
}

export default StudentRepo;
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