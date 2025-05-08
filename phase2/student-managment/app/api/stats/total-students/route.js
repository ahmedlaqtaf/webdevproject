import statisticsRepo from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const count = await statisticsRepo.getTotalStudents();
  return NextResponse.json({ count });
}