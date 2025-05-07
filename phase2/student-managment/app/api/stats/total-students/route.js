import { getTotalStudents } from '@/lib/repository/statisticsRepo';
import { NextResponse } from 'next/server';

export async function GET() {
  const count = await getTotalStudents();
  return NextResponse.json({ count });
}