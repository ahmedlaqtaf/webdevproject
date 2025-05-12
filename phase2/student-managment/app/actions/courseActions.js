"use server";
import CourseRepo from "../../lib/repository/courseRepo";
import RegistrationRepo from "../../lib/repository/registrationRepo";
import StudentRepo from "../../lib/repository/studentRepo";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getCoursesByCategory(category) {
  return await prisma.course.findMany({
    where: { category },
    include: { classes: true },
  });
}

export async function getAllCourses() {
  return await prisma.course.findMany({
    include: { classes: true },
  });
}

export async function getTotalStudentsPerCourse() {
  const courses = await prisma.course.findMany({
    include: {
      classes: {
        include: {
          enrollments: true,
        },
      },
    },
  });

  return courses.map((course) => {
    const total = course.classes.reduce(
      (sum, cls) => sum + cls.enrollments.length,
      0
    );
    return {
      id: course.id,
      name: course.name,
      totalStudents: total,
    };
  });
}

export async function createCourse(courseData) {
  const courseRepository = new CourseRepo();
  try {
    const newCourse = await courseRepository.create(courseData);
    return { success: true, data: newCourse };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Registration actions
export async function createRegistration(registrationData) {
  try {
    const newRegistration = await RegistrationRepo.create(registrationData);
    return { success: true, data: newRegistration };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Student actions
export async function createStudent(studentData) {
  const studentRepository = new StudentRepo();
  try {
    const newStudent = await studentRepository.create(studentData);
    return { success: true, data: newStudent };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
