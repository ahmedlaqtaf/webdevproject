import { getCoursesWithMostFailures } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getCoursesWithMostFailures();
  return NextResponse.json(result);
}