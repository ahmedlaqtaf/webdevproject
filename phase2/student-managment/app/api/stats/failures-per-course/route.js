import { getFailureCountPerCourse } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getFailureCountPerCourse();
  return NextResponse.json(result);
}