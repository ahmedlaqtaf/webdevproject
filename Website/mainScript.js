document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const courseList = document.getElementById('courseList');
    const notification = document.getElementById('notification');
    const learningPathElement = document.getElementById('learningPath');
    const logoutButton = document.getElementById('logoutButton');

    let completedCourses = [];
    let allCourses = [];

    // Retrieve logged-in username
    const loggedInUsername = localStorage.getItem('username') || null;
    console.log("Logged in as:", loggedInUsername);

    // Function to get enrolled students for a specific class from localStorage
    function getClassEnrollment(courseId, classId) {
        const enrollmentKey = `enrollment_${courseId}_${classId}`;
        return JSON.parse(localStorage.getItem(enrollmentKey)) || [];
    }

    // Fetch student data and initialize courses
    async function initializeApp() {
        if (!loggedInUsername) {
            showNotification("User not logged in. Redirecting to login...", true);
            setTimeout(() => window.location.href = "login.html", 2000);
            return;
        }

        try {
            const [studentResponse, userResponse, coursesResponse] = await Promise.all([
                fetch('students.json'),
                fetch('users.json'),
                fetch('courses.json')
            ]);

            if (!studentResponse.ok || !userResponse.ok || !coursesResponse.ok) {
                throw new Error("Failed to load data files.");
            }

            const [studentData, userData, coursesData] = await Promise.all([
                studentResponse.json(),
                userResponse.json(),
                coursesResponse.json()
            ]);

            console.log("Student data:", studentData);
            console.log("Users data:", userData);

            // Find the logged-in user
            const user = userData.users.find(user => user.username === loggedInUsername);
            if (!user) throw new Error("User not found in users.json");
            const student = studentData.students.find(student => student.userId === user.id);
            if (student) {
                completedCourses = student.completed_courses.map(course => course.course);
            } else {
                completedCourses = [];
            }

            const localStorageCourses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
            const mergedCourses = [...coursesData.courses];
            localStorageCourses.courses.forEach(localCourse => {
                const exists = mergedCourses.some(course => course.id === localCourse.id);
                if (!exists) {
                    mergedCourses.push(localCourse);
                }
            });
            allCourses = mergedCourses;
            localStorage.setItem('courses', JSON.stringify({ courses: allCourses }));

            displayCourses(allCourses);
        } catch (error) {
            console.error("Error loading data:", error);

            try {
                const localStorageCourses = JSON.parse(localStorage.getItem('courses'));
                if (localStorageCourses && localStorageCourses.courses) {
                    allCourses = localStorageCourses.courses;
                    displayCourses(allCourses);
                    showNotification("Loaded courses from local storage.", true);
                } else {
                    throw new Error("No courses found in local storage");
                }
            } catch (localError) {
                console.error("Error loading local storage courses:", localError);
                showNotification("Error loading courses. Please try again.", true);
            }
        }
    }

    // Display courses based on search term
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCourses = allCourses.filter(course =>
            course.name.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm)
        );
        displayCourses(filteredCourses);
    }

    // Display courses in the DOM
    function displayCourses(courses) {
        courseList.innerHTML = '';

        if (courses.length === 0) {
            courseList.innerHTML = '<p>No courses found.</p>';
            return;
        }

        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            let classesHTML = course.classes && course.classes.length > 0 ? '<h4>Available Classes:</h4>' : '<p>No classes available.</p>';

            if (course.classes) {
                course.classes.forEach(cls => {
                    // Get enrollment from localStorage
                    const classEnrollment = getClassEnrollment(course.id, cls.id);

                    classesHTML += `
                    <div class="class-card">
                        <p><strong>Instructor:</strong> ${cls.instructor}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Seats:</strong> ${classEnrollment.length}/${cls.capacity}</p>
                        <button class="register-class-btn" 
                            data-course-id="${course.id}"
                            data-class-id="${cls.id}" 
                            style="background-color:rgb(0, 170, 255); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;"
                            ${classEnrollment.length >= cls.capacity ? 'disabled' : ''}>
                            Register
                        </button>
                    </div>
                `;
                });
            }

            courseCard.innerHTML = `
            <h3>${course.name} (${course.id})</h3>
            <p><strong>Category:</strong> ${course.category}</p>
            <p>${course.description}</p>
            ${classesHTML}
        `;

            courseList.appendChild(courseCard);
        });

        // Add event listeners for registering in a class
        document.querySelectorAll('.register-class-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const classId = event.target.dataset.classId;
                const courseId = event.target.dataset.courseId;
                handleClassRegistration(courseId, classId);
            });
        });
    }

    function handleClassRegistration(courseId, classId) {
        const loggedInUsername = localStorage.getItem('username');
        const enrollmentKey = `enrollment_${courseId}_${classId}`;
        let currentEnrollment = JSON.parse(localStorage.getItem(enrollmentKey)) || [];
        const courses = JSON.parse(localStorage.getItem('courses'));

        let selectedCourse;
        let selectedClass;

        for (const course of courses.courses) {
            if (course.id === courseId) {
                selectedCourse = course;
                selectedClass = course.classes.find(cls => cls.id === classId);
                break;
            }
        }

        if (!selectedCourse || !selectedClass) {
            showNotification("Class not found.", true);
            return;
        }

        // Check if already registered
        if (currentEnrollment.includes(loggedInUsername)) {
            showNotification("You are already registered for this class.", true);
            return;
        }

        // Check capacity
        if (currentEnrollment.length >= selectedClass.capacity) {
            showNotification("Class is full.", true);
            return;
        }

        // Check prerequisites
        let studentData = JSON.parse(localStorage.getItem('students')) || { students: [] };
        let student = studentData.students.find(s => s.userId === loggedInUsername);

        if (!student) {
            student = {
                userId: loggedInUsername,
                completed_courses: []
            };
            studentData.students.push(student);
            localStorage.setItem('students', JSON.stringify(studentData));
        }

        const completedCourses = student.completed_courses.map(c => c.course);
        const prerequisitesMet = selectedCourse.prerequisites.every(p => completedCourses.includes(p));

        if (!prerequisitesMet) {
            showNotification("You have not completed the required prerequisites.", true);
            return;
        }

        // Add student to enrollment
        currentEnrollment.push(loggedInUsername);
        localStorage.setItem(enrollmentKey, JSON.stringify(currentEnrollment));

        showNotification(`Successfully registered for ${selectedCourse.name} - ${selectedClass.instructor}.`);

        displayCourses(courses.courses);
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.display = "block";
        notification.classList.toggle("error-notification", isError);

        setTimeout(() => {
            notification.style.display = "none";
        }, 5000);
    }

    function handleLogout() {
        localStorage.removeItem('username');
        showNotification("You have been logged out.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    }
    searchInput.addEventListener('input', handleSearch);
    logoutButton.addEventListener('click', handleLogout);

    initializeApp();
});

// Login functionality
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');

            try {
                const response = await fetch('users.json');
                const data = await response.json();
                const user = data.users.find(user => user.username === username && user.password === password);

                if (user) {
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('role', user.role); // Store role
                    localStorage.setItem('userId', user.id); // Store ID

                    if (user.role === "admin") {
                        window.location.href = 'admin.html';
                    } else if (user.role === "student") {
                        window.location.href = 'main.html';
                    } else {
                        window.location.href = 'instructor.html';
                    }
                } else {
                    errorMessage.textContent = 'Invalid username or password';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = 'Failed to fetch user data.';
                errorMessage.style.display = 'block';
            }
        });
    }
});