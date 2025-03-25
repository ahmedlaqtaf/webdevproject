document.addEventListener('DOMContentLoaded', () => {
    const courseList = document.getElementById('courseList');
    const courseFormContainer = document.getElementById('courseFormContainer');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const courseForm = document.getElementById('courseForm');

    // Initialize courses with the correct structure
    let courses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
    displayCourses(courses.courses);

    const adminID = sessionStorage.getItem('adminId');
    closeFormBtn.addEventListener('click', () => {
        courseFormContainer.classList.add('hidden');
    });

    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the course data from the form
        const courseData = {
            id: document.getElementById('id').value,
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            prerequisites: document.getElementById('prerequisites').value.split(',').map(item => item.trim()),
            open_for_registration: document.getElementById('open_for_registration').value === 'true',
            status: "pending"
        };
        if (!courses.courses) {
            courses = { courses: [] };
        }
        courses.courses.push(courseData);
        localStorage.setItem('courses', JSON.stringify(courses));

        try {
            const response = await fetch('courses.json');
            const existingCoursesData = await response.json();
            existingCoursesData.courses.push(courseData);
            console.log('Updated Courses:', JSON.stringify(existingCoursesData, null, 2));
            courseForm.reset();
            courseFormContainer.classList.add('hidden');
            displayCourses(courses.courses);
        } catch (error) {
            console.error('Error updating courses:', error);
        }
    });

    function displayCourses(courses) {
        courseList.innerHTML = '';

        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            let classesHTML = '';
            if (course.classes && course.classes.length > 0) {
                classesHTML += '<h4>Classes:</h4>';
                course.classes.forEach(cls => {
                    // Retrieve enrolled students for this specific class
                    const enrollmentKey = `enrollment_${course.id}_${cls.id}`;
                    const enrolledStudents = JSON.parse(localStorage.getItem(enrollmentKey)) || [];

                    classesHTML += `
                    <div class="class-card">
                        <p><strong>Instructor:</strong> ${cls.instructor}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Seats:</strong> ${enrolledStudents.length}/${cls.capacity}</p>
                        <button class="validate-class-btn" data-course-id="${course.id}" data-class-id="${cls.id}">Validate</button>
                    </div>
                `;
                });
            } else {
                classesHTML = '<p>No classes available.</p>';
            }

            courseCard.innerHTML = `
            <h3>${course.name} (${course.id})</h3>
            <p><strong>Category:</strong> ${course.category}</p>
            ${classesHTML}
        `;

            courseList.appendChild(courseCard);
        });

        document.querySelectorAll('.validate-class-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const courseId = event.target.dataset.courseId;
                const classId = event.target.dataset.classId;
                validateClass(courseId, classId);
            });
        });
    }

    function validateClass(courseId, classId) {
        let courses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };

        for (const course of courses.courses) {
            if (course.id === courseId) {
                const cls = course.classes.find(c => c.id === classId);
                if (cls) {
                    cls.status = "validated";
                    break;
                }
            }
        }

        localStorage.setItem('courses', JSON.stringify(courses));
        displayCourses(courses.courses);
    }

    function deleteCourse(index) {
        let courses = JSON.parse(localStorage.getItem("courses")) || { courses: [] };

        if (index !== null) {
            courses.courses.splice(index, 1);
            localStorage.setItem('courses', JSON.stringify(courses));
            displayCourses(courses.courses);
        }
    }

    // Logout button functionality
    document.getElementById("logoutButton").addEventListener("click", function () {
        sessionStorage.removeItem('adminId');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
});