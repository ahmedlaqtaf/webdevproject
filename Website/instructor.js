document.addEventListener('DOMContentLoaded', () => {
  const instructorName = sessionStorage.getItem('instructorName');
  if (!instructorName) {
    window.location.href = "login.html";
    return;
  }

  const courseList = document.querySelector('#instructorClasses');
  const coursesData = JSON.parse(localStorage.getItem('courses')) || { courses: [] };

  const allStudentsData = JSON.parse(localStorage.getItem('students')) ? .students || [];

  let instructorClasses = [];

  coursesData.courses.forEach(course => {
    course.classes.forEach(cls => {
      if (cls.instructor === instructorName) {
        const enrollmentKey = `enrollment_${course.id}_${cls.id}`;
        const enrolledStudents = JSON.parse(localStorage.getItem(enrollmentKey)) || [];

        instructorClasses.push({
          courseId: course.id,
          courseName: course.name,
          classId: cls.id,
          schedule: cls.schedule,
          students: enrolledStudents.map(studentId => {
            const fullStudent = allStudentsData.find(s => s.id === studentId);
            return {
              studentId,
              name: fullStudent ? .name || "Unknown"
                        };
          })
        });
      }
    });
  });

  if (instructorClasses.length === 0) {
    courseList.innerHTML = "<p>No classes assigned.</p>";
    return;
  }

  instructorClasses.forEach(cls => {
    let studentList = cls.students.map(student =>
      `<li>(${student.studentId}) - Grade: 
            <input type="text" data-student-id="${student.studentId}" data-class-id="${cls.classId}" placeholder="Enter grade">
        </li>`
    ).join('');


    courseList.innerHTML += `
            <div class="class-card">
                <h3>${cls.courseName} (${cls.courseId})</h3>
                <p><strong>Schedule:</strong> ${cls.schedule}</p>
                <h4>Students:</h4>
                <ul>${studentList}</ul>
                <button onclick="submitGrades('${cls.classId}')">Submit Grades</button>
            </div>
        `;
  });
});

function submitGrades(classId) {
  const inputs = document.querySelectorAll(`input[data-class-id="${classId}"]`);
  let grades = {};

  inputs.forEach(input => {
    grades[input.dataset.studentId] = input.value;
  });

  localStorage.setItem(`grades_${classId}`, JSON.stringify(grades));
  alert("Grades submitted successfully!");
}

document.getElementById("logoutButton").addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});