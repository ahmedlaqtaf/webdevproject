document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const coursesDropdown = document.getElementById('coursesDropdown');
    const courseList = document.getElementById('courseList');

    // Fetch courses from JSON
    fetch('courses.json')
        .then(response => response.json())
        .then(data => {
            const courses = data.courses;

            // Populate dropdown
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                coursesDropdown.appendChild(option);
            });

            // Initial display of all courses
            displayCourses(courses);

            // Search functionality
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredCourses = courses.filter(course =>
                    course.name.toLowerCase().includes(searchTerm) ||
                    course.category.toLowerCase().includes(searchTerm)
                );
                displayCourses(filteredCourses);
            });
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            courseList.innerHTML = '<p>Error loading courses. Please try again later.</p>';
        });

    function displayCourses(courses) {
        courseList.innerHTML = ''; // Clear previous results

        if (courses.length === 0) {
            courseList.innerHTML = '<p>No courses found.</p>';
            return;
        }

        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');
            courseCard.innerHTML = `
                <h3>${course.name} (${course.id})</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p>${course.description}</p>
            `;
            courseList.appendChild(courseCard);
        });
    }
});