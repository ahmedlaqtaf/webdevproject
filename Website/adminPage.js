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

    // Get the course data from the form
    const courseData = {
      id: document.getElementById('id').value,
      name: document.getElementById('name').value,
      category: document.getElementById('category').value,
      description: document.getElementById('description').value,
      prerequisites: document.getElementById('prerequisites').value.split(',').map(item => item.trim()),
      open_for_registration: document.getElementById('open_for_registration').value === 'true',
      status: "pending"
    };

    courses.courses.push(courseData);


    localStorage.setItem('courses', JSON.stringify(courses));
    courseForm.reset();
    courseFormContainer.classList.add('hidden');
    displayCourses(courses.courses);
  });

  function displayCourses(courses) {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    courses.forEach(course => {
      const courseCard = document.createElement('div');
      courseCard.classList.add('course-card');
      courseCard.innerHTML = `
        <h3>${course.name} (${course.id})</h3>
        <p><strong>Category:</strong> ${course.category}</p>
        <p>${course.description}</p>
        <p><strong>Status:</strong> ${course.status}</p>
        <p><strong>Open for Registration:</strong> ${course.open_for_registration ? 'Yes' : 'No'}</p>
      `;
      courseList.appendChild(courseCard);
    });
  }
});