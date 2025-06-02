# Worklist Payment and Transaction System - Implementation Plan

## Overview

This document outlines the implementation plan for adding a comprehensive payment system to the ophthalmology EMR worklist functionality. The system will allow users to process payments for medical procedures, track multiple payment methods, and maintain transaction history.

## Business Requirements

### Core Features

1. **Payment Access**: Add '$' action button to worklist for accessing payment interface
2. **Payment Summary**: Display comprehensive billing and payment status
3. **Fee Code Selection**: Select different reimbursement rates (feecodes other than 0)
4. **Billing Overview**: Show all billing codes with fees and reimbursement amounts
5. **Payment Processing**: Handle multiple payment methods (card, cash, invoice)
6. **Transaction History**: Track all payment transactions for each worklist
7. **Partial Payments**: Support multiple payment transactions per worklist

### User Workflow

1. User clicks '$' action on worklist item
2. System displays payment view with patient summary
3. User selects appropriate feecode for reimbursement calculation
4. System shows billing codes with fees and reimbursement amounts
5. User clicks "Pay" button to open payment modal
6. User enters payment amounts by method (card/cash/invoice)
7. System processes payment and updates transaction history
8. User can view complete transaction history for the worklist

## Database Design

### New Table: worklist_transactions

```sql
CREATE TABLE worklist_transactions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_worklist INTEGER NOT NULL,
    id_auth_user INTEGER NOT NULL,
    transaction_date DATETIME NOT NULL,
    amount_card DECIMAL(10,2) DEFAULT 0.00,
    amount_cash DECIMAL(10,2) DEFAULT 0.00,
    amount_invoice DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'partial', -- 'partial', 'complete', 'overpaid'
    remaining_balance DECIMAL(10,2) DEFAULT 0.00,
    feecode_used INTEGER,
    notes TEXT,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    modified_on DATETIME ON UPDATE CURRENT_TIMESTAMP,
    modified_by INTEGER,
    is_active CHAR(1) DEFAULT 'T',
    
    FOREIGN KEY (id_worklist) REFERENCES worklist(id),
    FOREIGN KEY (id_auth_user) REFERENCES auth_user(id),
    FOREIGN KEY (created_by) REFERENCES auth_user(id),
    FOREIGN KEY (modified_by) REFERENCES auth_user(id),
    
    INDEX idx_worklist_transactions_worklist (id_worklist),
    INDEX idx_worklist_transactions_user (id_auth_user),
    INDEX idx_worklist_transactions_date (transaction_date)
);
```

### Enhanced Views/Queries Needed

1. **Payment Summary View**: Aggregate billing codes fees per worklist
2. **Reimbursement Calculator**: Calculate reimbursement based on feecode
3. **Payment Status**: Current balance and payment completion status

## API Endpoints

### Payment Management Endpoints

```python
# GET /api/worklist/{id}/payment_summary
# Returns: Patient info, total fees, payments made, balance
{
    "patient": {...},
    "worklist_id": 12345,
    "total_fee": 125.50,
    "total_paid": 75.00,
    "remaining_balance": 50.50,
    "payment_status": "partial"
}

# GET /api/feecodes
# Returns: Available fee codes for reimbursement selection
[
    {"code": 1, "description": "Social Security", "rate": 0.80},
    {"code": 2, "description": "Private Insurance", "rate": 0.90},
    {"code": 3, "description": "Self Pay", "rate": 1.00}
]

# GET /api/worklist/{id}/billing_breakdown?feecode={feecode}
# Returns: Billing codes with fees and reimbursement amounts
[
    {
        "nomen_code": 105755,
        "description": "Routine consultation",
        "fee": 45.00,
        "reimbursement": 36.00,
        "secondary_code": 248835,
        "secondary_fee": 27.30,
        "secondary_reimbursement": 21.84
    }
]

# POST /api/worklist/{id}/payment
# Request: Payment transaction data
{
    "amount_card": 30.00,
    "amount_cash": 20.50,
    "amount_invoice": 0.00,
    "feecode_used": 1,
    "notes": "Partial payment"
}
# Response: Transaction confirmation and updated balance

# GET /api/worklist/{id}/transactions
# Returns: Transaction history for worklist
[
    {
        "id": 1,
        "transaction_date": "2025-06-02T10:30:00",
        "amount_card": 30.00,
        "amount_cash": 20.50,
        "total_amount": 50.50,
        "payment_status": "complete",
        "processed_by": "Dr. Smith"
    }
]
```

## Frontend Implementation

### File Structure

```
templates/
  payment/
    payment_view.html           # Main payment interface
    payment_modal.html          # Payment entry modal
    transaction_history.html    # Transaction list partial

static/
  js/
    payment-manager.js          # Payment functionality
    payment-calculator.js       # Fee/reimbursement calculations
  css/
    payment-styles.css          # Payment-specific styling
```

### Payment View Components

#### 1. Patient Summary Section

```html
<div class="payment-summary-card">
    <h4>Payment Summary</h4>
    <div class="row">
        <div class="col-md-6">
            <p><strong>Patient:</strong> {{patient_name}}</p>
            <p><strong>Date:</strong> {{appointment_date}}</p>
            <p><strong>Provider:</strong> {{provider_name}}</p>
        </div>
        <div class="col-md-6">
            <p><strong>Total Due:</strong> €{{total_fee}}</p>
            <p><strong>Paid:</strong> €{{total_paid}}</p>
            <p><strong>Balance:</strong> €{{remaining_balance}}</p>
        </div>
    </div>
</div>
```

#### 2. Fee Code Selection

```html
<div class="feecode-selection">
    <label for="feecode-select">Reimbursement Type:</label>
    <select id="feecode-select" class="form-control">
        <option value="0">Full Price (No Reimbursement)</option>
        <option value="1">Social Security (80%)</option>
        <option value="2">Private Insurance (90%)</option>
        <option value="3">Mixed Coverage</option>
    </select>
</div>
```

#### 3. Billing Codes Table

```html
<table class="table table-striped" id="billing-codes-table">
    <thead>
        <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Fee</th>
            <th>Reimbursement</th>
            <th>Patient Pays</th>
        </tr>
    </thead>
    <tbody id="billing-codes-body">
        <!-- Dynamically populated via JavaScript -->
    </tbody>
</table>
```

#### 4. Payment Modal

```html
<div class="modal" id="payment-modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5>Process Payment</h5>
            </div>
            <div class="modal-body">
                <p><strong>Amount to Pay:</strong> €<span id="amount-to-pay"></span></p>
                <div class="form-group">
                    <label>Card Payment:</label>
                    <input type="number" id="amount-card" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label>Cash Payment:</label>
                    <input type="number" id="amount-cash" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label>Invoice Amount:</label>
                    <input type="number" id="amount-invoice" step="0.01" min="0">
                </div>
                <p><strong>Total:</strong> €<span id="payment-total"></span></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="process-payment">Process Payment</button>
            </div>
        </div>
    </div>
</div>
```

#### 5. Transaction History

```html
<div class="transaction-history">
    <h5>Transaction History</h5>
    <table class="table table-sm">
        <thead>
            <tr>
                <th>Date</th>
                <th>Card</th>
                <th>Cash</th>
                <th>Invoice</th>
                <th>Total</th>
                <th>Processed By</th>
            </tr>
        </thead>
        <tbody id="transaction-history-body">
            <!-- Populated via AJAX -->
        </tbody>
    </table>
</div>
```

### JavaScript Functionality

#### payment-manager.js Key Functions

```javascript
class PaymentManager {
    constructor(worklistId) {
        this.worklistId = worklistId;
        this.currentFeecode = 0;
        this.billingCodes = [];
        this.init();
    }
    
    // Initialize payment interface
    async init() {
        await this.loadPaymentSummary();
        await this.loadFeecodes();
        await this.loadBillingCodes();
        await this.loadTransactionHistory();
        this.bindEvents();
    }
    
    // Load payment summary data
    async loadPaymentSummary() {
        const response = await fetch(`/api/worklist/${this.worklistId}/payment_summary`);
        const data = await response.json();
        this.updateSummaryDisplay(data);
    }
    
    // Handle feecode selection change
    async onFeecodeChange(feecode) {
        this.currentFeecode = feecode;
        await this.loadBillingCodes();
        this.updatePaymentCalculations();
    }
    
    // Load billing codes with reimbursement calculations
    async loadBillingCodes() {
        const response = await fetch(
            `/api/worklist/${this.worklistId}/billing_breakdown?feecode=${this.currentFeecode}`
        );
        this.billingCodes = await response.json();
        this.displayBillingCodes();
    }
    
    // Process payment transaction
    async processPayment(paymentData) {
        const response = await fetch(`/api/worklist/${this.worklistId}/payment`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(paymentData)
        });
        
        if (response.ok) {
            await this.loadPaymentSummary();
            await this.loadTransactionHistory();
            this.closePaymentModal();
            this.showSuccessMessage();
        }
    }
}
```

## Backend Implementation

### Models Enhancement

```python
# Add to models.py
class WorklistTransaction(db.Model):
    tablename = 'worklist_transactions'
    
    id = Field('integer', primary_key=True)
    id_worklist = Field('reference worklist', required=True)
    id_auth_user = Field('reference auth_user', required=True)
    transaction_date = Field('datetime', required=True, default=lambda: datetime.now())
    amount_card = Field('decimal(10,2)', default=0.00)
    amount_cash = Field('decimal(10,2)', default=0.00)
    amount_invoice = Field('decimal(10,2)', default=0.00)
    total_amount = Field('decimal(10,2)', required=True)
    payment_status = Field('string', default='partial')
    remaining_balance = Field('decimal(10,2)', default=0.00)
    feecode_used = Field('integer')
    notes = Field('text')
    created_on = Field('datetime', default=lambda: datetime.now())
    created_by = Field('reference auth_user')
    modified_on = Field('datetime', update=lambda: datetime.now())
    modified_by = Field('reference auth_user')
    is_active = Field('string', default='T', length=1)
```

### Controller Routes

```python
# Add to controllers.py or create payment.py
@app.route('/payment/<int:worklist_id>')
@auth.requires_membership()
def payment_view(worklist_id):
    """Display payment interface for worklist"""
    worklist = db.worklist[worklist_id]
    if not worklist:
        redirect(URL('index'))
    
    return dict(worklist=worklist, worklist_id=worklist_id)

@app.route('/api/worklist/<int:worklist_id>/payment_summary')
@auth.requires_membership()
def api_payment_summary(worklist_id):
    """Get payment summary for worklist"""
    # Calculate total fees from billing_codes
    total_fee = db(db.billing_codes.id_worklist == worklist_id).select(
        db.billing_codes.fee.sum()
    ).first()[db.billing_codes.fee.sum()] or 0
    
    # Calculate total paid from transactions
    total_paid = db(db.worklist_transactions.id_worklist == worklist_id).select(
        db.worklist_transactions.total_amount.sum()
    ).first()[db.worklist_transactions.total_amount.sum()] or 0
    
    return dict(
        worklist_id=worklist_id,
        total_fee=float(total_fee),
        total_paid=float(total_paid),
        remaining_balance=float(total_fee - total_paid)
    )

@app.route('/api/worklist/<int:worklist_id>/payment', methods=['POST'])
@auth.requires_membership()
def api_process_payment(worklist_id):
    """Process payment transaction"""
    data = request.json
    
    # Validate payment data
    total_amount = (data.get('amount_card', 0) + 
                   data.get('amount_cash', 0) + 
                   data.get('amount_invoice', 0))
    
    # Insert transaction record
    transaction_id = db.worklist_transactions.insert(
        id_worklist=worklist_id,
        id_auth_user=auth.user.id,
        amount_card=data.get('amount_card', 0),
        amount_cash=data.get('amount_cash', 0),
        amount_invoice=data.get('amount_invoice', 0),
        total_amount=total_amount,
        feecode_used=data.get('feecode_used'),
        notes=data.get('notes', ''),
        created_by=auth.user.id
    )
    
    # Update payment status
    # Calculate new balance and status
    
    return dict(success=True, transaction_id=transaction_id)
```

## Integration Points

### Worklist Action Integration

#### Add '$' Action Button

```javascript
// In static/js/md_bt.js, add to action buttons:
function addPaymentAction(worklistId) {
    return `<button class="btn btn-success btn-sm" 
                    onclick="openPaymentView(${worklistId})" 
                    title="Payment">
                <i class="fas fa-dollar-sign"></i>
            </button>`;
}

function openPaymentView(worklistId) {
    window.location.href = `/payment/${worklistId}`;
}
```

### Fee Code System

The existing `billing_codes` table already has `feecode` and `secondary_feecode` fields. These represent different reimbursement rates:

- `feecode = 0`: Full price (no reimbursement)
- `feecode = 1`: Social Security reimbursement
- `feecode = 2`: Private insurance reimbursement
- `feecode = 3`: Mixed coverage
- etc.

## Security Considerations

### Access Control

1. **Payment Processing**: Only authorized users can process payments
2. **Transaction Audit**: All transactions logged with user ID and timestamp
3. **Data Validation**: Server-side validation of all payment amounts
4. **Balance Validation**: Prevent overpayments and negative amounts

### Data Protection

1. **Sensitive Data**: Payment amounts and methods stored securely
2. **Audit Trail**: Complete transaction history maintained
3. **User Tracking**: All modifications tracked with user ID
4. **Access Logging**: Payment view access logged for audit

## Testing Strategy

### Unit Tests

1. **Payment Calculations**: Test fee and reimbursement calculations
2. **Transaction Processing**: Test payment transaction creation
3. **Balance Updates**: Test balance calculation and status updates
4. **Data Validation**: Test input validation and error handling

### Integration Tests

1. **API Endpoints**: Test all payment-related API endpoints
2. **Database Operations**: Test transaction CRUD operations
3. **User Authentication**: Test access control and permissions
4. **Fee Code Integration**: Test reimbursement calculations

### User Acceptance Testing

1. **Payment Workflow**: Complete payment process from start to finish
2. **Multiple Payments**: Test partial payments and multiple transactions
3. **Different Fee Codes**: Test various reimbursement scenarios
4. **Error Handling**: Test validation errors and error messages

## Deployment Plan

### Phase 1: Database Setup
- Create `worklist_transactions` table
- Add necessary indexes
- Update database migration scripts

### Phase 2: Backend Implementation
- Add Transaction model to models.py
- Implement payment API endpoints
- Add payment routes to controllers
- Implement fee calculation logic

### Phase 3: Frontend Development
- Create payment view templates
- Implement payment JavaScript functionality
- Add payment action to worklist interface
- Style payment interface

### Phase 4: Integration & Testing
- Integrate with existing worklist system
- Comprehensive testing of all components
- User acceptance testing
- Performance optimization

### Phase 5: Production Deployment
- Deploy database changes
- Deploy application code
- Monitor for issues
- Gather user feedback

## Migration Scripts

### Database Migration

```sql
-- Create worklist_transactions table
CREATE TABLE worklist_transactions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_worklist INTEGER NOT NULL,
    id_auth_user INTEGER NOT NULL,
    transaction_date DATETIME NOT NULL,
    amount_card DECIMAL(10,2) DEFAULT 0.00,
    amount_cash DECIMAL(10,2) DEFAULT 0.00,
    amount_invoice DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'partial',
    remaining_balance DECIMAL(10,2) DEFAULT 0.00,
    feecode_used INTEGER,
    notes TEXT,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    modified_on DATETIME ON UPDATE CURRENT_TIMESTAMP,
    modified_by INTEGER,
    is_active CHAR(1) DEFAULT 'T',
    
    FOREIGN KEY (id_worklist) REFERENCES worklist(id),
    FOREIGN KEY (id_auth_user) REFERENCES auth_user(id),
    FOREIGN KEY (created_by) REFERENCES auth_user(id),
    FOREIGN KEY (modified_by) REFERENCES auth_user(id)
);

-- Add indexes
CREATE INDEX idx_worklist_transactions_worklist ON worklist_transactions(id_worklist);
CREATE INDEX idx_worklist_transactions_user ON worklist_transactions(id_auth_user);
CREATE INDEX idx_worklist_transactions_date ON worklist_transactions(transaction_date);
```

## Future Enhancements

### Advanced Features

1. **Payment Plans**: Support for installment payments
2. **Insurance Integration**: Direct insurance billing
3. **Receipt Generation**: PDF receipt generation
4. **Payment Reminders**: Automated payment reminder system
5. **Reporting**: Comprehensive payment and revenue reporting
6. **Mobile Payments**: Support for mobile payment methods
7. **Refund Processing**: Handle payment reversals and refunds

### Analytics & Reporting

1. **Payment Analytics**: Revenue trends and payment method analysis
2. **Outstanding Balances**: Reports on unpaid amounts
3. **Provider Performance**: Payment collection metrics per provider
4. **Insurance Reimbursement**: Analysis of reimbursement rates and timing

## Conclusion

This implementation plan provides a comprehensive payment and transaction system for the ophthalmology EMR worklist functionality. The system supports multiple payment methods, tracks complete transaction history, and integrates seamlessly with the existing billing code structure.

The modular design allows for incremental implementation and future enhancements while maintaining data integrity and audit trails required for medical billing systems.

Key benefits:
- **Complete Payment Tracking**: Full transaction history per worklist
- **Flexible Payment Methods**: Support for card, cash, and invoice payments
- **Reimbursement Integration**: Dynamic fee calculations based on fee codes
- **Audit Compliance**: Complete audit trail for all payment activities
- **User-Friendly Interface**: Intuitive payment workflow for medical staff
- **Scalable Architecture**: Foundation for future payment system enhancements 