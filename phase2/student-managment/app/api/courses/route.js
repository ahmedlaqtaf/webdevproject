import CourseRepo from "../../../lib/repository/courseRepo";
import { NextResponse } from "next/server";

const courseRepo = new CourseRepo();

export async function GET() {
  try {
    const courses = await courseRepo.findAll();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses =*", details: error.message }, { status: 500 });
  }
}