"use client";

import { useEffect, useState } from "react";

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
      <h1 className="card-title"> Dashboard Overview</h1>
      <div className="card">
        <div className="card-body">
          <p>
            <strong>Total Students:</strong> {stats.totalStudents}
          </p>
          <p>
            <strong>Course Count By Category:</strong>
          </p>
          <ul>
            {stats.courseCountByCategory.map((cat) => (
              <li key={cat.category}>
                {cat.category}: {cat._count}
              </li>
            ))}
          </ul>

          <p>
            <strong>Top 3 Courses By Enrollment:</strong>
          </p>
          <ul>
            {stats.top3Courses.map((c) => (
              <li key={c.id}>
                {c.name} ({c.classes} {c.enrollment})
              </li>
            ))}
          </ul>

          <p>
            <strong>Top 5 Students By GPA:</strong>
          </p>
          <ul>
            {stats.top5Students.map((s) => (
              <li key={s.id}>
                {s.name}
                {s.grade}
              </li>
            ))}
          </ul>

          <p>
            <strong>Course Status Distribution:</strong>
          </p>
          <ul>
            {stats.courseStatusCounts.map((status) => (
              <li key={status.status}>
                {status.status}: {status._count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
