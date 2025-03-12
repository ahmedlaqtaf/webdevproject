document.addEventListener('DOMContentLoaded', () => {
    // Get the studentId from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');

    if (!studentId) {
        // If no studentId is found, redirect to the login page
        window.location.href = 'login.html';
        return;
    }

    let studentData = null;
    let allCourses = [];

    // Fetch student data
    fetch('students.json')
        .then(response => response.json())
        .then(data => {
            const student = data.students.find(s => s.id === studentId);

            if (student) {
                studentData = student;

                // Fetch courses data
                fetch('courses.json')
                    .then(response => response.json())
                    .then(coursesData => {
                        allCourses = coursesData.courses;

                        // Display completed courses
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
            }
        })
        .catch(error => {
            console.error('Error fetching student data:', error);
            alert('Failed to load student data. Please try again.');
        });

    // Logout button functionality
    document.getElementById("logoutButton").addEventListener("click", function () {
        sessionStorage.removeItem('studentId');
        window.location.href = "login.html";
    });
});