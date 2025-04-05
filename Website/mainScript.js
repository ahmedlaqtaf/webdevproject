document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const courseList = document.getElementById('courseList');
    const notification = document.getElementById('notification');
    const learningPathElement = document.getElementById('learningPath');
    const logoutButton = document.getElementById('logoutButton');

    let completedCourses = [];
    let allCourses = [];
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
        showNotification("Please log in first.", true);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
        return;
    }


    // Retrieve logged-in username
    const loggedInUsername = localStorage.getItem('username') || null;
    console.log("Logged in as:", loggedInUsername, " ", userId); //debugging


    function getClassEnrollment(courseId, classId) {
        const enrollmentKey = `enrollment_${courseId}_${classId}`;
        return JSON.parse(sessionStorage.getItem(enrollmentKey)) || [];
    }

    // Fetch student data and initialize courses
    async function initializeApp() {

        try {
            const [studentResponse, userResponse, coursesResponse] = await Promise.all([
                fetch('students.json'),
                fetch('users.json'),//useless
                fetch('courses.json')
            ]);

            const [studentData, userData, coursesData] = await Promise.all([
                studentResponse.json(),
                userResponse.json(),//useless
                coursesResponse.json()
            ]);

            console.log("Student data:", studentData);//all students

            const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

            const student = studentData.students.find(student => student.userId === userId);//just logged in student
            if (!student) throw new Error("Student record not found");
        
            console.log("Found student:", student);

            completedCourses = student ? student.completed_courses.map(course => course.course) : [];
            console.log("Completed Courses:", completedCourses);

            const localStorageCourses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
            let mergedCourses = [...coursesData.courses];

            // Merge localStorage courses with fetched courses
            localStorageCourses.courses.forEach(localCourse => {
                const existingCourse = mergedCourses.find(course => course.id === localCourse.id);
                if (existingCourse) {
                    localCourse.classes.forEach(localClass => {
                        const classExists = existingCourse.classes.some(cls => cls.id === localClass.id);
                        if (!classExists) {
                            existingCourse.classes.push(localClass);
                        }
                    });
                } else {
                    mergedCourses.push(localCourse);
                }
            });
            allCourses = mergedCourses;
            localStorage.setItem('courses', JSON.stringify({ courses: allCourses }));
            displayCourses(allCourses);
        } catch (error) {
            console.error("Error loading data:", error);

            // try {
            //     const localStorageCourses = JSON.parse(localStorage.getItem('courses'));
            //     if (localStorageCourses && localStorageCourses.courses) {
            //         allCourses = localStorageCourses.courses;
            //         displayCourses(allCourses);
            //         showNotification("Loaded courses from local storage.", true);
            //     } else {
            //         throw new Error("No courses found in local storage");
            //     }
            // } catch (localError) {
            //     console.error("Error loading local storage courses:", localError);
            //     showNotification("Error loading courses. Please try again.", true);
            // }
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

    function displayCourses(allCourses) {
        courseList.innerHTML = '';

        if (allCourses.length === 0) {
            courseList.innerHTML = '<p>No courses found.</p>';
            return;
        }

        allCourses.forEach(course => {
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
        const studentData = JSON.parse(localStorage.getItem('students'));

        // Extensive Logging
        console.log("Registration Attempt Details:");
        console.log("Logged In Username:", loggedInUsername);
        console.log("Course ID:", courseId);
        console.log("Class ID:", classId);

        let selectedCourse;
        let selectedClass;

        for (const course of courses.courses) {
            if (course.id === courseId) {
                selectedCourse = course;
                selectedClass = course.classes.find(cls => cls.id === classId);
                break;
            }
        }

        // Logging course and class details
        console.log("Selected Course:", selectedCourse);
        console.log("Selected Class:", selectedClass);

        if (!selectedCourse || !selectedClass) {
            showNotification("Class not found.", true);
            return;
        }

        const user = studentData.students.find(s => s.userId === localStorage.getItem('userId'));
        console.log("User Found:", user);
        const completedCourseIds = user ?
            user.completed_courses.map(c => c.course) : [];
        console.log("Completed Course IDs:", completedCourseIds);
        console.log("Course Prerequisites:", selectedCourse.prerequisites);
        const prerequisitesMet = selectedCourse.prerequisites.length === 0 ||
            selectedCourse.prerequisites.every(prereq => {
                const isCompleted = completedCourseIds.includes(prereq);
                console.log(`Prerequisite ${prereq} completed:`, isCompleted);
                return isCompleted;
            });

        console.log("Prerequisites Met:", prerequisitesMet);

        if (currentEnrollment.includes(loggedInUsername)) {
            showNotification("You are already registered for this class.", true);
            return;
        }

        if (currentEnrollment.length >= selectedClass.capacity) {
            showNotification("Class is full.", true);
            return;
        }

        if (!prerequisitesMet) {
            showNotification("You have not completed the required prerequisites.", true);
            return;
        }

        // Add student to enrollment
        currentEnrollment.push(loggedInUsername);
        localStorage.setItem(enrollmentKey, JSON.stringify(currentEnrollment));

        showNotification(`Successfully registered for ${selectedCourse.name}`);

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
                    localStorage.setItem('userRole', user.role); // store role
                    localStorage.setItem('userId', user.id); // store ID



                    sessionStorage.setItem('username', user.username);
                    sessionStorage.setItem('userId', user.id);
                    sessionStorage.setItem('userRole', user.role);

                    if (user.role === "admin") {
                        window.location.href = 'admin.html';
                    } else if (user.role === "student") {
                        const studentResponse = await fetch('students.json');
                        const studentData = await studentResponse.json();
                        const student = studentData.students.find(s => s.userId === user.id);
                        if (student) {
                            localStorage.setItem('studentId', student.id);
                        }
                        window.location.href = 'main.html';
                    } else {
                        sessionStorage.setItem('instructorName', user.name);
                        sessionStorage.setItem('instructorId', user.id);
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