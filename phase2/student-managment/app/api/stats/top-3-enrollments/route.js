import statisticsRepo from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await statisticsRepo.getTop3CoursesByEnrollment();
  return NextResponse.json(result);
}