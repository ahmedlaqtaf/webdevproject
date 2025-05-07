import { getCourseStatusCounts } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getCourseStatusCounts();
  return NextResponse.json(result);
}