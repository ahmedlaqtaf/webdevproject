document.addEventListener('DOMContentLoaded', () => {
    const courseList = document.getElementById('courseList');
    const courseFormContainer = document.getElementById('courseFormContainer');
    const showFormBtn = document.getElementById('showFormBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');

    let courses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
    displayCourses(courses.courses);

    function getClassEnrollment(courseId, classId) {
        const enrollmentKey = `enrollment_${courseId}_${classId}`;
        return JSON.parse(localStorage.getItem(enrollmentKey)) || [];
    }

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
                    const classEnrollment = getClassEnrollment(course.id, cls.id);

                    classesHTML += `
                    <div class="class-card">
                        <p><strong>Instructor:</strong> ${cls.instructor}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Seats:</strong> ${classEnrollment.length}/${cls.capacity}</p>
                        <button class="btn-delete" data-course-id="${course.id}" data-class-id="${cls.id}">Delete Class</button>
                        <hr/>
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
            <div style="margin-top: 1rem;">
            <button class="add-class-btn" data-index="${index}">Add Class</button>
            <button class="btn-delete" data-index="${index}">Delete Course</button>
            <div>
            `;

            courseList.appendChild(courseCard);
        });

        document.querySelectorAll('.add-class-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                showAddClassForm(parseInt(index));
            });
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (event) => {
                const courseId = event.target.dataset.courseId;
                const classId = event.target.dataset.classId;

                if (classId) {
                    deleteClass(courseId, classId);
                } else {
                    const index = event.target.dataset.index;
                    deleteCourse(parseInt(index));
                }
            });
        });

    }

    showFormBtn.addEventListener('click', () => {
        courseFormContainer.style.display = 'block';
    });

    closeFormBtn.addEventListener('click', () => {
        courseFormContainer.style.display = 'none';
    });

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

    function deleteClass(courseId, classId) {
        let courses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };

        const courseIndex = courses.courses.findIndex(course => course.id === courseId);
        if (courseIndex !== -1) {
            let course = courses.courses[courseIndex];
            const classIndex = course.classes.findIndex(cls => cls.id === classId);
            if (classIndex !== -1) {
                course.classes.splice(classIndex, 1);
                localStorage.setItem('courses', JSON.stringify(courses));
                displayCourses(courses.courses);
                console.log(`Deleted class ${classId} from course ${courseId}`);
            } else {
                console.warn(`Class ${classId} not found in course ${courseId}`);
            }
        } else {
            console.warn(`Course ${courseId} not found`);
        }
    }


    document.getElementById("logoutButton").addEventListener("click", () => {
        sessionStorage.removeItem('adminId');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
});