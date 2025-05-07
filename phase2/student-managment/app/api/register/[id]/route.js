import { NextResponse } from 'next/server';
import RegistrationRepo from '../../../../lib/repository/registrationRepo';

export async function GET(request, { params }) {
  const { id } = params;
  const registration = await RegistrationRepo.findById(id);
  return NextResponse.json(registration);
}

export async function PUT(request, { params }) {
  const { id } = params;
  const registrationData = await request.json();
  const registration = await RegistrationRepo.update(id, registrationData);
  return NextResponse.json(registration);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const registration = await RegistrationRepo.delete(id);
  return NextResponse.json(registration);
}