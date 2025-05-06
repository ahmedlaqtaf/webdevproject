import { NextResponse } from 'next/server';
import StudentRepo from '../../../../lib/repository/studentRepo';

const studentRepo = new StudentRepo();

export async function GET() {
    try {
        const completedCourses = await studentRepo.getAverageStudentsCoursesCount();
        return NextResponse.json({ completedCourses });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch completed courses =.=" },
            { status: 500 }
        )
    }
}