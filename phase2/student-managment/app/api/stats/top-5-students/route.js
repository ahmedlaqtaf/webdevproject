import { getTop5StudentsByGPA } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getTop5StudentsByGPA();
  return NextResponse.json(result);
}