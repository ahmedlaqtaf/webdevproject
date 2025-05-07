import { getCourseCountByCategory } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getCourseCountByCategory();
  return NextResponse.json(result);
}