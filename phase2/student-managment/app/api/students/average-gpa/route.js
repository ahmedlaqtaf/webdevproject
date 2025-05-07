import { NextResponse } from "next/server";
import StudentRepo from "../../../../lib/repository/studentRepo";

const studentRepo = new StudentRepo();

export async function GET() {
  const averageGPA = await studentRepo.getAverageStudentsGPA();
  return NextResponse.json(averageGPA);
}
