import express from "express";
import cors from "cors";
import { Router } from "express";
import dotenv from "dotenv";
import usersRepo from "../../lib/repository/usersRepo.js";
import studentRepo from "../../lib/repository/studentRepo.js";
import instructorRepo from "../../lib/repository/instructorRepo.js";
import adminRepo from "../../lib/repository/adminRepo.js";
import coursesRepo from "../../lib/repository/coursesRepo.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Restrict to frontend URL
  })
);
app.use(express.json());

// Basic authentication middleware (placeholder)
const authenticate = (req, res, next) => {
  // Implement token-based auth (e.g., JWT) in production
  next(); // For now, just proceed
};

// Response helper
const sendResponse = (res, status, data, message) => {
  res.status(status).json({ message, data });
};

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// Route definitions
const apiRouter = Router();

// Users Routes
const usersRouter = Router();
usersRouter.get("/", async (req, res) => {
  const users = await usersRepo.getUsers();
  sendResponse(res, 200, users, "Users retrieved");
});
usersRouter.get("/:id", async (req, res) => {
  const user = await usersRepo.getUser(req.params.id);
  if (!user) return sendResponse(res, 404, null, "User not found");
  sendResponse(res, 200, user, "User retrieved");
});
usersRouter.post("/", async (req, res) => {
  const user = req.body;
  if (!user.username || !user.password) {
    return sendResponse(res, 400, null, "Username and password are required");
  }
  const result = await usersRepo.createUser(user);
  sendResponse(res, 201, result, "User created");
});

// Students Routes
const studentsRouter = Router();
studentsRouter.get("/", async (req, res) => {
  const students = await studentRepo.GetStudents();
  sendResponse(res, 200, students, "Students retrieved");
});
studentsRouter.get("/:id", async (req, res) => {
  const student = await studentRepo.GetStudent(req.params.id);
  if (!student) return sendResponse(res, 404, null, "Student not found");
  sendResponse(res, 200, student, "Student retrieved");
});
studentsRouter.post("/", async (req, res) => {
  const student = req.body;
  const result = await studentRepo.AddStudent(student);
  sendResponse(res, 201, result, "Student created");
});
studentsRouter.put("/", async (req, res) => {
  const student = req.body;
  const result = await studentRepo.UpdateStudent(student);
  sendResponse(res, 200, result, "Student updated");
});
studentsRouter.delete("/:id", async (req, res) => {
  const result = await studentRepo.DeleteStudent(req.params.id);
  sendResponse(res, 200, null, result);
});

// Instructors Routes
const instructorsRouter = Router();
instructorsRouter.get("/", async (req, res) => {
  const instructors = await instructorRepo.GetInstructors();
  sendResponse(res, 200, instructors, "Instructors retrieved");
});
instructorsRouter.get("/:id", async (req, res) => {
  const instructor = await instructorRepo.GetInstructor(req.params.id);
  if (!instructor) return sendResponse(res, 404, null, "Instructor not found");
  sendResponse(res, 200, instructor, "Instructor retrieved");
});
instructorsRouter.post("/", async (req, res) => {
  const instructor = req.body;
  const result = await instructorRepo.UpdateInstructor(instructor, "POST");
  sendResponse(res, 201, result, "Instructor created");
});
instructorsRouter.put("/", async (req, res) => {
  const instructor = req.body;
  const result = await instructorRepo.UpdateInstructor(instructor, "PUT");
  sendResponse(res, 200, result, "Instructor updated");
});
instructorsRouter.delete("/:id", async (req, res) => {
  const result = await instructorRepo.DeleteInstructor(req.params.id);
  sendResponse(res, 200, null, result);
});

// Admins Routes
const adminsRouter = Router();
adminsRouter.get("/", async (req, res) => {
  const admins = await adminRepo.getAdmins();
  sendResponse(res, 200, admins, "Admins retrieved");
});
adminsRouter.get("/:id", async (req, res) => {
  const admin = await adminRepo.getAdmin(req.params.id);
  if (!admin) return sendResponse(res, 404, null, "Admin not found");
  sendResponse(res, 200, admin, "Admin retrieved");
});
adminsRouter.post("/", async (req, res) => {
  const admin = req.body;
  const result = await adminRepo.createAdmin(admin);
  sendResponse(res, 201, result, "Admin created");
});
adminsRouter.put("/", async (req, res) => {
  const admin = req.body;
  const result = await adminRepo.UpdateAdmin(admin);
  sendResponse(res, 200, result, "Admin updated");
});

// Courses Routes
const coursesRouter = Router();
coursesRouter.get("/", async (req, res) => {
  const courses = await coursesRepo.GetCourses();
  sendResponse(res, 200, courses, "Courses retrieved");
});
coursesRouter.get("/:id", async (req, res) => {
  const course = await coursesRepo.GetCourse(req.params.id);
  if (!course) return sendResponse(res, 404, null, "Course not found");
  sendResponse(res, 200, course, "Course retrieved");
});
coursesRouter.post("/", async (req, res) => {
  const course = req.body;
  if (!course.title)
    return sendResponse(res, 400, null, "Course title is required");
  const result = !course.id
    ? await coursesRepo.CreateCourse(course)
    : await coursesRepo.UpdateCourse(course);
  const status = !course.id ? 201 : 200;
  sendResponse(
    res,
    status,
    result,
    !course.id ? "Course created" : "Course updated"
  );
});
coursesRouter.delete("/:id", async (req, res) => {
  const result = await coursesRepo.DeleteCourse(req.params.id);
  sendResponse(res, 200, null, result);
});

// Sections Routes
const sectionsRouter = Router();
sectionsRouter.get("/", async (req, res) => {
  const sections = await sectionsRepo.GetSections();
  sendResponse(res, 200, sections, "Sections retrieved");
});
sectionsRouter.get("/:id", async (req, res) => {
  const section = await sectionsRepo.GetSection(req.params.id);
  if (!section) return sendResponse(res, 404, null, "Section not found");
  sendResponse(res, 200, section, "Section retrieved");
});
sectionsRouter.post("/", async (req, res) => {
  const section = req.body;
  const result = !section.id
    ? await sectionsRepo.AddSection(section)
    : await sectionsRepo.UpdateSection(section);
  const status = !section.id ? 201 : 200;
  sendResponse(
    res,
    status,
    result,
    !section.id ? "Section created" : "Section updated"
  );
});
sectionsRouter.delete("/:id", async (req, res) => {
  const result = await sectionsRepo.DeleteSection(req.params.id);
  sendResponse(res, 200, null, result);
});
sectionsRouter.get("/course/:id", async (req, res) => {
  const sections = await sectionsRepo.GetSectionsOfCourse(req.params.id);
  sendResponse(res, 200, sections, "Course sections retrieved");
});
sectionsRouter.get("/semester/:id", async (req, res) => {
  const sections = await sectionsRepo.SectionsOfSpecificSem(req.params.id);
  sendResponse(res, 200, sections, "Semester sections retrieved");
});

// Registrations Routes
const registrationsRouter = Router();
registrationsRouter.get("/", async (req, res) => {
  const registrations = await registrationsRepo.GetRegistrations();
  sendResponse(res, 200, registrations, "Registrations retrieved");
});
registrationsRouter.get("/:id", async (req, res) => {
  const registration = await registrationsRepo.GetRegistration(req.params.id);
  if (!registration)
    return sendResponse(res, 404, null, "Registration not found");
  sendResponse(res, 200, registration, "Registration retrieved");
});
registrationsRouter.post("/", async (req, res) => {
  const registration = req.body;
  const result = !registration.id
    ? await registrationsRepo.CreateRegistration(registration)
    : await registrationsRepo.AddRegistration(registration);
  const status = !registration.id ? 201 : 200;
  sendResponse(
    res,
    status,
    result,
    !registration.id ? "Registration created" : "Registration updated"
  );
});
registrationsRouter.put("/", async (req, res) => {
  const registration = req.body;
  const result = await registrationsRepo.UpdateRegistration(registration);
  sendResponse(res, 200, result, "Registration updated");
});
registrationsRouter.delete("/:id", async (req, res) => {
  const result = await registrationsRepo.DeleteRegistration(req.params.id);
  sendResponse(res, 200, null, result);
});

// Published Courses Routes
const publishedCoursesRouter = Router();
publishedCoursesRouter.get("/", async (req, res) => {
  const courses = await publishedCoursesRepo.getAllPublishedCourses();
  sendResponse(res, 200, courses, "Published courses retrieved");
});
publishedCoursesRouter.get("/:id", async (req, res) => {
  const course = await publishedCoursesRepo.getPublishedCourse(req.params.id);
  if (!course)
    return sendResponse(res, 404, null, "Published course not found");
  sendResponse(res, 200, course, "Published course retrieved");
});
publishedCoursesRouter.post("/", async (req, res) => {
  const course = req.body;
  const result = await publishedCoursesRepo.createPublishedCourse(course);
  sendResponse(res, 201, result, "Published course created");
});
publishedCoursesRouter.put("/", async (req, res) => {
  const course = req.body;
  const result = await publishedCoursesRepo.updatePublishedCourse(course);
  sendResponse(res, 200, result, "Published course updated");
});
publishedCoursesRouter.delete("/:id", async (req, res) => {
  const result = await publishedCoursesRepo.deletePublishedCourse(
    req.params.id
  );
  sendResponse(res, 200, null, result);
});

// Mount routers
apiRouter.use("/users", authenticate, usersRouter);
apiRouter.use("/students", authenticate, studentsRouter);
apiRouter.use("/instructors", authenticate, instructorsRouter);
apiRouter.use("/admins", authenticate, adminsRouter);
apiRouter.use("/courses", authenticate, coursesRouter);
apiRouter.use("/sections", authenticate, sectionsRouter);
apiRouter.use("/registration", authenticate, registrationsRouter);
apiRouter.use("/publishedCourses", authenticate, publishedCoursesRouter);

// Root endpoint
apiRouter.get("/", (req, res) => {
  sendResponse(res, 200, null, "Student Management System API");
});

// Mount API router
app.use("/api", apiRouter);

// Dynamically collect endpoints for console output
const getEndpoints = (router) => {
  const endpoints = [];
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods).map((m) =>
        m.toUpperCase()
      );
      endpoints.push({ methods, path });
    } else if (middleware.handle.stack) {
      const subRouter = middleware.handle;
      subRouter.stack.forEach((subMiddleware) => {
        if (subMiddleware.route) {
          const path = `/api${middleware.regexp.source.replace("/?", "")}${
            subMiddleware.route.path
          }`;
          const methods = Object.keys(subMiddleware.route.methods).map((m) =>
            m.toUpperCase()
          );
          endpoints.push({ methods, path });
        }
      });
    }
  });
  return endpoints;
};

// Start server
app.listen(PORT, () => {
  console.log(
    `Student Management System API running on http://localhost:${PORT}`
  );
  console.log(`Base URL: http://localhost:${PORT}/api`);
  console.log("Available endpoints:");
  const endpoints = getEndpoints(apiRouter);
  endpoints.forEach(({ methods, path }) => {
    console.log(`${methods.join(", ")} ${path}`);
  });
  console.log(
    "API handles CRUD operations for student management system entities."
  );
});
