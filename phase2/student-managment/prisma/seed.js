import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  // load JSON data
  const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8')).users;
  const courses = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
  const instructors = JSON.parse(fs.readFileSync('./data/instructors.json', 'utf8'));
  const students = JSON.parse(fs.readFileSync('./data/students.json', 'utf8')).students;

  for (const inst of instructors.instructors) {
    await prisma.instructor.upsert({
      where: { id: inst.id },
      update: {},
      create: {
        id: inst.id,
        name: inst.name,
      },
    });
  }


  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {},
      create: {
        id: course.id,
        name: course.name,
        category: course.category,
        description: course.description,
        open_for_registration: course.open_for_registration,
        status: course.status,
        classes: {
          create: course.classes.map(cls => ({
            id: cls.id,
            schedule: cls.schedule,
            capacity: cls.capacity,
            instructor: {
              connect: { id: cls.instructor },
            },
          })),
        },
      },
    });
  }


  for (const stu of students) {
    await prisma.student.upsert({
      where: { id: stu.id },
      update: {},
      create: {
        id: stu.id,
        name: stu.name,
        userId: stu.userId,
        completedCourses: {
          create: stu.completed_courses.map(c => ({
            courseId: c.course,
            grade: parseFloat(c.grade),
          })),
        },
      },
    });

  }
  for (const user of users) {
    const baseUser = {
      username: user.username,
      password: user.password,
      role: user.role,
    };
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        console.warn(`Student with userId ${user.id} not found`);
        continue;
      }

      await prisma.user.create({
        data: {
          ...baseUser,
          student: {
            connect: { id: student.id },
          },
        },
      });
    } else if (user.role === 'instructor') {
      await prisma.instructor.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name || 'Unknown',
        },
      });

      await prisma.user.create({
        data: {
          ...baseUser,
          instructor: {
            connect: { id: user.id },
          },
        },
      });
    } else {
      await prisma.user.create({ data: baseUser });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });