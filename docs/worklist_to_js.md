# Worklist Conversion: Py4web to Next.js 15

## Overview

This document outlines the plan to convert the worklist module from the current Py4web MVC implementation to a modern Next.js 15 application using Shadcn UI components. The conversion will maintain all existing functionality while improving the user experience with modern UI components and better state management.

The Next.js project will be created in the `oph4js/` directory, allowing parallel development alongside the existing Py4web implementation.

## Current Architecture

The current worklist implementation uses:

- **Backend**: Py4web MVC framework
- **Frontend**: Bootstrap, jQuery, and custom JavaScript
- **Tables**: Bootstrap Table 1.22
- **State Management**: Custom JavaScript state management (wl-state-manager.js)
- **API**: RESTful endpoints from Py4web
- **Database**: Direct access via pydal

## Target Architecture

The new implementation will use:

- **Framework**: Next.js 15
- **UI Components**: Shadcn UI
- **Tables**: Shadcn Data Table (built on TanStack Table)
- **State Management**: React hooks and context
- **API**: Next.js API routes mirroring existing py4web endpoints
- **Database**: Prisma ORM connecting directly to the existing database

## Project Structure

```tree
/oph4js                       # Root of the Next.js project
  /prisma
    schema.prisma            # Generated from models.py
  /src
    /app
      /api                   # Next.js API routes (mirrors py4web api/ structure)
        /auth
          route.ts
        /worklist
          route.ts
        /batch
          route.ts
        /email
          /send
            route.ts
          /send_with_attachment
            route.ts
        /utils
          route.ts
      /worklist
        /components
          /tables
            WorklistTable.tsx
            UsersTable.tsx
          /modals
            NewUserModal.tsx
            NewWorklistItemModal.tsx
            TransactionRecoveryModal.tsx
          /forms
            UserForm.tsx
            WorklistItemForm.tsx
          WorklistFilters.tsx
          PaginationControls.tsx
        /hooks
          useWorklistState.ts
        page.tsx
        layout.tsx
        actions.ts
    /lib
      /db                    # Prisma client setup
        index.ts
      /utils
        formatters.ts
        timer.ts
    /components
      /ui
        /shadcn-components
```

## Conversion Task List

### 1. Project Setup

- [x] Initialize Next.js 15 project in the oph4js directory
- [x] Set up Shadcn UI
- [x] Configure TypeScript
- [x] Set up ESLint and Prettier
- [x] Add required dependencies
- [x] Set up Prisma ORM
- [x] Generate Prisma schema from models.py

### 2. Database Integration with Prisma

- [x] Analyze models.py to extract schema definition
- [x] Create Prisma schema with appropriate data types and relationships
- [x] Set up database connection in Prisma
- [x] Generate Prisma client
- [x] Create database access utility functions
- [x] Test connection and CRUD operations
- [ ] Add validation to match py4web field validators

### 3. API Layer

- [x] Create API routes mirroring py4web endpoints in `/api/endpoints/`
- [x] Implement auth API endpoints to match `api/endpoints/auth.py`
- [x] Implement worklist API endpoints to match `api/endpoints/worklist.py`
- [x] Implement batch operation endpoints to match transaction handling
- [x] Implement utils endpoints to match `api/endpoints/utils.py`
- [x] Implement email endpoints to match `api/endpoints/email.py`
- [x] Set up error handling matching py4web response format
- [x] Create TypeScript interfaces for API requests and responses

### 4. Core Components

#### Worklist Table

- [x] Create WorklistTable component using Shadcn Table
- [x] Implement server-side pagination
- [x] Add status-based row coloring
- [x] Implement detail view expansion
- [x] Add action buttons
- [x] Implement search functionality
- [x] Add column sorting
- [x] Implement time tracking

#### User Table

- [x] Create UsersTable component
- [x] Implement pagination and search
- [x] Add action buttons

The UsersTable component has been successfully implemented with the following features:

- Created reusable component that displays user data from the database
- Added pagination with server-side data fetching
- Implemented search functionality filtering by name, email, and username
- Added sorting capabilities for most relevant columns
- Created expandable rows to show detailed user information
- Implemented action buttons for view, edit, and delete operations
- Added role badges with color coding by membership type
- Integrated with the Prisma ORM for efficient database access
- Fixed database provider configuration issues and field name conflicts
- Created a dedicated API endpoint for user data with proper filtering

#### Modals

- [ ] Create NewUserModal component
- [ ] Create NewWorklistItemModal component
- [ ] Create TransactionRecoveryModal component
- [ ] Implement form validation

### 5. State Management

- [x] Create useWorklistState hook
- [ ] Implement request queueing
- [ ] Add UI protection during operations
- [ ] Create transaction tracking
- [ ] Implement error recovery
- [ ] Add patient context validation

### 6. Key Features

#### Patient Registration with BeID

- [ ] Implement BeID integration
- [ ] Create patient registration form
- [ ] Add form validation
- [ ] Implement photo handling

#### Combo Management

- [ ] Create combo selection UI
- [ ] Implement transaction-based creation
- [ ] Add error recovery mechanisms
- [ ] Implement transaction history

#### Status Management

- [ ] Create status tracking UI
- [ ] Implement status updates
- [ ] Add status-based styling

#### Time Tracking

- [ ] Implement timer functionality
- [ ] Add waiting time alerts
- [ ] Create time-based UI indicators

### 7. Integration

- [ ] Connect all components
- [ ] Implement page-level state
- [ ] Add client-side navigation
- [ ] Set up data fetching and caching

### 8. Styling and UX

- [ ] Match existing UI aesthetic
- [ ] Improve responsive design
- [ ] Add loading states
- [ ] Implement error states
- [ ] Add success feedback
- [ ] Create consistent styling

### 9. Testing and Optimization

- [ ] Write component tests
- [ ] Add integration tests
- [ ] Implement performance optimization
- [ ] Add accessibility improvements
- [ ] Conduct usability testing

## Feature Details

### Worklist Management

The worklist system manages:

1. **Appointment Management**
   - Patient scheduling
   - Appointment booking
   - Time slot management
   - Provider assignment

2. **Workflow Tracking**
   - Status management (Requested, Processing, Done, Cancelled)
   - Time tracking
   - Status duration alerts

3. **Provider Management**
   - Senior doctor assignment
   - Provider assignment
   - Facility management

4. **Modality Integration**
   - Integration with various devices
   - Controller-specific workflows
   - Multiple modality support

5. **Combo Management**
   - Transaction-based combo creation
   - Batch API support for atomic operations
   - Transaction status tracking
   - Error recovery mechanisms

## Implementation Approach

### Phase 1: Database and API Layer (COMPLETED)

Completed setup of the database connection and API layer:

- ✅ Set up Prisma with schema generated from models.py
- ✅ Created comprehensive schema mapping all tables from models.py
- ✅ Added proper relations between tables for complex data relationships
- ✅ Implemented initial API routes for worklist and batch operations
- ✅ Set up database connection to existing MySQL database
- ✅ Created state management hooks for efficient data handling
- ✅ Built utility functions for formatting and time tracking
- ✅ Configured project according to Next.js 15 best practices

### Phase 2: Core Components (IN PROGRESS)

Building the basic structure and UI components:

- Worklist Table
- User Table
- Basic forms and modals
- API integration

### Phase 3: State Management

Implement the complex state management logic:

- Request queueing
- Transaction tracking
- Error handling
- Status management

### Phase 4: Advanced Features

Add the more complex features:

- BeID integration
- Combo management
- Time tracking
- Transaction recovery

### Phase 5: Refinement

Improve the overall quality:

- Styling and UX improvements
- Performance optimization
- Accessibility
- Testing and bug fixes

## Technical Considerations

### Prisma Database Integration

Converting the Py4web data models to Prisma schema:

```typescript
// Example Prisma schema generated from models.py
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"  // Using MySQL to match existing py4web database
  url      = env("DATABASE_URL")
}

model Facility {
  id               Int        @id @default(autoincrement())
  facility_name    String
  sendingWorklists  Worklist[] @relation("SendingFacility")
  receivingWorklists Worklist[] @relation("ReceivingFacility")
  createdOn        DateTime   @default(now()) @map("created_on")
  createdBy        Int?       @map("created_by")
  modifiedOn       DateTime?  @map("modified_on")
  modifiedBy       Int?       @map("modified_by")
  
  @@map("facility")
}

model Worklist {
  id                Int       @id @default(autoincrement())
  id_auth_user      Int
  sending_app       String    @default("Oph4Py")
  sending_facility  Int
  receiving_app     String    @default("Receiving App")
  receiving_facility Int
  message_unique_id String
  procedure         Int
  provider          Int
  senior            Int
  requested_time    DateTime
  modality_dest     Int
  laterality        String
  status_flag       String
  counter           Int       @default(0)
  warning           String?
  transaction_id    String?
  createdOn         DateTime  @default(now()) @map("created_on")
  createdBy         Int?      @map("created_by")
  modifiedOn        DateTime? @map("modified_on")
  modifiedBy        Int?      @map("modified_by")

  // Relations
  patient           AuthUser   @relation(fields: [id_auth_user], references: [id])
  seniorDoctor      AuthUser   @relation("SeniorDoctor", fields: [senior], references: [id])
  providerDoctor    AuthUser   @relation("ProviderDoctor", fields: [provider], references: [id])
  sendingFacility   Facility   @relation("SendingFacility", fields: [sending_facility], references: [id])
  receivingFacility Facility   @relation("ReceivingFacility", fields: [receiving_facility], references: [id])
  procedureRel      Procedure  @relation(fields: [procedure], references: [id])
  modality          Modality   @relation(fields: [modality_dest], references: [id])
  
  @@map("worklist")
}

// More models for other tables
```

When working with an existing database, Prisma introspection (`npx prisma db pull`) is used to generate an accurate schema that matches the actual database structure. This helps to avoid mismatches between the Prisma schema and the database, which can cause runtime errors.

### State Management

Replace the custom state management with React hooks:

```typescript
// Current approach in wl-state-manager.js
class WorklistStateManager {
  // Complex state management
}

// New approach
function useWorklistState() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Methods for state updates
  const addItem = async (item) => {...};
  const updateItem = async (id, updates) => {...};
  
  return { items, loading, error, addItem, updateItem };
}
```

### API Implementation

The Next.js API routes will mirror the existing py4web endpoints:

```typescript
// /oph4js/src/app/api/worklist/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Extract query parameters to match py4web's query handling
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    // Get total count
    const count = await prisma.worklist.count();
    
    // Fetch data with relationships (matching py4web's @lookup functionality)
    const items = await prisma.worklist.findMany({
      take: limit,
      skip: offset,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        procedure: true,
        modality: true,
        // ... other relations
      },
      orderBy: {
        requested_time: 'desc',
      },
    });
    
    // Format response to match py4web's format
    return NextResponse.json({ 
      count, 
      items: items.map(formatWorklistResponse)
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch worklist items" },
      { status: 500 }
    );
  }
}

// POST implementation for creating worklist items
export async function POST(request: Request) {
  // Implementation similar to py4web's REST API
}
```

### Atomic Operations

Maintain transaction integrity for combo operations:

```typescript
// Batch API handling
async function createCombo(mainItem, relatedItems) {
  const transactionId = generateUniqueId();
  
  try {
    // Use Prisma's transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create main item
      const mainRecord = await tx.worklist.create({
        data: {
          ...mainItem,
          transaction_id: transactionId,
        },
      });
      
      // Create related items
      const relatedRecords = await Promise.all(
        relatedItems.map(item => 
          tx.worklist.create({
            data: {
              ...item,
              transaction_id: transactionId,
            },
          })
        )
      );
      
      // Create transaction audit record
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          operation: 'create',
          table_name: 'worklist',
          status: 'complete',
        }
      });
      
      return { mainRecord, relatedRecords };
    });
    
    return result;
  } catch (error) {
    // Handle transaction failure
    await prisma.transactionAudit.create({
      data: {
        transaction_id: transactionId,
        operation: 'create',
        table_name: 'worklist',
        status: 'failed',
        error_message: String(error),
      }
    });
    
    throw error;
  }
}
```

### Migration Strategy

1. Build the new application in oph4js/ alongside the existing Py4web application
2. Use Prisma to connect to the same database used by Py4web
3. Create API endpoints that mirror the existing py4web structure
4. Test features in parallel
5. Gradually transition users to the new interface
6. Monitor performance and user feedback
7. Address issues and make improvements

## Expected Benefits

- **Improved Performance**: React's virtual DOM and Next.js optimizations
- **Better Developer Experience**: Modern tooling and component approach
- **Enhanced UX**: More responsive and accessible UI
- **Maintainability**: Organized code structure and TypeScript type safety
- **Scalability**: Easier to add new features and components
- **Database Integration**: Prisma provides type-safe database access and migration support
- **API Compatibility**: Next.js API routes can mirror existing py4web endpoints

## Completion Criteria

The migration will be considered complete when:

1. All existing functionality is available in the new application
2. Performance meets or exceeds the current implementation
3. User feedback is positive
4. Code quality passes established standards
5. Documentation is complete
6. Testing coverage is adequate
7. Prisma schema fully represents the existing database structure
8. All API endpoints provide functionality equivalent to the existing py4web endpoints

## Current Status (Updated: 2025-04-15)

### Phase 1 Complete

Phase 1 of the Next.js worklist conversion has been successfully completed:

- ✅ Project initialization with Next.js 15, Prisma ORM, and Tailwind CSS
- ✅ Comprehensive Prisma schema with all database tables mapped from models.py
- ✅ Proper relationships established between tables for complex data structures
- ✅ Authentication data model with all required fields from auth_user table
- ✅ Initial API routes created with transaction support
- ✅ State management hooks for efficient data handling
- ✅ Database connection to existing MySQL database
- ✅ Project structure following Next.js 15 best practices

### Next Steps

1. **Phase 2 (Current Focus)**
   - Implement core UI components (tables, forms, and modals)
   - Connect authentication system
   - Build transaction management interface
   - Implement basic CRUD operations with proper validations

2. **Phase 3 (Upcoming)**
   - Complete state management implementation
   - Add request queueing and transaction tracking
   - Implement error recovery mechanisms
   - Add patient context validation

3. **Phase 4 (Planned)**
   - Implement BeID integration
   - Add combo management
   - Build time tracking functionality
   - Create transaction recovery interface
