import { getClassCountPerInstructor } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getClassCountPerInstructor();
  return NextResponse.json(result);
}