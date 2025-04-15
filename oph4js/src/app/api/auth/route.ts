import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import type { AuthUser, AuthUserCreateRequest, AuthUserUpdateRequest, APIResponse } from '@/lib/types/api';

/**
 * General API endpoint for database operations
 * This endpoint handles GET, POST, PUT, DELETE operations for database tables
 * Similar to the py4web api/<tablename>/ endpoint
 */

// Validation schema for auth user
const AuthUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

/**
 * GET handler to fetch users
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id') ? parseInt(searchParams.get('id') as string) : undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || undefined;
    
    // Build filter conditions
    const where: any = {};
    
    if (id) {
      where.id = id;
    }
    
    // Add search functionality
    if (search) {
      where.OR = [
        {
          first_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          last_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    // Get total count with filters
    const count = await prisma.authUser.count({
      where
    });
    
    // Get paginated data
    const users = await prisma.authUser.findMany({
      where,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        username: true,
        created_on: true,
        modified_on: true,
        created_by: true,
        modified_by: true,
        // Exclude password for security
      },
      orderBy: {
        last_name: 'asc',
      },
      take: limit,
      skip: offset,
    });
    
    const response: APIResponse<{ count: number, users: Partial<AuthUser>[] }> = {
      status: 'success',
      message: 'Users retrieved successfully',
      data: { count, users }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    
    const errorResponse: APIResponse = {
      status: 'error',
      message: 'Failed to fetch users',
      error_type: 'server_error'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST handler to create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = AuthUserSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.authUser.findFirst({
      where: {
        email: validatedData.email
      }
    });
    
    if (existingUser) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: 'Email already in use',
        error_type: 'validation_error'
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Create the user
    const user = await prisma.authUser.create({
      data: {
        ...validatedData,
        created_on: new Date(),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        username: true,
        created_on: true,
      }
    });
    
    const response: APIResponse<Partial<AuthUser>> = {
      status: 'success',
      message: 'User created successfully',
      data: user
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: 'Validation error',
        error_type: 'validation_error',
        data: error.errors
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const errorResponse: APIResponse = {
      status: 'error',
      message: 'Failed to create user',
      error_type: 'server_error'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT handler to update a user
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the ID from the request
    const userId = body.id;
    if (!userId) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: 'User ID is required',
        error_type: 'validation_error'
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await prisma.authUser.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: 'User not found',
        error_type: 'not_found'
      };
      
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    // Prepare update data (excluding id)
    const { id, ...updateData } = body;
    
    // Validate update data
    const partialSchema = AuthUserSchema.partial();
    const validatedData = partialSchema.parse(updateData);
    
    // Preserve existing password if not provided
    if (!validatedData.password) {
      delete validatedData.password;
    }
    
    // Update the user
    const updatedUser = await prisma.authUser.update({
      where: { id: userId },
      data: {
        ...validatedData,
        modified_on: new Date()
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        username: true,
        modified_on: true
      }
    });
    
    const response: APIResponse<Partial<AuthUser>> = {
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: 'Validation error',
        error_type: 'validation_error',
        data: error.errors
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const errorResponse: APIResponse = {
      status: 'error',
      message: 'Failed to update user',
      error_type: 'server_error'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 