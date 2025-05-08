import statisticsRepo from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await statisticsRepo.getCourseStatusCounts();
  return NextResponse.json(result);
}