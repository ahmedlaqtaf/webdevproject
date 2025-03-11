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
    let pendingRegistrations = [];
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
                completedCourses = student.completed_courses || [];
                pendingRegistrations = student.pending_registrations || [];
                
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
                buttonText = "Pending Approval";
                statusMessage = "<span class='status-pending'>Pending Admin Approval</span>";
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

    // Open modal for instructor selection
    function openInstructorModal(courseId) {
        const course = allCourses.find(c => c.id === courseId);
        if (!course) return;

        courseTitle.textContent = `Course: ${course.name} (${course.id})`;
        
        // Filter instructors teaching this course
        const courseInstructors = allInstructors.filter(instructor => 
            instructor.courses_teaching.includes(courseId));
        
        if (courseInstructors.length === 0) {
            instructorList.innerHTML = '<p>No instructors available for this course.</p>';
            return;
        }

        instructorList.innerHTML = '';
        courseInstructors.forEach(instructor => {
            const classCapacity = instructor.class_capacity || 30; // Default capacity
            const currentStudents = instructor.current_students || [];
            const availableSeats = classCapacity - currentStudents.length;
            
            let seatsClass = "seats-available";
            if (availableSeats <= 5 && availableSeats > 0) {
                seatsClass = "seats-limited";
            } else if (availableSeats <= 0) {
                seatsClass = "seats-full";
            }

            const instructorOption = document.createElement('div');
            instructorOption.classList.add('instructor-option');
            instructorOption.innerHTML = `
                <div>
                    <strong>${instructor.name}</strong><br>
                    <small>Rating: ${instructor.rating || 'N/A'}</small>
                </div>
                <div class="${seatsClass}">
                    ${availableSeats > 0 ? availableSeats + ' seats available' : 'Full'}
                </div>
            `;
            
            if (availableSeats > 0) {
                instructorOption.addEventListener('click', () => {
                    registerCourse(courseId, instructor.id);
                    instructorModal.style.display = "none";
                });
            } else {
                instructorOption.style.opacity = "0.7";
                instructorOption.style.cursor = "not-allowed";
            }
            
            instructorList.appendChild(instructorOption);
        });
        
        instructorModal.style.display = "block";
    }

    // Register for a course
    function registerCourse(courseId, instructorId) {
        const course = allCourses.find(c => c.id === courseId);
        const instructor = allInstructors.find(i => i.id === instructorId);
        
        if (!course || !instructor) {
            showNotification("Error finding course or instructor details.", true);
            return;
        }
        
        // Check all conditions again to ensure validity
        const prerequisitesMet = course.prerequisites ? 
            course.prerequisites.every(p => completedCourses.includes(p)) : true;
        
        if (!prerequisitesMet) {
            showNotification("Cannot register: Prerequisites not met.", true);
            return;
        }
        
        if (!course.open_for_registration) {
            showNotification("Cannot register: Course is not open for registration.", true);
            return;
        }
        
        const isPending = pendingRegistrations.some(reg => reg.courseId === courseId);
        const isRegistered = completedCourses.includes(courseId) || isPending;
        
        if (isRegistered) {
            showNotification("You are already registered or have a pending registration for this course.", true);
            return;
        }
        
        // Check instructor capacity
        const classCapacity = instructor.class_capacity || 30;
        const currentStudents = instructor.current_students || [];
        const availableSeats = classCapacity - currentStudents.length;
        
        if (availableSeats <= 0) {
            showNotification("This instructor's class is full. Please select another instructor.", true);
            return;
        }
        
        // Add to pending registrations (simulating a backend operation)
        const newRegistration = {
            courseId: courseId,
            instructorId: instructorId,
            registrationDate: new Date().toISOString(),
            status: "pending"
        };
        
        // In a real app, this would be sent to a server
        pendingRegistrations.push(newRegistration);
        
        // Update the student's pending registrations in session storage (simulating)
        // In a real app, you would update the server
        sessionStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));
        
        showNotification(`Registration request for ${course.name} with ${instructor.name} has been submitted and is pending administrative approval.`);
        
        // Refresh the course list to show the updated status
        displayCourses(allCourses);
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

    // Close modal when clicking on X
    document.querySelector('.close').addEventListener('click', () => {
        instructorModal.style.display = "none";
    });

    // Close modal when clicking outside the modal
    window.addEventListener('click', (event) => {
        if (event.target === instructorModal) {
            instructorModal.style.display = "none";
        }
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