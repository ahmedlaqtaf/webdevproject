'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getCoursesByCategory(category) {
  return await prisma.course.findMany({
    where: { category },
    include: { classes: true },
  });
}

export async function getTopCourses() {
  return await prisma.course.findMany({
    orderBy: {
      classes: {
        _count: 'desc'
      }
    },
    take: 3,
    include: { classes: true }
  });
}

export async function getTotalStudentsPerCourse() {
  return await prisma.course.findMany({
    select: {
      id: true,
      name: true,
      classes: {
        select: {
          enrollments: {
            select: {
              studentId: true
            }
          }
        }
      }
    }
  });
}