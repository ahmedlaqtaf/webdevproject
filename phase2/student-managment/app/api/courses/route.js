import {
  getCoursesByCategory,
  searchCoursesByName,
  getCourseById,
  getAllCourses
} from '@/lib/repository/courseRepo';


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const name = searchParams.get('search');
  const id = searchParams.get('id');

  if (id) {
    const course = await getCourseById(id);
    return Response.json(course);
  } else if (category) {
    const courses = await getCoursesByCategory(category);
    return Response.json(courses);
  } else if (name) {
    const courses = await searchCoursesByName(name);
    return Response.json(courses);
  } else {
    const courses = await getAllCourses();
    return Response.json(courses);
  }
}