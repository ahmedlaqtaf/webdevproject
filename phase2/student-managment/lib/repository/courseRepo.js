import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getCoursesByCategory(category) {
  return await prisma.course.findMany({
    where: {
      category,
    },
    include: {
      classes: true,
    },
  });
}

export async function searchCoursesByName(name) {
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

export async function getCourseById(id) {
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


export async function getAllCourses() {
  return await prisma.course.findMany({
    include: {
      classes: true,
    },
  });
}