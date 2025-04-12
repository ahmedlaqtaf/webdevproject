document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const courseList = document.getElementById('courseList');
    const notification = document.getElementById('notification');
    const logoutButton = document.getElementById('logoutButton');

    let allCourses = [];
    let currentStudent = null; // Store the logged-in student's data

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (!userId) {
        showNotification("Please log in first.", true);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
        return;
    }

    console.log("Logged in user ID:", userId);

    function getClassEnrollmentCount(courseId, classId) {
        const enrollmentKey = `enrollment_${courseId}_${classId}`;
        const enrollment = JSON.parse(localStorage.getItem(enrollmentKey)) || [];
        return enrollment.length;
    }

    async function initializeApp() {
        try {
            const [coursesResponse, studentsResponse] = await Promise.all([
                fetch('courses.json'),
                fetch('students.json')
            ]);

            if (!coursesResponse.ok || !studentsResponse.ok) {
                throw new Error('Failed to fetch initial data.');
            }

            const [coursesData, studentData] = await Promise.all([
                coursesResponse.json(),
                studentsResponse.json()
            ]);

            currentStudent = studentData.students.find(student => student.userId === userId);
            if (currentStudent) {
                console.log("Current student data loaded:", currentStudent);
                console.log("Pending registrations:", currentStudent.pending_registrations);
            }
            if (!currentStudent) {
                const localStudents = JSON.parse(localStorage.getItem('students'));
                if (localStudents && localStudents.students) {
                    currentStudent = localStudents.students.find(student => student.userId === userId);
                }
                if (!currentStudent) {
                    console.error("Student record not found for userId:", userId);
                    showNotification("Failed to load your student data. Logging out.", true);
                    setTimeout(handleLogout, 2000);
                    return;
                } else {
                    console.log("Found student from localStorage:", currentStudent);
                }

            } else {
                console.log("Found student from students.json:", currentStudent);
                localStorage.setItem('students', JSON.stringify(studentData));
            }

            const localStorageCourses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
            let mergedCourses = [...coursesData.courses];

            const fetchedCourseMap = new Map(mergedCourses.map(course => [course.id, course]));

            localStorageCourses.courses.forEach(localCourse => {
                const existingCourse = fetchedCourseMap.get(localCourse.id);
                if (existingCourse) {
                    const existingClassIds = new Set(existingCourse.classes.map(cls => cls.id));
                    localCourse.classes.forEach(localClass => {
                        if (!existingClassIds.has(localClass.id)) {
                            existingCourse.classes.push(localClass);
                            console.log(`Merged class ${localClass.id} into course ${existingCourse.id}`);
                        }

                    });
                } else {
                    mergedCourses.push(localCourse);
                    fetchedCourseMap.set(localCourse.id, localCourse); // Add to map
                    console.log(`Added course ${localCourse.id} from localStorage`);
                }
            });

            allCourses = mergedCourses;
            localStorage.setItem('courses', JSON.stringify({ courses: allCourses }));
            displayCourses(allCourses); // Initial display
        } catch (error) {
            console.error("Error loading initial data:", error);
            try {
                const localStorageCourses = JSON.parse(localStorage.getItem('courses'));
                const localStudents = JSON.parse(localStorage.getItem('students')); // Also try loading student data

                if (localStorageCourses && localStorageCourses.courses) {
                    allCourses = localStorageCourses.courses;
                    if (localStudents && localStudents.students) {
                        currentStudent = localStudents.students.find(student => student.userId === userId);
                    }
                    if (!currentStudent) {
                        console.warn("Could not find student data in localStorage either.");
                    }
                    displayCourses(allCourses);
                    showNotification("Loaded courses from local storage due to fetch error.", false);
                } else {
                    throw new Error("No courses found in local storage");
                }
            } catch (localError) {
                console.error("Error loading local storage data:", localError);
                showNotification("Error loading courses. Please try refreshing or contact support.", true);
            }
        }
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filteredCourses = allCourses.filter(course =>
            course.name.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm) ||
            course.id.toLowerCase().includes(searchTerm) // Allow searching by course ID
        );
        displayCourses(filteredCourses);
    }

    // Display courses on the page
    function displayCourses(coursesToDisplay) {
        courseList.innerHTML = '';
        if (!coursesToDisplay || coursesToDisplay.length === 0) {
            courseList.innerHTML = '<p>No courses match your criteria or available.</p>';
            return;
        }
        const studentsData = JSON.parse(localStorage.getItem('students')) || { students: [] };
        currentStudent = studentsData.students.find(s => s.userId === userId);

        if (!currentStudent) {
            console.warn("Student data not available for display logic.");
            return;
        }
        const studentCompletedCourses = currentStudent ?.completed_courses ?.map(c => c.course) || [];
        const studentPendingCourses = currentStudent ?.pending_registrations ?.map(r => r.courseId) || [];



        coursesToDisplay.forEach(course => {


            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            let classesHTML = '';
            if (course.classes && course.classes.length > 0) {
                classesHTML += '<h4>Available Classes:</h4>';
                course.classes.forEach(cls => {
                    const enrollmentCount = getClassEnrollmentCount(course.id, cls.id);
                    const isFull = enrollmentCount >= cls.capacity;
                    const isCompleted = studentCompletedCourses.includes(course.id);
                    const isPending = studentPendingCourses.includes(course.id);
                    let buttonText = "Register";
                    let buttonDisabled = false;
                    let buttonStyle = "background-color:rgb(0, 170, 255); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;"; // Default style

                    if (isCompleted) {
                        buttonText = "Completed";
                        buttonDisabled = true;
                        buttonStyle = "background-color:#cccccc; color: #666; border: none; padding: 10px 15px; border-radius: 5px; cursor: not-allowed;";
                    } else if (isPending) {
                        buttonText = "Pending";
                        buttonDisabled = true; // Disable if pending for the course
                        buttonStyle = "background-color:#ffcc00; color: #333; border: none; padding: 10px 15px; border-radius: 5px; cursor: not-allowed;";
                    } else if (isFull) {
                        buttonText = "Class Full";
                        buttonDisabled = true;
                        buttonStyle = "background-color:#cccccc; color: #666; border: none; padding: 10px 15px; border-radius: 5px; cursor: not-allowed;";
                    }
                    if (!buttonDisabled) {
                        const prerequisitesMet = checkPrerequisites(course.id);
                        if (!prerequisitesMet) {
                            buttonText = "Prereq. Not Met";
                            buttonDisabled = true;
                            buttonStyle = "background-color:#ff9999; color: #333; border: none; padding: 10px 15px; border-radius: 5px; cursor: not-allowed;";
                        }
                    }


                    classesHTML += `
                        <div class="class-info" style="border: 1px solid #eee; padding: 10px; margin-top: 10px; border-radius: 4px;">
                            <p><strong>Instructor:</strong> ${cls.instructor}</p>
                            <p><strong>Schedule:</strong> ${cls.schedule}</p>
                            <p><strong>Seats:</strong> ${enrollmentCount}/${cls.capacity}</p>
                            <button class="register-class-btn"
                                data-course-id="${course.id}"
                                data-class-id="${cls.id}"
                                data-capacity="${cls.capacity}"
                                style="${buttonStyle}"
                                ${buttonDisabled ? 'disabled' : ''}>
                                ${buttonText}
                            </button>
                        </div>
                    `;
                });
            } else {
                classesHTML = '<p>No classes currently scheduled for this course.</p>';
            }
            // Add prerequisites display
            let prereqText = 'None';
            if (course.prerequisites && course.prerequisites.length > 0 && !(course.prerequisites.length === 1 && course.prerequisites[0] === '')) {
                prereqText = course.prerequisites.join(', ');
            }


            courseCard.innerHTML = `
                <h3>${course.name} (${course.id})</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p><strong>Description:</strong> ${course.description}</p>
                 <p><strong>Prerequisites:</strong> ${prereqText}</p>
                 <p><strong>Open for Registration:</strong> ${course.open_for_registration ? 'Yes' : 'No'}</p> ${classesHTML}
            `;
            if (course.open_for_registration) {
                courseList.appendChild(courseCard);
            } else {

            }
        });

        document.querySelectorAll('.register-class-btn').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', handleClassRegistration);
            }
        });
    }

    function checkPrerequisites(courseId) {
        if (!currentStudent) return false;

        const selectedCourse = allCourses.find(c => c.id === courseId);
        if (!selectedCourse) return false; // Course not found


        if (!selectedCourse.prerequisites || selectedCourse.prerequisites.length === 0 || (selectedCourse.prerequisites.length === 1 && selectedCourse.prerequisites[0] === '')) {
            return true;
        }

        const completedCourseIds = currentStudent.completed_courses ?.map(c => c.course) || [];
        return selectedCourse.prerequisites.every(prereq => completedCourseIds.includes(prereq.trim()));
    }

    function handleClassRegistration(event) {
        if (!currentStudent) {
            showNotification("Cannot register, student data not loaded.", true);
            return;
        }

        const button = event.target;
        const courseId = button.dataset.courseId;
        const classId = button.dataset.classId;
        const classCapacity = parseInt(button.dataset.capacity, 10);

        const enrollmentCount = getClassEnrollmentCount(courseId, classId);
        if (enrollmentCount >= classCapacity) {
            showNotification("Class is full. Registration failed.", true);
            button.textContent = "Class Full";
            button.disabled = true;
            return;
        }

        const hasCompleted = currentStudent.completed_courses ?.some(c => c.course === courseId);
        if (hasCompleted) {
            showNotification("You have already completed this course.", true);
            button.textContent = "Completed";
            button.disabled = true;
            return;
        }



        const isPending = currentStudent.pending_registrations ?.some(r => r.courseId === courseId);
        if (isPending) {
            showNotification("You already have a pending registration for this course.", true);
            button.textContent = "Pending";
            button.disabled = true;
            return;
        }

        // --- Prerequisite Check ---
        if (!checkPrerequisites(courseId)) {
            showNotification("You have not met the prerequisites for this course.", true);
            button.textContent = "Prereq. Not Met";
            button.disabled = true;
            return;
        }

        // Retrieve the latest student data from localStorage
        const currentStudentsData = JSON.parse(localStorage.getItem('students')) || { students: [] };
        const studentIndex = currentStudentsData.students.findIndex(s => s.userId === userId);

        if (studentIndex === -1) {
            showNotification("Error finding your student record for saving.", true);
            return;
        }
        if (!currentStudentsData.students[studentIndex].pending_registrations) {
            currentStudentsData.students[studentIndex].pending_registrations = [];
        }
        // add to pending registrations
        currentStudentsData.students[studentIndex].pending_registrations.push({
            courseId: courseId,
            classId: classId,
            status: "Pending",
            timestamp: new Date().toISOString()
        });

        // Update student data in localStorage
        localStorage.setItem('students', JSON.stringify(currentStudentsData));

        currentStudent = currentStudentsData.students[studentIndex];



        const selectedCourse = allCourses.find(c => c.id === courseId);
        showNotification(`Registration request submitted for ${selectedCourse?.name || courseId}. Status: Pending.`);


        displayCourses(allCourses);

    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.display = "block";
        notification.classList.remove("error-notification", "success-notification");

        if (isError) {
            notification.classList.add("error-notification");
            notification.style.backgroundColor = '#f44336';
        } else {
            notification.classList.add("success-notification");
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
        }
        setTimeout(() => {
            notification.style.display = "none";
        }, 5000);
    }

    // Handle logout
    function handleLogout() {
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('studentId');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('instructorName');
        sessionStorage.removeItem('instructorId');

        showNotification("You have been logged out.");
        setTimeout(() => {
            window.location.href = "login.html"; // Redirect to login page
        }, 1500);


    }
    //Event Listeners
    searchInput.addEventListener('input', handleSearch);
    logoutButton.addEventListener('click', handleLogout);
    initializeApp(); // Start the application

});

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');

            if (!username || !password) {
                errorMessage.textContent = 'Please enter both username and password.';
                errorMessage.style.display = 'block';
                return;
            }
            errorMessage.style.display = 'none';
            try {
                const response = await fetch('users.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Find user
                const user = data.users.find(user => user.username === username && user.password === password);

                if (user) {
                    console.log("Login successful for:", user.username, "Role:", user.role, "ID:", user.id);
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('userRole', user.role);
                    localStorage.setItem('userId', user.id);

                    sessionStorage.setItem('userId', user.id);
                    sessionStorage.setItem('userRole', user.role);
                    if (user.role === "admin") {
                        window.location.href = 'admin.html';
                    } else if (user.role === "student") {
                        // Fetch student details to get the student id
                        try {
                            const studentResponse = await fetch('students.json');
                            if (!studentResponse.ok) throw new Error('Failed to fetch student details');
                            const studentData = await studentResponse.json();
                            const student = studentData.students.find(s => s.userId === user.id);
                            if (student) {
                                localStorage.setItem('studentId', student.id);
                                console.log("Student ID found and stored:", student.id);
                            } else {
                                console.warn("Could not find matching student record for userId:", user.id);
                                errorMessage.textContent = 'Login successful, but student record not found.';
                                errorMessage.style.display = 'block';
                                return;
                            }
                            localStorage.setItem('students', JSON.stringify(studentData));


                        } catch (studentError) {
                            console.error("Error fetching student details:", studentError);
                            errorMessage.textContent = 'Login successful, but failed to load student details.';
                            errorMessage.style.display = 'block';
                            return;
                        }

                        window.location.href = 'main.html'; // Redirect student to main course page
                    } else if (user.role === "instructor") {
                        if (user.name) {
                            sessionStorage.setItem('instructorName', user.name);
                            console.log("Instructor Name stored:", user.name);
                        }
                        sessionStorage.setItem('instructorId', user.id); // Store instructor ID in session
                        window.location.href = 'instructor.html';
                    } else {
                        console.warn("Unknown user role:", user.role);
                        errorMessage.textContent = 'Login successful, but role is undefined.';
                        errorMessage.style.display = 'block';
                    }

                } else {
                    // Invalid login information
                    console.log("Login failed for username:", username);
                    errorMessage.textContent = 'Invalid username or password.';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Login process error:', error);
                errorMessage.textContent = 'An error occurred during login. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    } else {
        console.log("Login form not found on this page.");
    }
});