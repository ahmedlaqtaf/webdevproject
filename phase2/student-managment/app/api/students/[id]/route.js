import { NextResponse } from 'next/server';
import StudentRepo from '@/lib/repository/studentRepo';

const studentRepo = new StudentRepo();

export async function GET(request, { params }) {
    try {
        const id = params.id;
        const student = await studentRepo.findById(id);
        return NextResponse.json(student);

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch student", details: error.message }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        const id = params.id;
        const studentData = await request.json();
        const updatedStudent = await studentRepo.update(id, studentData);
        return NextResponse.json(updatedStudent);
    } catch (error) {
        return NextResponse.json({
            error: "Failed to update student",
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const id = params.id;
        await studentRepo.delete(id);
        return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            error: "Failed to delete student",
            details: error.message
        }, { status: 500 })
    }
}