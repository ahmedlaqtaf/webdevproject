document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const courseList = document.getElementById('courseList');
    const notification = document.getElementById('notification');
    const logoutButton = document.getElementById('logoutButton');

    let allCourses = [];
    let currentStudent = null; // Store the logged-in student's data

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole'); // Use sessionStorage as fallback

    if (!userId) {
        showNotification("Please log in first.", true);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
        return;
    }

    console.log("Logged in user ID:", userId); // Debugging

    // Function to get enrollment count for a specific class from localStorage
    function getClassEnrollmentCount(courseId, classId) {
        const enrollmentKey = `enrollment_${courseId}_${classId}`;
        // Assuming enrollment data stores an array of student IDs or objects
        const enrollment = JSON.parse(localStorage.getItem(enrollmentKey)) || [];
        return enrollment.length;
    }

    // Fetch necessary data and initialize the application
    async function initializeApp() {
        try {
            // Fetch courses and student data in parallel
            const [coursesResponse, studentsResponse] = await Promise.all([
                fetch('courses.json'),
                fetch('students.json') // Fetch student data
            ]);

            if (!coursesResponse.ok || !studentsResponse.ok) {
                throw new Error('Failed to fetch initial data.');
            }

            const [coursesData, studentData] = await Promise.all([
                coursesResponse.json(),
                studentsResponse.json()
            ]);

            // Find the currently logged-in student
            currentStudent = studentData.students.find(student => student.userId === userId);
            // In the initializeApp function, after finding currentStudent
            if (currentStudent) {
                console.log("Current student data loaded:", currentStudent);
                console.log("Pending registrations:", currentStudent.pending_registrations);
            }
            if (!currentStudent) {
                // Attempt to load from localStorage if fetch fails or student not found initially
                const localStudents = JSON.parse(localStorage.getItem('students'));
                if (localStudents && localStudents.students) {
                    currentStudent = localStudents.students.find(student => student.userId === userId);
                }
                if (!currentStudent) {
                    console.error("Student record not found for userId:", userId);
                    showNotification("Failed to load your student data. Logging out.", true);
                    setTimeout(handleLogout, 2000); // Logout if student data crucial and missing
                    return; // Stop execution if student data is essential and not found
                } else {
                    console.log("Found student from localStorage:", currentStudent);
                }

            } else {
                console.log("Found student from students.json:", currentStudent);
                // Save fetched student data to localStorage for persistence if needed
                localStorage.setItem('students', JSON.stringify(studentData)); // Save all students data
            }


            // --- Course Merging Logic ---
            const localStorageCourses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };
            let mergedCourses = [...coursesData.courses]; // Start with fetched courses

            // Create a map for quick lookup of fetched courses by ID
            const fetchedCourseMap = new Map(mergedCourses.map(course => [course.id, course]));

            localStorageCourses.courses.forEach(localCourse => {
                const existingCourse = fetchedCourseMap.get(localCourse.id);
                if (existingCourse) {
                    // Merge classes: Add classes from local storage only if they don't exist in fetched data
                    const existingClassIds = new Set(existingCourse.classes.map(cls => cls.id));
                    localCourse.classes.forEach(localClass => {
                        if (!existingClassIds.has(localClass.id)) {
                            existingCourse.classes.push(localClass);
                            console.log(`Merged class ${localClass.id} into course ${existingCourse.id}`);
                        }

                    });
                } else {
                    // Add course from local storage if it wasn't in the fetched data
                    mergedCourses.push(localCourse);
                    fetchedCourseMap.set(localCourse.id, localCourse); // Add to map
                    console.log(`Added course ${localCourse.id} from localStorage`);
                }
            });

            allCourses = mergedCourses;
            // Save the potentially merged course list back to localStorage
            localStorage.setItem('courses', JSON.stringify({ courses: allCourses }));
            // --- End Course Merging Logic ---


            displayCourses(allCourses); // Initial display
        } catch (error) {
            console.error("Error loading initial data:", error);
            // Fallback to localStorage if fetch fails
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
                        // Decide if app can proceed without student data or force logout
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


    // Handle search input changes
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
        const studentCompletedCourses = currentStudent?.completed_courses?.map(c => c.course) || [];
        const studentPendingCourses = currentStudent?.pending_registrations?.map(r => r.courseId) || [];



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
                    const isPending = studentPendingCourses.includes(course.id); // Checks if pending for the *course*
                    // const isPendingThisClass = studentPendingClasses.includes(cls.id); // Check if pending for *this specific class*

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

                    // Check prerequisites *before* enabling the button if not completed/pending/full
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

        // Re-attach event listeners for the newly created buttons
        document.querySelectorAll('.register-class-btn').forEach(button => {
            // Only add listener if the button is not disabled
            if (!button.disabled) {
                button.addEventListener('click', handleClassRegistration);
            }
        });
    }

    // Function to check prerequisites
    function checkPrerequisites(courseId) {
        if (!currentStudent) return false; // Cannot check if student data is missing

        const selectedCourse = allCourses.find(c => c.id === courseId);
        if (!selectedCourse) return false; // Course not found

        // Handle cases where prerequisites might be null, undefined, or an empty array, or an array with just an empty string
        if (!selectedCourse.prerequisites || selectedCourse.prerequisites.length === 0 || (selectedCourse.prerequisites.length === 1 && selectedCourse.prerequisites[0] === '')) {
            return true; // No prerequisites needed
        }

        const completedCourseIds = currentStudent.completed_courses ?.map(c => c.course) || [];
        return selectedCourse.prerequisites.every(prereq => completedCourseIds.includes(prereq.trim())); // Trim whitespace just in case
    }


    // Handle the click on a register button
    function handleClassRegistration(event) {
        if (!currentStudent) {
            showNotification("Cannot register, student data not loaded.", true);
            return;
        }

        const button = event.target;
        const courseId = button.dataset.courseId;
        const classId = button.dataset.classId;
        const classCapacity = parseInt(button.dataset.capacity, 10); // Get capacity from data attribute

        // --- Double checks (although UI should prevent clicks on disabled buttons) ---
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
        // --- End Checks ---


        // --- Proceed with Registration Logic ---

        // Retrieve the latest student data from localStorage before modifying
        const currentStudentsData = JSON.parse(localStorage.getItem('students')) || { students: [] };
        const studentIndex = currentStudentsData.students.findIndex(s => s.userId === userId);

        if (studentIndex === -1) {
            showNotification("Error finding your student record for saving.", true);
            return; // Stop if the student can't be found in the storage to update
        }

        // Initialize pending_registrations if it doesn't exist
        if (!currentStudentsData.students[studentIndex].pending_registrations) {
            currentStudentsData.students[studentIndex].pending_registrations = [];
        }


        // Add to pending registrations
        currentStudentsData.students[studentIndex].pending_registrations.push({
            courseId: courseId,
            classId: classId,
            status: "Pending",
            timestamp: new Date().toISOString()
        });

        // Update student data in localStorage
        localStorage.setItem('students', JSON.stringify(currentStudentsData));

        // Update the global currentStudent variable to reflect the change immediately in the UI
        currentStudent = currentStudentsData.students[studentIndex];



        const selectedCourse = allCourses.find(c => c.id === courseId); // Get course name for notification
        showNotification(`Registration request submitted for ${selectedCourse?.name || courseId}. Status: Pending.`);


        displayCourses(allCourses);


    }

    // Show notification messages
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.display = "block";
        notification.classList.remove("error-notification", "success-notification"); // Remove previous classes

        if (isError) {
            notification.classList.add("error-notification");
            notification.style.backgroundColor = '#f44336'; // Red for error
        } else {
            notification.classList.add("success-notification");
            notification.style.backgroundColor = '#4CAF50'; // Green for success/info
        }
        notification.style.color = 'white';


        // Automatically hide the notification after 5 seconds
        setTimeout(() => {
            notification.style.display = "none";
        }, 5000);
    }

    // Handle logout
    function handleLogout() {
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('studentId'); // Make sure studentId is cleared
        // Consider clearing sessionStorage too if used
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('instructorName'); // Clear instructor specific data too
        sessionStorage.removeItem('instructorId');

        showNotification("You have been logged out.");
        setTimeout(() => {
            window.location.href = "login.html"; // Redirect to login page
        }, 1500); // Delay redirection slightly
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', handleSearch); // Use 'input' for real-time filtering
    logoutButton.addEventListener('click', handleLogout);

    // --- Initial Load ---
    initializeApp(); // Start the application

}); // End DOMContentLoaded for main app logic

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value; // No trim on password typically
            const errorMessage = document.getElementById('error-message');

            // Basic validation
            if (!username || !password) {
                errorMessage.textContent = 'Please enter both username and password.';
                errorMessage.style.display = 'block';
                return;
            }


            errorMessage.style.display = 'none'; // Hide error initially

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
                    // --- Use localStorage for persistence across browser sessions ---
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('userRole', user.role);
                    localStorage.setItem('userId', user.id);

                    sessionStorage.setItem('userId', user.id);
                    sessionStorage.setItem('userRole', user.role);


                    // Redirect based on role
                    if (user.role === "admin") {
                        window.location.href = 'admin.html';
                    } else if (user.role === "student") {
                        // Fetch student details to get the student-specific ID (like "202501234")
                        try {
                            const studentResponse = await fetch('students.json');
                            if (!studentResponse.ok) throw new Error('Failed to fetch student details');
                            const studentData = await studentResponse.json();
                            const student = studentData.students.find(s => s.userId === user.id);
                            if (student) {
                                localStorage.setItem('studentId', student.id); // Store the specific student ID
                                console.log("Student ID found and stored:", student.id);
                            } else {
                                console.warn("Could not find matching student record for userId:", user.id);
                                // Decide how to handle this - maybe prevent login or show warning
                                errorMessage.textContent = 'Login successful, but student record not found.';
                                errorMessage.style.display = 'block';
                                return; // Prevent redirect if student record is essential
                            }
                            // Store fetched student data in localStorage for the main app to use
                            localStorage.setItem('students', JSON.stringify(studentData));


                        } catch (studentError) {
                            console.error("Error fetching student details:", studentError);
                            errorMessage.textContent = 'Login successful, but failed to load student details.';
                            errorMessage.style.display = 'block';
                            return; // Prevent redirect if details are needed immediately
                        }

                        window.location.href = 'main.html'; // Redirect student to main course page
                    } else if (user.role === "instructor") {
                        // Store instructor name if available and needed for the dashboard
                        if (user.name) {
                            sessionStorage.setItem('instructorName', user.name);
                            console.log("Instructor Name stored:", user.name);
                        }
                        sessionStorage.setItem('instructorId', user.id); // Store instructor ID in session
                        window.location.href = 'instructor.html';
                    } else {
                        // Handle unknown roles or default redirect
                        console.warn("Unknown user role:", user.role);
                        errorMessage.textContent = 'Login successful, but role is undefined.';
                        errorMessage.style.display = 'block';
                        // window.location.href = 'defaultDashboard.html'; // Example default
                    }

                } else {
                    // Invalid credentials
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
        console.log("Login form not found on this page."); // Debugging message
    }
}); // End DOMContentLoaded for login logic