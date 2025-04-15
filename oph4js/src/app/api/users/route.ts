import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search') || '';
    const sortColumn = searchParams.get('sortColumn') || 'last_name';
    const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc';
    
    // Build filter conditions
    // Using 'any' type due to complexity of Prisma's filter types
    const whereCondition: any = search 
      ? {
          OR: [
            { last_name: { contains: search } },
            { first_name: { contains: search } },
            { email: { contains: search } },
            { username: { contains: search } },
          ],
        }
      : {};
    
    // Get total count
    const count = await prisma.authUser.count({
      where: whereCondition,
    });
    
    // Handle sorting
    // Using 'any' type due to complexity of Prisma's orderBy types
    let orderBy: any = {};
    
    // Handle special cases for related fields
    if (sortColumn === 'membership') {
      orderBy = { membership: { membership: sortDirection } };
    } else if (sortColumn === 'gender') {
      orderBy = { gender: { sex: sortDirection } };
    } else if (sortColumn === 'last_name') {
      orderBy = { last_name: sortDirection };
    } else if (sortColumn === 'first_name') {
      orderBy = { first_name: sortDirection };
    } else if (sortColumn === 'email') {
      orderBy = { email: sortDirection };
    } else if (sortColumn === 'username') {
      orderBy = { username: sortDirection };
    } else {
      // Default to sorting by last name
      orderBy = { last_name: 'asc' };
    }
    
    // Fetch users with relationships
    const users = await prisma.authUser.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      include: {
        membership: true,
        gender: true,
        marital: true,
        ethny: true,
      },
      orderBy,
    });
    
    // Format response
    return NextResponse.json({ 
      count, 
      users: users.map(user => ({
        ...user,
        // Remove sensitive information
        password: undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 