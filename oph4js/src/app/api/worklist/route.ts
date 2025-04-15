import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

/**
 * GET handler for worklist items with pagination, filtering, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;
    const provider = searchParams.get('provider') ? parseInt(searchParams.get('provider') as string) : undefined;
    const search = searchParams.get('search') || undefined;
    
    // Build filter conditions
    const where: any = {};
    
    if (status) {
      where.status_flag = status;
    }
    
    if (provider) {
      where.provider = provider;
    }
    
    // Add search functionality (patient name search)
    if (search) {
      where.OR = [
        {
          patient: {
            first_name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          patient: {
            last_name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }
    
    // Get total count with filters
    const count = await prisma.worklist.count({
      where
    });
    
    // Get paginated data with relationships
    const items = await prisma.worklist.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        procedureRel: true,
        modality: true,
        providerDoctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        },
        seniorDoctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        }
      },
      orderBy: {
        requested_time: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    return NextResponse.json({ 
      count, 
      items
    });
  } catch (error) {
    console.error('Error fetching worklist items:', error);
    return NextResponse.json(
      { error: "Failed to fetch worklist items" },
      { status: 500 }
    );
  }
}

// Validation schema for worklist item
const WorklistItemSchema = z.object({
  id_auth_user: z.number(),
  procedure: z.number(),
  provider: z.number(),
  senior: z.number(),
  requested_time: z.string().transform(val => new Date(val)),
  modality_dest: z.number(),
  laterality: z.string(),
  status_flag: z.string(),
  sending_facility: z.number(),
  receiving_facility: z.number(),
});

/**
 * POST handler to create a new worklist item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = WorklistItemSchema.parse(body);
    
    // Add the message_unique_id
    const data = {
      ...validatedData,
      message_unique_id: crypto.randomUUID(), // Generate unique ID
      counter: 0,
    };
    
    // Create the worklist item
    const worklistItem = await prisma.worklist.create({
      data,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        procedureRel: true,
        modality: true,
      },
    });
    
    return NextResponse.json(worklistItem, { status: 201 });
  } catch (error) {
    console.error('Error creating worklist item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create worklist item" },
      { status: 500 }
    );
  }
} 