import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class CourseRepo {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll() {
        return this.prisma.course.findMany();
    }

    async findById(id) {
        return this.prisma.course.findUnique({
            where: { id: Number(id) }
        })
    }

    async create(courseData) {
        return this.prisma.course.create({
            data: courseData
        })
    }

    async update(id, courseData) {
        return this.prisma.course.update({
            where: { id: Number(id) },
            data: courseData
        })
    }

    async delete(id) {
        return this.prisma.course.delete({
            where: { id: Number(id) }
        })
    }




 async  getCoursesByCategory(category) {
  return await prisma.course.findMany({
    where: {
      category,
    },
    include: {
      classes: true,
    },
  });
}

async  searchCoursesByName(name) {
  return await prisma.course.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },
    include: {
      classes: true,
    },
  });
}

async  getCourseById(id) {
  return await prisma.course.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          instructor: true,
        },
      },
    },
  });
}


async getAllCourses() {
  return await prisma.course.findMany({
    include: {
      classes: true,
    },
  });
}

async getCompletedCourses() {
  return await prisma.course.findMany({
    include: {
      course: true,
    },
  });
}
}
export default CourseRepo;