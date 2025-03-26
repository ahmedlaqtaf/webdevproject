document.addEventListener('DOMContentLoaded', () => {
    const courseList = document.getElementById('courseList');
    const courseFormContainer = document.getElementById('courseFormContainer');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const courseForm = document.getElementById('courseForm');

    let courses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
    displayCourses(courses.courses);

    closeFormBtn.addEventListener('click', () => {
        courseFormContainer.classList.add('hidden');
    });

    courseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const courseData = {
            id: document.getElementById('id').value,
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            prerequisites: document.getElementById('prerequisites').value.split(',').map(item => item.trim()),
            open_for_registration: document.getElementById('open_for_registration').value === 'true',
            status: "pending",
            classes: []
        };

        courses.courses.push(courseData);
        localStorage.setItem('courses', JSON.stringify(courses));
        displayCourses(courses.courses);
        courseForm.reset();
    });

    function displayCourses(courses) {
        courseList.innerHTML = '';

        courses.forEach((course, index) => {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            let classesHTML = '<h4>Classes:</h4>';
            if (course.classes && course.classes.length > 0) {
                course.classes.forEach(cls => {
                    classesHTML += `
                    <div class="class-card">
                        <p><strong>Instructor:</strong> ${cls.instructor}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Seats:</strong> ${cls.enrolled}/${cls.capacity}</p>
                        <p>-------------------<p>
                    </div>
                    `;
                });
            } else {
                classesHTML += '<p>No classes available.</p>';
            }

            courseCard.innerHTML = `
            <h3>${course.name} (${course.id})</h3>
            <p><strong>Category:</strong> ${course.category}</p>
            ${classesHTML}
            <button class="add-class-btn" data-index="${index}">Add Class</button>
            <button class="delete-course-btn" data-index="${index}">Delete Course</button>
            `;

            courseList.appendChild(courseCard);
        });

        document.querySelectorAll('.add-class-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                showAddClassForm(parseInt(index));
            });
        });

        document.querySelectorAll('.delete-course-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                deleteCourse(parseInt(index));
            });
        });
    }

    function showAddClassForm(courseIndex) {
        const classFormContainer = document.createElement('div');
        classFormContainer.innerHTML = `
        <h2>Add New Class</h2>
        <form id="classForm">
            <label for="instructor">Instructor:</label>
            <input type="text" id="instructor" required><br>
            <label for="schedule">Schedule:</label>
            <input type="text" id="schedule" required><br>
            <label for="capacity">Capacity:</label>
            <input type="number" id="capacity" required><br>
            <button type="submit">Add Class</button>
            <button type="button" id="cancelClassForm">Cancel</button>
        </form>
    `;

        document.body.appendChild(classFormContainer);

        document.getElementById('cancelClassForm').addEventListener('click', () => {
            document.body.removeChild(classFormContainer);
        });

        document.getElementById('classForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const newClass = {
                id: `class_${Date.now()}`, // Unique ID for the class
                instructor: document.getElementById('instructor').value,
                schedule: document.getElementById('schedule').value,
                capacity: parseInt(document.getElementById('capacity').value),
                enrolled: 0
            };
            let updatedCourses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
            updatedCourses.courses[courseIndex].classes.push(newClass);
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
            displayCourses(updatedCourses.courses);
            document.body.removeChild(classFormContainer);
        });
    }


    function deleteCourse(index) {
        if (index >= 0 && index < courses.courses.length) {
            courses.courses.splice(index, 1);
            localStorage.setItem('courses', JSON.stringify(courses));
            displayCourses(courses.courses);
        }
    }

    document.getElementById("logoutButton").addEventListener("click", () => {
        sessionStorage.removeItem('adminId');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
});