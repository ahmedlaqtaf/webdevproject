import { NextResponse } from 'next/server';
import StudentRepo from '@/lib/repository/studentRepo';

const studentRepo = new StudentRepo();

export async function GET() {
    try {
        const students = await studentRepo.findAll();
        return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch students =*", details: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const studentData = await request.json();

        // Correct Prisma create method call
        const student = await studentRepo.create({
            data: {
                id: studentData.id, // id field directly here
                name: studentData.name,
                userId: studentData.userId,
                completedCourses: { // Correctly map completedCourses field
                    create: studentData.completedCourses.map(course => ({
                        course: course.course,
                        grade: course.grade,
                    })),
                },
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to create student',
            details: error.message,
        }, { status: 500 });
    }
}