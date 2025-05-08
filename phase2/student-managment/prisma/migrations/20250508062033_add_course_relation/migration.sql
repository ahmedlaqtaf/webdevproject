-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompletedCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "grade" REAL NOT NULL,
    CONSTRAINT "CompletedCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompletedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CompletedCourse" ("courseId", "grade", "id", "studentId") SELECT "courseId", "grade", "id", "studentId" FROM "CompletedCourse";
DROP TABLE "CompletedCourse";
ALTER TABLE "new_CompletedCourse" RENAME TO "CompletedCourse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
