import { getTop3CoursesByEnrollment } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getTop3CoursesByEnrollment();
  return NextResponse.json(result);
}