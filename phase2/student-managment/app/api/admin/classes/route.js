import { NextResponse } from 'next/server';
import AdminRepo from '../../../../lib/repository/adminRepo';

const adminRepo = new AdminRepo();


export async function GET() {
  const classes = await adminRepo.getUnvalidatedClasses();
  return NextResponse.json(classes);
}


export async function GET() {
    try {
        const admins = await adminRepo.findAll();
        return NextResponse.json(admins);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch admins", details: error.message },
            { status: 500 }
        )
    }
}
export async function POST(req) {
  const { classId, action } = await req.json();

  if (!classId || !action) {
    return Response.json({ error: 'Missing classId or action' }, { status: 400 });
  }

  if (action === 'validate') {
    return Response.json(await adminRepo.validateClass(classId));
  } else if (action === 'cancel') {
    return Response.json(await adminRepo.cancelClass(classId));
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}