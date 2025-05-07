import RegistrationRepo from '../../../lib/repository/registrationRepo';

const registrationRepo = new RegistrationRepo();

export async function POST(req) {
  const body = await req.json();
  const { studentId, classId } = body;

  try {
    const result = await registrationRepo.registerStudentToClass(studentId, classId);
    return Response.json({ success: true, data: result });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 400 });
  }
}