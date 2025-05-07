import { getStudentCountPerClass } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getStudentCountPerClass();
  return NextResponse.json(result);
}