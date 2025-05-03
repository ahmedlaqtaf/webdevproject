import { submitGrade } from '@/lib/repository/instructorRepo';

export async function POST(req) {
  const { studentId, classId, grade } = await req.json();

  if (!studentId || !classId || grade == null) {
    return Response.json({ error: 'Missing data' }, { status: 400 });
  }

  const updated = await submitGrade(studentId, classId, parseFloat(grade));
  return Response.json({ success: true, data: updated });
}