import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8")).users;
  const courses = JSON.parse(fs.readFileSync("./data/courses.json", "utf8"));
  const instructors = JSON.parse(
    fs.readFileSync("./data/instructors.json", "utf8")
  );
  const students = JSON.parse(
    fs.readFileSync("./data/students.json", "utf8")
  ).students;
  const admins = JSON.parse(
    fs.readFileSync("./data/admins.json", "utf8")
  ).admins;

  // 1. Seed Instructors
  for (const inst of instructors.instructors) {
    await prisma.instructor.upsert({
      where: { id: inst.id },
      update: {},
      create: { id: inst.id, name: inst.name },
    });
  }

  // 2. Seed Students (without completedCourses yet)
  for (const stu of students) {
    await prisma.student.create({
      data: {
        id: stu.id,
        name: stu.name,
        userId: stu.userId,
      },
    });
  }

  // 3. Seed Courses
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
      },
    });
  }

  // 4. Seed Classes and Enrollments
  for (const course of courses) {
    for (const cls of course.classes) {
      await prisma.class.upsert({
        where: { id: cls.id },
        update: {},
        create: {
          id: cls.id,
          schedule: cls.schedule,
          capacity: cls.capacity,
          course: {
            connect: { id: course.id },
          },
          instructor: {
            connect: { id: cls.instructor },
          },
        },
      });

      if (cls.enrolled_students?.length > 0) {
        for (const student of cls.enrolled_students) {
          await prisma.enrollment.create({
            data: {
              student: { connect: { id: student.studentId } },
              class: { connect: { id: cls.id } },
              status: "approved",
              grade: null,
            },
          });
        }
      }
    }
  }

  // 5. Add prerequisites
  for (const course of courses) {
    if (course.prerequisites?.length > 0) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          prerequisites: {
            connect: course.prerequisites.map((pid) => ({ id: pid })),
          },
        },
      });
    }
  }

  // 6. Seed Users
  for (const user of users) {
    const baseUser = {
      username: user.username,
      password: user.password,
      role: user.role,
    };

    if (user.role === "student") {
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
    } else if (user.role === "instructor") {
      await prisma.user.create({
        data: {
          ...baseUser,
          instructor: {
            connect: { id: user.id },
          },
        },
      });
    } else if (user.role === "admin") {
      await prisma.user.create({
        data: {
          ...baseUser,
          id: user.id,
        },
      });
    }
  }

  // 7. Seed completedCourses 
  for (const stu of students) {
    for (const c of stu.completed_courses) {
      await prisma.completedCourse.create({
        data: {
          courseId: c.course,
          studentId: stu.id,
          grade: parseFloat(c.grade),
        },
      });
    }
  }

  // 8. Seed Admins
  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { id: admin.id },
      update: {},
      create: {
        id: admin.id,
        name: admin.name,
        User: {
          connect: { id: admin.userId },
        },
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(" Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
