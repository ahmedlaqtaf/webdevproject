import { getUnvalidatedClasses, validateClass, cancelClass } from '@/lib/repository/adminRepo';

export async function GET() {
  const classes = await getUnvalidatedClasses();
  return Response.json(classes);
}

export async function POST(req) {
  const { classId, action } = await req.json();

  if (!classId || !action) {
    return Response.json({ error: 'Missing classId or action' }, { status: 400 });
  }

  if (action === 'validate') {
    return Response.json(await validateClass(classId));
  } else if (action === 'cancel') {
    return Response.json(await cancelClass(classId));
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}