import statisticsRepo from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await statisticsRepo.getPassCountPerCourse();
  return NextResponse.json(result);
}