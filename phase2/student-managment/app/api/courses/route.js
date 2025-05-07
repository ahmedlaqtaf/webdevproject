import CourseRepo from '../../../lib/repository/courseRepo';
import { NextResponse } from 'next/server';


const courseRepo = new CourseRepo();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const name = searchParams.get('search');
  const id = searchParams.get('id');

  if (id) {
    const course = await courseRepo.getCourseById(id);
    return NextResponse.json(course);
  } else if (category) {
    const courses = await courseRepo.getCoursesByCategory(category);
    return NextResponse.json(courses);
  } else if (name) {
    const courses = await courseRepo.searchCoursesByName(name);
    return NextResponse.json(courses);
  } else {
    const courses = await courseRepo.getAllCourses();
    return NextResponse.json(courses);
  }
}