import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Batch API endpoint for atomic operations
 * This endpoint allows creating multiple worklist items in a single transaction
 * It's used for "combo" operations where multiple related items need to be created atomically
 */
export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();
    
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid batch request. Expected array of items." },
        { status: 400 }
      );
    }
    
    // Generate a transaction ID for tracking
    const transactionId = crypto.randomUUID();
    
    // Create all items in a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const createdItems = [];
      
      for (const item of items) {
        // Add transaction ID to each item
        const data = {
          ...item,
          transaction_id: transactionId,
          message_unique_id: item.message_unique_id || crypto.randomUUID()
        };
        
        const createdItem = await tx.worklist.create({
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
        
        createdItems.push(createdItem);
      }
      
      // Create a transaction audit record
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          operation: 'create',
          table_name: 'worklist',
          status: 'complete',
          created_on: new Date(),
        }
      });
      
      return createdItems;
    });
    
    return NextResponse.json({
      transaction_id: transactionId,
      status: 'complete',
      items: result
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in batch operation:', error);
    
    // Create error audit record
    try {
      await prisma.transactionAudit.create({
        data: {
          transaction_id: crypto.randomUUID(),
          operation: 'create',
          table_name: 'worklist',
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          created_on: new Date(),
        }
      });
    } catch (auditError) {
      console.error('Error creating audit record:', auditError);
    }
    
    return NextResponse.json(
      { error: "Batch operation failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 