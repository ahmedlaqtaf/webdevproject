import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Head from "next/head";



import Navbar from './components/Navbar';

export default function Dashboard() {
    const [stats, setStats] = useState({
      totalStudents: 0,
      totalInstructors: 0,
      highestFailCourse: { name: "", rate: 0 },
      mostPrereqCourse: { name: "", count: 0 },
      mostRegisteredSemester: "",
      registrationsBySemester: [],
      sectionStatus: { open: 0, approved: 0, pending: 0 },
      avgGpa: 0,
      avgCompletedCourses: 0,
      coursesPerCategory: { core: 0, elective: 0 },
      mostRegisteredCourse: { name: "", count: 0 },
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
          try {
            const responses = await Promise.all([
              fetch("/api/students/total-count"),
              fetch("/api/instructors/total-count"),
              fetch("/api/course/highest-failar"),
              fetch("/api/course/most-prerequisites"),
              fetch("/api/course/most-registered-semester"),
              fetch("/api/registrations/registrations-by-semester"),
              fetch("/api/sections/status-distribution"),
              fetch("/api/students/average-gpa"),
              fetch("/api/students/avg-completed-courses"),
            ]);
    
            const [
              totalStudents,
              totalInstructors,
              highestFailCourse,
              mostPrereqCourse,
              mostRegisteredSemester,
              registrationsBySemester,
              sectionStatus,
              avgGpa,
              avgCompletedCourses,
            ] = await Promise.all(responses.map((r) => r.json()));
    
            console.log("registrationsBySemester:", registrationsBySemester);
            console.log("totalStudents raw:", totalStudents);
    
            setStats({
              totalStudents: totalStudents.totalStudents,
              totalInstructors: totalInstructors.totalInstructors,
              highestFailCourse,
              mostPrereqCourse,
              mostRegisteredSemester,
              registrationsBySemester,
              sectionStatus,
              avgGpa: Number(avgGpa.avgGpa) || 0,
              avgCompletedCourses:
                Number(avgCompletedCourses.avgCompletedCourses) || 0,
              coursesPerCategory: { core: 20, elective: 35 }, // TODO: Replace with real data
              mostRegisteredCourse: { name: "CS101", count: 120 }, // TODO: Replace with real data
            });
    
            setLoading(false);
          } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load statistics");
            setLoading(false);
          }
        };
        fetchData();
      }, []);
    }