document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const courseList = document.getElementById('courseList');
    const instructorModal = document.getElementById('instructorModal');
    const instructorList = document.getElementById('instructorList');
    const courseTitle = document.getElementById('courseTitle');
    const notification = document.getElementById('notification');

    // Get logged-in student ID from sessionStorage
    const studentId = sessionStorage.getItem('studentId');

    

    if (!studentId) {
        showNotification("Please log in first.", true);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
        return;
    }

    let completedCourses = [];
    let pendingRegistrations = JSON.parse(sessionStorage.getItem('pendingRegistrations')) || [];
    let allCourses = [];
    let allInstructors = [];
    let selectedCourseId = null;
    let studentData = null;

    // Fetch student data
fetch('students.json')
.then(response => response.json())
.then(data => {
    const student = data.students.find(s => s.userId === studentId);

    if (student) {
        studentData = student;
        completedCourses = student.completed_courses ? 
        student.completed_courses.map(course => course.course) : [];
        
        // Display student name in header
        const title = document.getElementById('title');
        title.textContent = `Qu Student Registration - Welcome, ${student.name}`;
    }
})
.catch(error => {
    console.error("Error loading student data:", error);
    showNotification("Error loading student data. Please try again.", true);
});

    // Fetch instructors data
    fetch('instructors.json')
        .then(response => response.json())
        .then(data => {
            allInstructors = data.instructors;
        })
        .catch(error => {
            console.error("Error loading instructors data:", error);
        });

    // Fetch courses from JSON
    fetch('courses.json')
        .then(response => response.json())
        .then(data => {
            allCourses = data.courses;
            displayCourses(allCourses);

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredCourses = allCourses.filter(course =>
                    course.name.toLowerCase().includes(searchTerm) ||
                    course.category.toLowerCase().includes(searchTerm)
                );
                displayCourses(filteredCourses);
            });
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            courseList.innerHTML = '<p>Error loading courses. Please try again later.</p>';
            showNotification("Error loading courses. Please try again.", true);
        });

    // Display the courses
    function displayCourses(courses) {
        courseList.innerHTML = '';

        if (courses.length === 0) {
            courseList.innerHTML = '<p>No courses found.</p>';
            return;
        }

        courses.forEach(course => {
            // Check prerequisites
            const prerequisitesMet = course.prerequisites ? 
                course.prerequisites.every(p => completedCourses.includes(p)) : true;
            
            // Check if course is open
            const isOpen = course.open_for_registration;
            
            // Check if already registered or pending
            const isPending = pendingRegistrations.some(reg => reg.courseId === course.id);
            const isRegistered = completedCourses.includes(course.id) || isPending;
            
            // Determine if student can register
            const canRegister = prerequisitesMet && isOpen && !isRegistered;
            
            let buttonText = "Register";
            let buttonDisabled = !canRegister;
            let statusMessage = "";
            
            if (isPending) {
                buttonText = "Pending";
                statusMessage = "<span class='status-pending'>Pending</span>";
            } else if (isRegistered) {
                buttonText = "Already Registered";
            } else if (!isOpen) {
                buttonText = "Registration Closed";
            } else if (!prerequisitesMet) {
                buttonText = "Prerequisites Not Met";
            }

            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');
            
            // Format prerequisites for display
            let prerequisitesDisplay = "";
            if (course.prerequisites && course.prerequisites.length > 0) {
                prerequisitesDisplay = `<p><strong>Prerequisites:</strong> ${course.prerequisites.join(", ")}</p>`;
            }

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

        // Register button event listener
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const courseId = event.target.dataset.courseId;
                selectedCourseId = courseId;
                openInstructorModal(courseId);
            });
        });
    }

    // Show notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.display = "block";
        
        if (isError) {
            notification.classList.add("error-notification");
        } else {
            notification.classList.remove("error-notification");
        }
        
        setTimeout(() => {
            notification.style.display = "none";
        }, 5000);
    }


    const learningPathElement = document.getElementById('learningPath');
    if (learningPathElement) {
        initializeLearningPath();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const navTabs = document.getElementById('navTabs');
        const mainContent = document.getElementById('mainContent');
        const courseListSection = document.getElementById('courseList');
        const learningPathSection = document.getElementById('learningPath');
    
        // Tab switching functionality
        navTabs.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-link')) {
                const tab = event.target.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById(tab).style.display = 'block';
            }
        });
        
    
        // Function to display learning path
        function displayLearningPath() {
            const completedCoursesList = document.getElementById('completedCoursesList');
            const pendingCoursesList = document.getElementById('pendingCoursesList');
            const recommendedCoursesList = document.getElementById('recommendedCoursesList');
    
            // Display completed courses
            completedCoursesList.innerHTML = completedCourses.map(courseId => {
                const course = allCourses.find(c => c.id === courseId);
                return course ? `<li>${course.name} (${course.id})</li>` : '';
            }).join('');
    
            // Display pending courses
            pendingCoursesList.innerHTML = pendingRegistrations.map(reg => {
                const course = allCourses.find(c => c.id === reg.courseId);
                return course ? `<li>${course.name} (${course.id}) - Pending Approval</li>` : '';
            }).join('');
    
            // Display recommended courses
            const recommendedCourses = allCourses.filter(course => {
                const prerequisitesMet = course.prerequisites ? 
                    course.prerequisites.every(p => completedCourses.includes(p)) : true;
                const isRegistered = completedCourses.includes(course.id) || pendingRegistrations.some(reg => reg.courseId === course.id);
                return prerequisitesMet && !isRegistered && course.open_for_registration;
            });
    
            recommendedCoursesList.innerHTML = recommendedCourses.map(course => {
                return `<li>${course.name} (${course.id})</li>`;
            }).join('');
        }
    
        // Call displayLearningPath when the Learning Path tab is clicked
        document.querySelector('[data-tab="learningPath"]').addEventListener('click', displayLearningPath);
    });

    // Logout button functionality
    document.getElementById("logoutButton").addEventListener("click", function() {
        sessionStorage.removeItem('studentId');
        showNotification("You have been logged out.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
});