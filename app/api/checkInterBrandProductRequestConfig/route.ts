import { NextResponse } from 'next/server';

export async function POST() {
  // Returns 1 (allowed within brand) or -1 (inter-brand allowed)
  return new NextResponse('1', {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function GET() {
  return new NextResponse('1', {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
