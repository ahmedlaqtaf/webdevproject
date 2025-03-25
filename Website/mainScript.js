document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const courseList = document.getElementById('courseList');
    const notification = document.getElementById('notification');
    const learningPathElement = document.getElementById('learningPath');
    const logoutButton = document.getElementById('logoutButton');

    let completedCourses = [];
    let allCourses = [];
    const studentId = sessionStorage.getItem('studentId');
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

if (!studentId) {
        showNotification("Please log in first.", true);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
        return;
    }

    // Fetch student data and initialize courses
    async function initializeApp() {
        try {
            const studentResponse = await fetch('students.json');
            if (!studentResponse.ok) throw new Error("Failed to fetch students.json");

            const userResponse = await fetch('users.json');
            if (!userResponse.ok) throw new Error("Failed to fetch users.json");

            const studentData = await studentResponse.json();
            const userData = await userResponse.json();


            console.log("Student data:", studentData); 
            const student = studentData.students.find(student => student.userId === userResponse.id);

            if (student) {
                completedCourses = student.completed_courses.map(course => course.course);
            }

            const coursesResponse = await fetch('courses.json');
            const coursesData = await coursesResponse.json();
            console.log("Courses data:", coursesData);

            allCourses = coursesData.courses;

            displayCourses(allCourses);
        } catch (error) {
            console.error("Error loading data:", error);
            showNotification(error,"Error loading data. Please try again.", true);
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
            const prerequisitesMet = course.prerequisites ?
                course.prerequisites.every(p => completedCourses.includes(p)) : true;
            const isOpen = course.open_for_registration;
            const isRegistered = completedCourses.includes(course.id);
            const canRegister = prerequisitesMet && isOpen && !isRegistered;

            let buttonText = "Register";
            let buttonDisabled = !canRegister;
            let statusMessage = "";

             if (isRegistered) {
                buttonText = "Already Registered";
            } else if (!isOpen) {
                buttonText = "Registration Closed";
            } else if (!prerequisitesMet) {
                buttonText = "Prerequisites Not Met";
            }

            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            const prerequisitesDisplay = course.prerequisites && course.prerequisites.length > 0 ?
                `<p><strong>Prerequisites:</strong> ${course.prerequisites.join(", ")}</p>` : '';

            courseCard.innerHTML = `
                <h3>${course.name} (${course.id})</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p>${course.description}</p>
                ${prerequisitesDisplay}
                <button class="register-btn" data-course-id="${course.id}" ${buttonDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
                ${statusMessage}
            `;

            courseList.appendChild(courseCard);
        });

        // Add event listeners to register buttons
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const courseId = event.target.dataset.courseId;
                handleCourseRegistration(courseId);
            });
        });
    }



    // Show notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.display = "block";
        notification.classList.toggle("error-notification", isError);

        setTimeout(() => {
            notification.style.display = "none";
        }, 5000);
    }

    // Initialize learning path
    function initializeLearningPath() {
        const completedCoursesList = document.getElementById('completedCoursesList');
        const recommendedCoursesList = document.getElementById('recommendedCoursesList');

        completedCoursesList.innerHTML = completedCourses.map(courseId => {
            const course = allCourses.find(c => c.id === courseId);
            return course ? `<li>${course.name} (${course.id})</li>` : '';
        }).join('');


        const recommendedCourses = allCourses.filter(course => {
            const prerequisitesMet = course.prerequisites ?
                course.prerequisites.every(p => completedCourses.includes(p)) : true;
            return prerequisitesMet && !isRegistered && course.open_for_registration;
        });

        recommendedCoursesList.innerHTML = recommendedCourses.map(course => {
            return `<li>${course.name} (${course.id})</li>`;
        }).join('');
    }

    // Logout functionality
    function handleLogout() {
        sessionStorage.removeItem('studentId');
        showNotification("You have been logged out.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    }

    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    logoutButton.addEventListener('click', handleLogout);

    if (learningPathElement) {
        initializeLearningPath();
    }

    // Initialize the app
    initializeApp();
});

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');

        try {
            const response = await fetch('users.json');
            const data = await response.json();
            const user = data.users.find(user => user.username === username && user.password === password);

            if (user) {
                
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
});