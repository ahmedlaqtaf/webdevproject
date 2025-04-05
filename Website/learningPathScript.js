document.addEventListener('DOMContentLoaded', () => {
    const studentId = localStorage.getItem('studentId');

    if (!studentId) {
        window.location.href = 'login.html';
        return;
    }

    let studentData = null;
    let allCourses = [];

    fetch('students.json')
        .then(response => response.json())
        .then(data => {
            const student = data.students.find(s => s.id === studentId);

            if (student) {
                studentData = student;
                fetch('courses.json')
                    .then(response => response.json())
                    .then(coursesData => {
                        allCourses = coursesData.courses;
                        const completedCoursesList = document.getElementById('completedCoursesList');
                        if (student.completed_courses && student.completed_courses.length > 0) {
                            completedCoursesList.innerHTML = student.completed_courses.map(course => {
                                const courseDetails = allCourses.find(c => c.id === course.course);
                                return courseDetails ? `<li>${courseDetails.name} (${courseDetails.id}) - Grade: ${course.grade}</li>` : '';
                            }).join('');
                        } else {
                            completedCoursesList.innerHTML = '<li>No completed courses.</li>';
                        }

                        // Display pending courses (if any)
                        const pendingCoursesList = document.getElementById('pendingCoursesList');
                        if (student.pending_registrations && student.pending_registrations.length > 0) {
                            pendingCoursesList.innerHTML = student.pending_registrations.map(reg => {
                                const courseDetails = allCourses.find(c => c.id === reg.courseId);
                                return courseDetails ? `<li>${courseDetails.name} (${courseDetails.id}) - Status: ${reg.status}</li>` : '';
                            }).join('');
                        } else {
                            pendingCoursesList.innerHTML = '<li>No pending courses.</li>';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching courses data:', error);
                        alert('Failed to load courses data. Please try again.');
                    });
            } else {
                console.error("Student not found.");
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error fetching student data:', error);
            alert('Failed to load student data. Please try again.');
        });

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem('studentId');
        localStorage.removeItem('userId');
        window.location.href = "login.html";
    });
});