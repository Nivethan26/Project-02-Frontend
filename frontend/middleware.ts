import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Remove middleware authentication since we're using localStorage
  return NextResponse.next();
}

export const config = {
  matcher: ['/upload-prescription/:path*', '/dashboard/:path*'],
}; 