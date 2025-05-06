import { NextResponse } from 'next/server';
import AdminRepo from '../../../../../lib/repository/adminRepo';

const adminRepo = new AdminRepo();

export async function GET(request, { params }) {
    try {
        const id = params.id;
        const admin = await adminRepo.findById(id);

        if (!admin) {
            return NextResponse.json(
                { error: "Admin not found =(" },
                { status: 404 }
            )   
        }

        return NextResponse.json(admin);

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch admin =(", details: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const id = params.id;
        const adminData = await request.json();
        const updatedAdmin = await adminRepo.update(id, adminData);
        return NextResponse.json(updatedAdmin);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update admin =(", details: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        const id = params.id;
        await adminRepo.delete(id);
        return NextResponse.json(
            { message: "Admin deleted successfully =)" },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete admin", details: error.message },
            { status: 500 }
        )
    }
}


