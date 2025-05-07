import { NextResponse } from 'next/server';
import StudentRepo from '../../../../../lib/repository/studentRepo';

const studentRepo = new StudentRepo();

export async function GET(request, context) {
    try {
        const {params} = await context;
        const { id } = params;
        const completedCourse = await studentRepo.getCompletedCourses(id);
        
        if (!completedCourse) {
            return NextResponse.json({ 
                error: "Completed course not found" 
            }, { status: 404 });
        }
        
        return NextResponse.json(completedCourse);
    } catch (error) {
        console.error(`Error fetching completed course ${params.id}:`, error);
        return NextResponse.json({ 
            error: "Completed course retrieval failed", 
            details: error.message 
        }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const completedCourseData = await request.json();
        const completedCourse = await CompletedCourseRepo.update(id, completedCourseData);
        
        if (!completedCourse) {
            return NextResponse.json({ 
                error: "Completed course not found" 
            }, { status: 404 });
        }
        
        return NextResponse.json(completedCourse);
    } catch (error) {
        console.error(`Error updating completed course ${params.id}:`, error);
        return NextResponse.json({ 
            error: "Completed course update failed", 
            details: error.message 
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const completedCourse = await CompletedCourseRepo.delete(id);
        
        if (!completedCourse) {
            return NextResponse.json({ 
                error: "Completed course not found" 
            }, { status: 404 });
        }
        
        return NextResponse.json(completedCourse);
    } catch (error) {
        console.error(`Error deleting completed course ${params.id}:`, error);
        return NextResponse.json({ 
            error: "Completed course deletion failed", 
            details: error.message 
        }, { status: 500 });
    }
}