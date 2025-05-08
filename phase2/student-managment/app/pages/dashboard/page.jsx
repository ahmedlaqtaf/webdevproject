"use client";

import { useEffect, useState } from "react";
import "../styles/studentDashboard.css";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/stats/total-students"),
          fetch("/api/stats/courses-by-category"),
          fetch("/api/stats/top-3-enrollments"),
          fetch("/api/stats/failures-per-course"),
          fetch("/api/stats/passes-per-course"),
          fetch("/api/stats/classes-per-instructor"),
          fetch("/api/stats/students-per-class"),
          fetch("/api/stats/top-5-students"),
          fetch("/api/stats/courses-with-most-failures"),
          fetch("/api/stats/course-status-counts"),
        ]);

        const results = await Promise.all(responses.map((r) => r.json()));

        setStats({
          totalStudents: results[0].count,
          courseCountByCategory: results[1],
          top3Courses: results[2],
          failurePerCourse: results[3],
          passPerCourse: results[4],
          classCountPerInstructor: results[5],
          studentCountPerClass: results[6],
          top5Students: results[7],
          coursesWithMostFailures: results[8],
          courseStatusCounts: results[9],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load dashboard stats.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="notification-error">{error}</div>;

  return (
    <div>
      <section className="welcome-section">
        <h1>Dashboard Overview</h1>
        <p>Overview of system statistics and performance.</p>
      </section>

      <div className="cards-container">
        <div className="card">
          <h2>Total Students</h2>
          <p>{stats.totalStudents}</p>
        </div>

        <div className="card">
          <h2>Course Count By Category</h2>
          <ul>
            {stats.courseCountByCategory.map((cat) => (
              <li key={cat.category}>
                {cat.category}: {cat._count}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Top 3 Courses By Enrollment</h2>
          <ul>
            {stats.top3Courses.map((c) => (
              <li key={c.id}>
                {c.name} - {c.enrollmentCount} enrollments
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Top 5 Students By GPA</h2>
          <ul>
            {stats.top5Students.map((s) => {
              const grades = s.completedCourses?.map((c) => c.grade) || [];
              const gpa = grades.length
                ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)
                : "N/A";
              return (
                <li key={s.id}>
                  {s.name} - GPA: {s.gpa.toFixed(2)}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card">
          <h2>Course Status Distribution</h2>
          <ul>
            {stats.courseStatusCounts.map((status) => (
              <li key={status.status}>
                {status.status}: {status._count}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Failure Count Per Course</h2>
          <ul>
            {stats.failurePerCourse.map((c) => (
              <li key={c.courseId}>
                {c.courseName}: {c.failCount} failed
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Pass Count Per Course</h2>
          <ul>
            {stats.passPerCourse.map((c) => (
              <li key={c.courseId}>
                {c.courseName}: {c.passCount} passed
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Classes Per Instructor</h2>
          <ul>
            {stats.classCountPerInstructor.map((i, idx) => (
              <li key={idx}>
                {i.name}: {i._count.classes}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Students Per Class</h2>
          <ul>
            {stats.studentCountPerClass.map((cls) => (
              <li key={cls.id}>
                Class {cls.id}: {cls._count.enrollments} students
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Courses With Most Failures</h2>
          <ul>
            {stats.coursesWithMostFailures.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
