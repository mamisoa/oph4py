import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import type { UuidResponse, APIResponse } from '@/lib/types/api';

/**
 * GET handler for generating a unique UUID
 * Mirrors py4web's api/uuid endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Get the pathname to determine what utility function to call
    const pathname = request.nextUrl.pathname;
    
    // UUID generation
    if (pathname.endsWith('/api/utils') || pathname.endsWith('/api/utils/uuid')) {
      const unique_id = randomUUID().replace(/-/g, ''); // Remove hyphens to match py4web's format
      
      const response: APIResponse<UuidResponse> = {
        status: 'success',
        message: 'UUID generated successfully',
        data: { unique_id }
      };
      
      return NextResponse.json(response);
    }
    
    // If endpoint not recognized
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Unknown utility endpoint',
        error_type: 'not_found' 
      }, 
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in utility endpoint:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Utility operation failed',
        error_type: 'server_error' 
      }, 
      { status: 500 }
    );
  }
} 