document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const coursesDropdown = document.getElementById('coursesDropdown');
    const courseList = document.getElementById('courseList');

    // Get logged-in student ID from sessionStorage
    const studentId = sessionStorage.getItem('studentId');

    if (!studentId) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    let completedCourses = [];

    // Fetch student data
    fetch('students.json')
        .then(response => response.json())
        .then(data => {
            console.log(studentId + " ssss");
            const student = data.students.find(s => s.userId === studentId);

            if (student) {
                completedCourses = student.completed_courses; // Directly assign completed courses
            }
        })
        .catch(error => console.error("Error loading student data:", error));

    // Fetch courses from JSON
    fetch('courses.json')
        .then(response => response.json())
        .then(data => {
            const courses = data.courses;
            displayCourses(courses);

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredCourses = courses.filter(course =>
                    course.name.toLowerCase().includes(searchTerm) ||
                    course.category.toLowerCase().includes(searchTerm)
                );
                displayCourses(filteredCourses);
            });
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            courseList.innerHTML = '<p>Error loading courses. Please try again later.</p>';
        });

    // Display the courses
    function displayCourses(courses) {
        courseList.innerHTML = '';

        if (courses.length === 0) {
            courseList.innerHTML = '<p>No courses found.</p>';
            return;
        }

        courses.forEach(course => {
            const canRegister = course.open_for_registration &&
                (course.prerequisites ? course.prerequisites.every(p => completedCourses.includes(p)) : true);
            console.log(completedCourses);


            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');
            courseCard.innerHTML = `
                <h3>${course.name} (${course.id})</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p>${course.description}</p>
                <button class="register-btn" data-course-id="${course.id}" ${canRegister ? '' : 'disabled'}>
                    ${canRegister ? 'Register' : 'Prerequisites not met'}
                </button>
            `;

            courseList.appendChild(courseCard);
        });

        // Register button event listener
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                registerCourse(event.target.dataset.courseId);
            });
        });
    }

    // Register for a course (Placeholder function)
    function registerCourse(courseId) {
        alert(`Registration request sent for course: ${courseId}`);
    }
});