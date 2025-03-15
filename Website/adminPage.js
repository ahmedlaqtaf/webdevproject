document.getElementById('courseForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const courseData = {
    id: document.getElementById('id').value,
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    prerequisites: document.getElementById('prerequisites').value.split(',').map(item => item.trim()),
    open_for_registration: document.getElementById('open_for_registration').value === 'true',
    status: document.getElementById('status').value
  };

  // Load existing courses from localStorage (if any)
  let courses = JSON.parse(localStorage.getItem('courses')) || { courses: [] };

  // Append the new course
  courses.courses.push(courseData);

  // Save the updated courses to localStorage
  localStorage.setItem('courses', JSON.stringify(courses));

  // Reset the form
  document.getElementById('courseForm').reset();

  alert('Course Added Successfully!');
});