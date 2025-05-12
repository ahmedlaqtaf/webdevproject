"use client";
import React, { useEffect, useState } from "react";
import {
  getAllCourses,
  getTotalEnrollmentsPerClass,
} from "../../actions/courseActions";

export default function Page() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getAllCourses();
        setCourses(fetchedCourses);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Courses</h1>
      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id} className="course-item">
            <div className="course-header">
              <h2 className="course-title">{course.name}</h2>
              <div className="course-id">{course.id}</div>
            </div>
            <div className="course-body">
              <p className="course-detail">Category: {course.category}</p>
              <p className="course-detail">
                Total Students: {course.totalEnrollments}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
