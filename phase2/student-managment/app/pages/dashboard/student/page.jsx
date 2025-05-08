"use client";
import { useEffect, useState } from "react";
import { getAllCourses } from "../../../actions/courseActions";
export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);

  async function fetchCourses() {
    const data = await getAllCourses();
    setCourses(data || []);
  }
  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="container">
      <h2 className="header">Register Courses</h2>
      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id} className="course-item">
            <div className="course-header">
              <h3 className="course-title">{course.name}</h3>
              <span className="category-pill">{course.category}</span>
              <p className="course-id">Course ID: {course.id}</p>
              <div
                className={`badge ${
                  course.open_for_registration
                    ? "badge-completed"
                    : "badge-unvalidated"
                }`}
              >
                {course.open_for_registration ? "Open" : "Closed"}
              </div>
            </div>

            <div className="course-body">
              <p className="course-label">Classes:</p>
              {course.classes.length > 0 ? (
                <ul>
                  {course.classes.map((cls) => (
                    <li key={cls.id} className="class-item">
                      <span>Class ID: {cls.id}</span>
                      <span>Schedule: {cls.schedule}</span>
                      <span>Capacity: {cls.capacity}</span>
                      <span></span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="course-detail">No classes available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
